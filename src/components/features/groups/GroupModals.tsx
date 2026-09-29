import React from 'react';
import type { Event, CreateEventDTO } from '../../../models/Event';
import type { Group, MemberProfile, UpdateGroupDTO } from '../../../models/Group';
import { CreateEventModal } from '../events/CreateEventModal';
import { EditEventModal } from '../events/EditEventModal';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import { EditGroupModal } from './EditGroupModal';
import { ConfirmModal, type ConfirmVariant } from '../../ui/ConfirmModal';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => Promise<void> | void;
}

interface GroupModalsProps {
  // Création d'événement
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onCreateEvent: (data: Omit<CreateEventDTO, "groupId">) => Promise<boolean | undefined>;

  // Édition d'événement
  isEditModalOpen: boolean;
  onCloseEditModal: () => void;
  eventToEdit: Event | null;
  onUpdateEvent: (data: Partial<CreateEventDTO>) => Promise<boolean>;

  // Transfert de propriété
  isTransferModalOpen: boolean;
  onCloseTransferModal: () => void;
  group: Group;
  memberProfilesMap: Record<string, MemberProfile>;
  onTransferOwnership: (newOwnerUid: string) => Promise<boolean>;

  // Édition du groupe
  isOwner: boolean;
  isEditGroupModalOpen: boolean;
  onCloseEditGroupModal: () => void;
  onUpdateGroupDetails: (
    data: UpdateGroupDTO,
    photoFile?: File,
    bannerFile?: File
  ) => Promise<boolean>;

  // Modal de confirmation générique
  confirmModalConfig: ConfirmModalState;
  onCloseConfirmModal: () => void;
}

export const GroupModals: React.FC<GroupModalsProps> = ({
  isCreateModalOpen,
  onCloseCreateModal,
  onCreateEvent,
  isEditModalOpen,
  onCloseEditModal,
  eventToEdit,
  onUpdateEvent,
  isTransferModalOpen,
  onCloseTransferModal,
  group,
  memberProfilesMap,
  onTransferOwnership,
  isOwner,
  isEditGroupModalOpen,
  onCloseEditGroupModal,
  onUpdateGroupDetails,
  confirmModalConfig,
  onCloseConfirmModal,
}) => {
  return (
    <>
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
        onSubmit={onCreateEvent}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        event={eventToEdit}
        onSubmit={onUpdateEvent}
      />

      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={onCloseTransferModal}
        members={group.members}
        memberProfilesMap={memberProfilesMap}
        currentOwnerId={group.createdBy}
        onTransfer={onTransferOwnership}
      />

      {isOwner && (
        <EditGroupModal
          isOpen={isEditGroupModalOpen}
          onClose={onCloseEditGroupModal}
          group={group}
          onSubmit={onUpdateGroupDetails}
        />
      )}

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={onCloseConfirmModal}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
      />
    </>
  );
};
