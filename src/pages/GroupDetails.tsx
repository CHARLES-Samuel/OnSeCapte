import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGroupDetails } from '../hooks/useGroupDetails';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import { useMemberManagement } from '../hooks/useMemberManagement';
import type { Event, EventCategory } from '../models/Event';
import { Loader2, Users, BarChart3, CalendarDays, UserX } from 'lucide-react';
import { CreateEventModal } from '../components/features/events/CreateEventModal';
import { EditEventModal } from '../components/features/events/EditEventModal';
import { TransferOwnershipModal } from '../components/features/groups/TransferOwnershipModal';
import { EditGroupModal } from '../components/features/groups/EditGroupModal';
import { MemberManagementPanel } from '../components/features/groups/MemberManagementPanel';
import { GroupStatsPanel } from '../components/features/groups/GroupStatsPanel';
import type { MemberProfile } from '../models/Group';
import { GroupHeader } from '../components/features/groups/GroupHeader';
import { GroupEventsTab, type EventFilterState } from '../components/features/groups/GroupEventsTab';
import { ConfirmModal, type ConfirmVariant } from '../components/ui/ConfirmModal';
import { computeGroupEventStats } from '../utils/eventStatsUtils';
import { useGroupPlannings } from '../hooks/useGroupPlannings';
import { GroupPlanningTab } from '../components/features/groups/GroupPlanningTab';

type ActiveTab = 'events' | 'planning' | 'members' | 'stats';

const CATEGORIES: (EventCategory | 'Toutes')[] = [
  'Toutes', 'Restaurant', 'Jeux de rôle', 'Soirée', 'Repas', 'Sport', 'Gaming', 'Autres'
];

export const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    group,
    memberProfiles,
    loading: groupLoading,
    error: groupError,
    deleteGroup,
    transferOwnership,
    updateGroupDetails,
    refreshGroup,
  } = useGroupDetails(groupId);

  const isOwner = group?.createdBy === user?.uid;
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent, updateParticipation } = useEvents(groupId, isOwner);
  const { plannings, updatePlanning } = useGroupPlannings(groupId);

  const {
    loading: memberActionLoading,
    error: memberActionError,
    kickMember,
    banMember,
    unbanMember,
    leaveGroup,
    clearError,
  } = useMemberManagement({
    groupId: groupId ?? '',
    onSuccess: () => refreshGroup(),
  });

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'planning' || tab === 'events' || tab === 'members' || tab === 'stats') {
      return tab as ActiveTab;
    }
    return 'events';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'planning' || tab === 'events' || tab === 'members' || tab === 'stats') {
      setActiveTab(tab as ActiveTab);
    }
  }, [location.search]);
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'Toutes'>('Toutes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeState, setActiveState] = useState<EventFilterState>('Tous');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: ConfirmVariant;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const memberProfilesMap = useMemo(() => {
    const map: Record<string, MemberProfile> = { ...memberProfiles };
    if (user) {
      map[user.uid] = { 
        uid: user.uid, 
        displayName: user.displayName || user.email?.split('@')[0] || 'Vous', 
        photoURL: user.photoURL 
      };
    }
    events.forEach(e => {
      if (e.createdBy && e.createdByName && !map[e.createdBy]) {
        map[e.createdBy] = { 
          uid: e.createdBy, 
          displayName: e.createdByName,
          photoURL: e.createdByPhoto 
        };
      }
    });
    return map;
  }, [events, user, memberProfiles]);

  const groupStats = useMemo(() => computeGroupEventStats(events, memberProfilesMap), [events, memberProfilesMap]);

  const getCreatorProfile = (e: Event): { name: string; photoUrl?: string | null } => {
    if (e.createdBy === user?.uid) return { name: 'Vous', photoUrl: user?.photoURL };
    const profile = memberProfilesMap[e.createdBy];
    if (profile) return { name: profile.displayName, photoUrl: profile.photoURL };
    if (e.createdByName) return { name: e.createdByName, photoUrl: e.createdByPhoto };
    return { name: 'Un membre' };
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeCategory !== 'Toutes') {
      filtered = filtered.filter(e => e.category === activeCategory);
    }
    if (activeState !== 'Tous') {
      const stateMapping = {
        'En recherche': 'sondage',
        'À venir': 'planifie',
        'Passés': 'passe',
      } as const;
      filtered = filtered.filter(e => e.state === stateMapping[activeState]);
    }
    return filtered.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
  }, [events, activeCategory, activeState, sortOrder]);

  const handleDeleteGroupClick = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Supprimer le groupe',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le groupe "${group?.name}" ? Cette action entraînera la perte de tous ses événements.`,
      confirmText: 'Supprimer le groupe',
      variant: 'danger',
      onConfirm: async () => {
        const success = await deleteGroup();
        if (success) navigate('/dashboard');
      },
    });
  };

  const handleDeleteEventClick = (targetEvent: Event) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Supprimer l\'événement',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'événement "${targetEvent.title}" ?`,
      confirmText: 'Supprimer l\'événement',
      variant: 'danger',
      onConfirm: async () => {
        await deleteEvent(targetEvent.id);
      },
    });
  };

  const handleUpdateParticipation = async (targetEvent: Event, participation: import('../models/Event').EventParticipation) => {
    // Si l'utilisateur participe à un sondage et n'a pas rempli son planning
    if (participation === 'participating' && targetEvent.state === 'sondage') {
      const userPlanning = plannings.find(p => p.userId === user?.uid);
      const hasFilledPlanning = userPlanning && Object.keys(userPlanning.dates).length > 0;
      
      if (!hasFilledPlanning) {
        setConfirmModalConfig({
          isOpen: true,
          title: 'Planning non rempli',
          message: 'Pour participer à un événement dont la date est à déterminer, merci de remplir tes disponibilités dans l\'onglet Planning.',
          confirmText: 'Aller au planning',
          variant: 'danger',
          onConfirm: () => {
            setActiveTab('planning');
            setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
          },
        });
        return; // On ne met pas à jour la participation tout de suite
      }
    }
    await updateParticipation(targetEvent.id, participation);
  };

  const handleLeaveGroup = async (): Promise<boolean> => {
    const success = await leaveGroup();
    if (success) navigate('/dashboard');
    return success;
  };

  if (groupLoading && !group) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" aria-label="Chargement du groupe" />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">
        {groupError || 'Groupe introuvable'}
      </div>
    );
  }

  // Vérification systématique d'exclusion / révocation en temps réel
  const isMember = !!(user && group.members?.includes(user.uid));
  if (!isMember) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-800/80 border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <UserX className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Accès révoqué</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Vous ne faites plus partie du groupe <strong className="text-white">{group.name}</strong>. Vos autorisations ont été immédiatement révoquées par le gérant.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition shadow-lg shadow-primary-600/20"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: 'events' as const, label: 'Événements', icon: CalendarDays },
    { key: 'planning' as const, label: 'Planning', icon: CalendarDays },
    { key: 'members' as const, label: 'Membres', icon: Users },
    { key: 'stats' as const, label: 'Statistiques', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-3 sm:p-6 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header du groupe (Bannière, Photo, Titre, Actions) */}
        <GroupHeader
          group={group}
          isOwner={isOwner}
          onBack={() => navigate('/dashboard')}
          onEditGroup={() => setIsEditGroupModalOpen(true)}
          onTransferOwnership={() => setIsTransferModalOpen(true)}
          onDeleteGroup={handleDeleteGroupClick}
        />

        {/* Onglets avec défilement horizontal fluide et ergonomie tactile mobile */}
        <div className="w-full overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <div
            role="tablist"
            aria-label="Sections du groupe"
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/40 border border-slate-800 p-1.5 rounded-2xl min-w-max sm:min-w-0 sm:w-full"
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                aria-controls={`tabpanel-${key}`}
                id={`tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 sm:shrink min-h-[44px] touch-manipulation ${
                  activeTab === key
                    ? 'bg-slate-700 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu Onglet : Événements */}
        <div
          role="tabpanel"
          id="tabpanel-events"
          aria-labelledby="tab-events"
          hidden={activeTab !== 'events'}
        >
          <GroupEventsTab
            events={events}
            filteredEvents={filteredEvents}
            eventsLoading={eventsLoading}
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            activeState={activeState}
            onSelectState={setActiveState}
            sortOrder={sortOrder}
            onToggleSortOrder={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            onCreateEvent={() => setIsCreateModalOpen(true)}
            groupId={groupId ?? ''}
            currentUserId={user?.uid}
            isOwner={isOwner}
            getCreatorProfile={getCreatorProfile}
            onEditEvent={(e) => {
              setEventToEdit(e);
              setIsEditModalOpen(true);
            }}
            onDeleteEvent={handleDeleteEventClick}
            onUpdateParticipation={handleUpdateParticipation}
          />
        </div>

        {/* Contenu Onglet : Planning */}
        <div
          role="tabpanel"
          id="tabpanel-planning"
          aria-labelledby="tab-planning"
          hidden={activeTab !== 'planning'}
        >
          {user && (
            <GroupPlanningTab
              groupId={group.id}
              currentUserId={user.uid}
              plannings={plannings}
              onUpdatePlanning={updatePlanning}
            />
          )}
        </div>
        {/* Contenu Onglet : Membres */}
        <div
          role="tabpanel"
          id="tabpanel-members"
          aria-labelledby="tab-members"
          hidden={activeTab !== 'members'}
        >
          <MemberManagementPanel
            group={group}
            memberProfilesMap={memberProfilesMap}
            currentUserId={user?.uid ?? ''}
            isOwner={isOwner}
            onKick={kickMember}
            onBan={banMember}
            onUnban={unbanMember}
            onLeave={handleLeaveGroup}
            actionLoading={memberActionLoading}
            actionError={memberActionError}
            onClearError={clearError}
          />
        </div>

        {/* Contenu Onglet : Statistiques */}
        <div
          role="tabpanel"
          id="tabpanel-stats"
          aria-labelledby="tab-stats"
          hidden={activeTab !== 'stats'}
        >
          <GroupStatsPanel stats={groupStats} />
        </div>
      </div>

      {/* Modales */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createEvent}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEventToEdit(null);
        }}
        event={eventToEdit}
        onSubmit={(data) => eventToEdit ? updateEvent(eventToEdit.id, data) : Promise.resolve(false)}
      />

      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        members={group.members}
        memberProfilesMap={memberProfilesMap}
        currentOwnerId={group.createdBy}
        onTransfer={transferOwnership}
      />

      {isOwner && (
        <EditGroupModal
          isOpen={isEditGroupModalOpen}
          onClose={() => setIsEditGroupModalOpen(false)}
          group={group}
          onSubmit={updateGroupDetails}
        />
      )}

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
      />
    </div>
  );
};
