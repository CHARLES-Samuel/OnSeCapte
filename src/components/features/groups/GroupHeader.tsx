import React from 'react';
import { ArrowLeft, Users, Edit2, UserCheck, Trash2 } from 'lucide-react';
import type { Group } from '../../../models/Group';
import { InviteLinkButton } from './InviteLinkButton';
import { MarkdownView } from '../../ui/MarkdownView';

interface GroupHeaderProps {
  group: Group;
  isOwner: boolean;
  onBack: () => void;
  onEditGroup: () => void;
  onTransferOwnership: () => void;
  onDeleteGroup: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  isOwner,
  onBack,
  onEditGroup,
  onTransferOwnership,
  onDeleteGroup,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 overflow-hidden relative">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        aria-label="Retour au tableau de bord"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center justify-center p-2.5 bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md text-white border border-white/10 rounded-full transition shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Bannière */}
      {group.bannerUrl ? (
        <div className="w-full h-32 md:h-56 bg-slate-700 relative">
          <img
            src={group.bannerUrl}
            alt={`Bannière du groupe ${group.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-24 md:h-32 bg-gradient-to-r from-slate-800 to-slate-800/50" />
      )}

      <div className="p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          {/* Photo + nom */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 -mt-16 sm:-mt-20 md:-mt-24 relative z-10">
            {group.photoUrl ? (
              <img
                src={group.photoUrl}
                alt={`Photo du groupe ${group.name}`}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-2xl shrink-0 border-4 border-slate-900 bg-slate-900"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-800 shadow-2xl shrink-0 border-4 border-slate-900 flex items-center justify-center">
                <Users className="w-10 h-10 text-slate-600" aria-hidden="true" />
              </div>
            )}
            <div className="flex flex-col items-center sm:items-start mb-1 sm:mb-2 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {group.name}
              </h1>
            </div>
          </div>

          {/* Actions du header */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 md:gap-3 relative z-10 w-full sm:w-auto">
            {/* Bouton lien d'invitation (gérant uniquement) */}
            {isOwner && <InviteLinkButton inviteCode={group.inviteCode} />}

            {isOwner && (
              <>
                <button
                  onClick={onEditGroup}
                  aria-label="Modifier les informations du groupe"
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
                <button
                  onClick={onTransferOwnership}
                  aria-label="Transférer la propriété du groupe"
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl transition text-sm font-medium"
                >
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Transférer</span>
                </button>
                <button
                  onClick={onDeleteGroup}
                  aria-label="Supprimer le groupe définitivement"
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Supprimer</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 w-full text-left pt-6 border-t border-slate-800/60">
          <MarkdownView
            content={group.description || 'Aucune description'}
            className="text-slate-300/90 leading-relaxed max-w-none text-base"
          />
        </div>
      </div>
    </div>
  );
};
