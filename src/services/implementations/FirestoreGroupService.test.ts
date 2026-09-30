import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreGroupService } from './FirestoreGroupService';
import * as firestore from 'firebase/firestore';

// Mock Firestore functions
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    writeBatch: vi.fn(),
    arrayRemove: vi.fn((val) => ({ type: 'arrayRemove', val })),
    arrayUnion: vi.fn((val) => ({ type: 'arrayUnion', val })),
    deleteField: vi.fn(() => ({ type: 'deleteField' })),
    updateDoc: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(),
    Timestamp: { now: vi.fn() },
    documentId: vi.fn(),
  };
});

vi.mock('../../config/firebase', () => ({
  db: {},
}));

describe('FirestoreGroupService - Transfert de propriété des événements', () => {
  let groupService: FirestoreGroupService;
  let batchUpdates: Array<{ ref: any; payload: any }>;
  let batchDeletes: any[];
  let mockBatch: any;

  const mockGroupId = 'group-123';
  const mockOwnerId = 'owner-456';
  const mockMemberId = 'member-789';
  const mockOtherMemberId = 'other-111';

  beforeEach(() => {
    vi.clearAllMocks();
    groupService = new FirestoreGroupService();
    batchUpdates = [];
    batchDeletes = [];

    mockBatch = {
      update: vi.fn((ref, payload) => batchUpdates.push({ ref, payload })),
      delete: vi.fn((ref) => batchDeletes.push(ref)),
      commit: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(firestore.writeBatch).mockReturnValue(mockBatch);
  });

  const setupMocks = (options: {
    groupExists?: boolean;
    groupData?: any;
    ownerUserExists?: boolean;
    ownerUserData?: any;
    events?: Array<{ id: string; ref: any; data: any }>;
  }) => {
    const groupSnap = {
      exists: () => options.groupExists !== false,
      data: () =>
        options.groupData || {
          createdBy: mockOwnerId,
          members: [mockOwnerId, mockMemberId, mockOtherMemberId],
        },
    };

    const ownerSnap = {
      exists: () => options.ownerUserExists !== false,
      data: () =>
        options.ownerUserData || {
          displayName: 'Alice Propriétaire',
          photoURL: 'https://example.com/alice.jpg',
        },
    };

    vi.mocked(firestore.doc).mockImplementation((_db, ...pathSegments) => {
      const fullPath = pathSegments.join('/');
      return { path: fullPath } as any;
    });

    vi.mocked(firestore.getDoc).mockImplementation(async (ref: any) => {
      if (ref.path === `groups/${mockGroupId}`) return groupSnap as any;
      if (ref.path === `users/${mockOwnerId}`) return ownerSnap as any;
      return { exists: () => false, data: () => ({}) } as any;
    });

    const eventDocs = (options.events || []).map((e) => ({
      id: e.id,
      ref: e.ref || { path: `events/${e.id}` },
      data: () => e.data,
    }));

    vi.mocked(firestore.getDocs).mockImplementation(async () => {
      return {
        forEach: (callback: any) => eventDocs.forEach(callback),
        size: eventDocs.length,
      } as any;
    });
  };

  it('transfère les événements créés par le membre au gérant lorsqu’il quitte le groupe', async () => {
    const eventCreatedByMemberRef = { path: 'events/event-1' };
    const eventCreatedByOtherRef = { path: 'events/event-2' };

    setupMocks({
      events: [
        {
          id: 'event-1',
          ref: eventCreatedByMemberRef,
          data: {
            createdBy: mockMemberId,
            createdByName: 'Bob Membre',
            participations: {
              [mockMemberId]: 'participating',
              [mockOtherMemberId]: 'participating',
            },
          },
        },
        {
          id: 'event-2',
          ref: eventCreatedByOtherRef,
          data: {
            createdBy: mockOtherMemberId,
            createdByName: 'Charlie',
            participations: {
              [mockMemberId]: 'not_participating',
              [mockOtherMemberId]: 'participating',
            },
          },
        },
      ],
    });

    await groupService.leaveGroup(mockGroupId, mockMemberId);

    // 1. Mise à jour du groupe pour retirer le membre
    expect(mockBatch.update).toHaveBeenCalledWith(
      expect.objectContaining({ path: `groups/${mockGroupId}` }),
      expect.objectContaining({
        members: expect.objectContaining({ type: 'arrayRemove', val: mockMemberId }),
      })
    );

    // 2. Transfert de l'événement créé par le membre sortant au propriétaire du groupe
    const event1Update = batchUpdates.find((u) => u.ref.path === 'events/event-1');
    expect(event1Update).toBeDefined();
    expect(event1Update?.payload.createdBy).toBe(mockOwnerId);
    expect(event1Update?.payload.createdByName).toBe('Alice Propriétaire');
    expect(event1Update?.payload.createdByPhoto).toBe('https://example.com/alice.jpg');
    // La participation du membre sortant doit être supprimée
    expect(event1Update?.payload[`participations.${mockMemberId}`]).toEqual({ type: 'deleteField' });

    // 3. Sur l'événement créé par un autre membre, seule la participation du membre sortant est retirée
    const event2Update = batchUpdates.find((u) => u.ref.path === 'events/event-2');
    expect(event2Update).toBeDefined();
    expect(event2Update?.payload.createdBy).toBeUndefined(); // Propriété non modifiée
    expect(event2Update?.payload[`participations.${mockMemberId}`]).toEqual({ type: 'deleteField' });

    // 4. Nettoyage du planning du membre sortant
    expect(mockBatch.delete).toHaveBeenCalledWith(
      expect.objectContaining({ path: `groups/${mockGroupId}/plannings/${mockMemberId}` })
    );

    // 5. Commit du batch
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it('transfère les événements créés par le membre au gérant lors d’une exclusion (kick)', async () => {
    const eventCreatedByMemberRef = { path: 'events/event-kick' };

    setupMocks({
      events: [
        {
          id: 'event-kick',
          ref: eventCreatedByMemberRef,
          data: {
            createdBy: mockMemberId,
            createdByName: 'Bob Kicked',
            participations: {
              [mockMemberId]: 'participating',
            },
          },
        },
      ],
    });

    await groupService.kickMember(mockGroupId, mockOwnerId, mockMemberId);

    // Vérifie le retrait des membres du groupe
    expect(mockBatch.update).toHaveBeenCalledWith(
      expect.objectContaining({ path: `groups/${mockGroupId}` }),
      expect.objectContaining({
        members: expect.objectContaining({ type: 'arrayRemove', val: mockMemberId }),
      })
    );

    // Vérifie le transfert de propriété
    const eventUpdate = batchUpdates.find((u) => u.ref.path === 'events/event-kick');
    expect(eventUpdate).toBeDefined();
    expect(eventUpdate?.payload.createdBy).toBe(mockOwnerId);
    expect(eventUpdate?.payload.createdByName).toBe('Alice Propriétaire');
    expect(eventUpdate?.payload[`participations.${mockMemberId}`]).toEqual({ type: 'deleteField' });

    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it('transfère les événements créés par le membre au gérant lors d’un bannissement (ban)', async () => {
    const eventCreatedByMemberRef = { path: 'events/event-ban' };

    setupMocks({
      events: [
        {
          id: 'event-ban',
          ref: eventCreatedByMemberRef,
          data: {
            createdBy: mockMemberId,
            createdByName: 'Bob Banned',
            participations: {
              [mockMemberId]: 'participating',
            },
          },
        },
      ],
    });

    await groupService.banMember(mockGroupId, mockOwnerId, mockMemberId);

    // Vérifie le retrait des membres + ajout aux bannedMemberIds
    expect(mockBatch.update).toHaveBeenCalledWith(
      expect.objectContaining({ path: `groups/${mockGroupId}` }),
      expect.objectContaining({
        members: expect.objectContaining({ type: 'arrayRemove', val: mockMemberId }),
        bannedMemberIds: expect.objectContaining({ type: 'arrayUnion', val: mockMemberId }),
      })
    );

    // Vérifie le transfert de propriété
    const eventUpdate = batchUpdates.find((u) => u.ref.path === 'events/event-ban');
    expect(eventUpdate).toBeDefined();
    expect(eventUpdate?.payload.createdBy).toBe(mockOwnerId);
    expect(eventUpdate?.payload.createdByName).toBe('Alice Propriétaire');
    expect(eventUpdate?.payload[`participations.${mockMemberId}`]).toEqual({ type: 'deleteField' });

    expect(mockBatch.commit).toHaveBeenCalled();
  });
});
