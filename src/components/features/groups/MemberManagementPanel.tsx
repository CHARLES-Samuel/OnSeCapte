import React, { useState } from 'react';
import { UserX, Shield, ShieldOff, UserMinus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { Group } from '../../../models/Group';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { MemberRow } from './MemberRow';

interface MemberManagementPanelProps {
  group: Group;
  memberProfilesMap: Record<string, import('../../../models/Group').MemberProfile>;
  currentUserId: string;
  isOwner: boolean;
  onKick: (uid: string) => Promise<boolean>;
  onBan: (uid: string) => Promise<boolean>;
  onUnban: (uid: string) => Promise<boolean>;
  onLeave: () => Promise<boolean>;
  actionLoading: boolean;
  actionError: string | null;
  onClearError: () => void;
}

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  variant: 'danger' | 'warning';
  onConfirm: () => Promise<void>;
}

const EMPTY_CONFIRM: ConfirmConfig = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  variant: 'danger',
  onConfirm: async () => {},
};

export const MemberManagementPanel: React.FC<MemberManagementPanelProps> = ({
  group,
  memberProfilesMap,
  currentUserId,
  isOwner,
  onKick,
  onBan,
  onUnban,
  onLeave,
  actionLoading,
  actionError,
  onClearError,
}) => {
  const [showBanned, setShowBanned] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>(EMPTY_CONFIRM);

  const closeConfirm = () => setConfirmConfig(EMPTY_CONFIRM);

  const memberName = (uid: string) =>
    uid === currentUserId
      ? 'Vous'
      : memberProfilesMap[uid]?.displayName ?? `Utilisateur (${uid.slice(0, 6)}…)`;

  const memberPhoto = (uid: string) => memberProfilesMap[uid]?.photoURL;

  const openKickConfirm = (uid: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Exclure le membre',
      message: `Êtes-vous sûr de vouloir exclure "${memberName(uid)}" ? Il pourra rejoindre le groupe à nouveau via le code d'invitation.`,
      confirmText: 'Exclure',
      variant: 'warning',
      onConfirm: async () => { await onKick(uid); closeConfirm(); },
    });
  };

  const openBanConfirm = (uid: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Bannir le membre',
      message: `Êtes-vous sûr de vouloir bannir définitivement "${memberName(uid)}" ? Il ne pourra plus rejoindre ce groupe, même avec le code d'invitation.`,
      confirmText: 'Bannir',
      variant: 'danger',
      onConfirm: async () => { await onBan(uid); closeConfirm(); },
    });
  };

  const openUnbanConfirm = (uid: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Lever le bannissement',
      message: `Voulez-vous lever le bannissement de "${memberName(uid)}" ? Il pourra rejoindre le groupe via le code d'invitation.`,
      confirmText: 'Débannir',
      variant: 'warning',
      onConfirm: async () => { await onUnban(uid); closeConfirm(); },
    });
  };

  const openLeaveConfirm = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Quitter le groupe',
      message: `Êtes-vous sûr de vouloir quitter le groupe "${group.name}" ? Vous devrez utiliser le code d'invitation pour rejoindre à nouveau.`,
      confirmText: 'Quitter le groupe',
      variant: 'warning',
      onConfirm: async () => { await onLeave(); closeConfirm(); },
    });
  };

  const activeMembers = group.members.filter(uid => uid !== group.createdBy);
  const bannedCount = group.bannedMemberIds.length;

  return (
    <section
      aria-label="Gestion des membres"
      className="rounded-2xl border border-slate-800 bg-slate-800/40 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-400" aria-hidden="true" />
          Membres du groupe
          <span className="text-sm font-normal text-slate-400">({group.members.length})</span>
        </h2>

        {/* Bouton quitter pour les membres non-gérants */}
        {!isOwner && (
          <button
            onClick={openLeaveConfirm}
            disabled={actionLoading}
            aria-label="Quitter le groupe"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition disabled:opacity-50"
          >
            <UserMinus className="w-4 h-4" aria-hidden="true" />
            <span>Quitter</span>
          </button>
        )}

        {/* Info gérant : ne peut pas quitter directement */}
        {isOwner && (
          <span className="text-xs text-slate-500 italic hidden sm:block">
            Transférez la propriété pour quitter
          </span>
        )}
      </div>

      {/* Erreur */}
      {actionError && (
        <div
          role="alert"
          className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{actionError}</span>
          <button
            onClick={onClearError}
            aria-label="Fermer le message d'erreur"
            className="ml-auto text-red-400 hover:text-red-300 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Liste des membres actifs */}
      <ul className="divide-y divide-slate-800/60 px-5 py-3" aria-label="Liste des membres actifs">
        {/* Gérant */}
        <MemberRow
          uid={group.createdBy}
          name={memberName(group.createdBy)}
          photoUrl={memberPhoto(group.createdBy)}
          badge="Gérant"
          badgeClass="bg-amber-500/20 text-amber-400 border-amber-500/30"
          isCurrentUser={group.createdBy === currentUserId}
        />

        {/* Autres membres */}
        {activeMembers.map(uid => (
          <MemberRow
            key={uid}
            uid={uid}
            name={memberName(uid)}
            photoUrl={memberPhoto(uid)}
            isCurrentUser={uid === currentUserId}
            actions={
              isOwner && uid !== currentUserId ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => openKickConfirm(uid)}
                    disabled={actionLoading}
                    aria-label={`Exclure ${memberName(uid)} du groupe`}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-40 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Exclure temporairement"
                  >
                    <UserX className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openBanConfirm(uid)}
                    disabled={actionLoading}
                    aria-label={`Bannir définitivement ${memberName(uid)}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Bannir définitivement"
                  >
                    <Shield className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : null
            }
          />
        ))}
      </ul>

      {/* Section membres bannis (gérant uniquement) */}
      {isOwner && (
        <div className="border-t border-slate-800/60">
          <button
            onClick={() => setShowBanned(v => !v)}
            aria-expanded={showBanned}
            aria-controls="banned-members-list"
            className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/30 transition"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" aria-hidden="true" />
              Membres bannis ({bannedCount})
            </span>
            {showBanned
              ? <ChevronUp className="w-4 h-4" aria-hidden="true" />
              : <ChevronDown className="w-4 h-4" aria-hidden="true" />
            }
          </button>

          {showBanned && (
            <ul
              id="banned-members-list"
              className="divide-y divide-slate-800/60 px-5 pb-3"
              aria-label="Liste des membres bannis"
            >
              {bannedCount === 0 ? (
                <li className="py-3 text-sm text-slate-500 text-center">Aucun membre banni.</li>
              ) : (
                group.bannedMemberIds.map(uid => (
                  <MemberRow
                    key={uid}
                    uid={uid}
                    name={memberName(uid)}
                    photoUrl={memberPhoto(uid)}
                    badge="Banni"
                    badgeClass="bg-red-500/20 text-red-400 border-red-500/30"
                    isCurrentUser={false}
                    actions={
                      <button
                        onClick={() => openUnbanConfirm(uid)}
                        disabled={actionLoading}
                        aria-label={`Lever le bannissement de ${memberName(uid)}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition disabled:opacity-40"
                      >
                        <ShieldOff className="w-3.5 h-3.5" aria-hidden="true" />
                        Débannir
                      </button>
                    }
                  />
                ))
              )}
            </ul>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
      />
    </section>
  );
};
