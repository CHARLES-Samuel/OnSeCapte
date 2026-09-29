import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useGroupDetails } from '../hooks/useGroupDetails';
import { useAuth } from '../hooks/useAuth';
import type { TimeSlot, EventParticipation, CreateEventDTO } from '../models/Event';
import { useGroupPlannings } from '../hooks/useGroupPlannings';
import { ArrowLeft, CheckCircle, Trash2, Unlock, Edit, Loader2, UserX, AlertTriangle, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { formatDateShort } from '../utils/format';
import { UserAvailabilityForm } from '../components/features/events/UserAvailabilityForm';
import { EventSynthesis } from '../components/features/events/EventSynthesis';
import { EventFixedParticipantsList } from '../components/features/events/EventFixedParticipantsList';
import { EditEventModal } from '../components/features/events/EditEventModal';
import { PastEventView } from '../components/features/events/PastEventView';
import { MarkdownView } from '../components/ui/MarkdownView';
import { ConfirmModal, type ConfirmVariant } from '../components/ui/ConfirmModal';
import { CategoryBadge } from '../components/ui/CategoryBadge';

export const EventDetails = () => {
  const { groupId, eventId } = useParams<{ groupId: string; eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { group, memberProfiles, loading: groupLoading } = useGroupDetails(groupId);
  const isGroupOwner = group?.createdBy === user?.uid;

  const { 
    events, 
    loading: eventsLoading, 
    error: eventsError,
    updateParticipation, 
    lockEventDate, 
    unlockEventDate, 
    updateEvent, 
    deleteEvent 
  } = useEvents(groupId, isGroupOwner);

  const { plannings } = useGroupPlannings(groupId);
  
  const event = events.find(e => e.id === eventId);
  const isEventOwner = event?.createdBy === user?.uid;
  const isPast = event?.state === 'passe';
  const isLocked = event?.state === 'planifie';
  const canLock = (isGroupOwner || isEventOwner) && !isPast;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: ConfirmVariant;
    icon?: React.ReactNode;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const participations = event?.participations || {};
  const totalMembers = group?.members.length || 0;
  const respondedMembers = Object.keys(participations).length;
  const currentUserResponse = user ? participations[user.uid] || 'pending' : 'pending';

  const handleSaveParticipation = async (participation: EventParticipation) => {
    if (!event || !user) return;
    await updateParticipation(event.id, participation);
  };

  const handleLock = async (dateStr: string, timeSlot: TimeSlot) => {
    if (!event || !dateStr || !timeSlot) return;
    await lockEventDate(event.id, dateStr, timeSlot);
  };

  const handleUnlockClick = () => {
    if (!event) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Rouvrir le sondage',
      message: 'En cas d\'imprévu, souhaitez-vous annuler la date fixée et rouvrir le sondage auprès des membres ?',
      confirmText: 'Annuler la date & Rouvrir',
      variant: 'warning',
      icon: <Unlock className="w-6 h-6" />,
      onConfirm: async () => {
        await unlockEventDate(event.id);
      },
    });
  };

  const handleUpdateEvent = async (data: Partial<CreateEventDTO>) => {
    if (!event) return;
    return await updateEvent(event.id, data);
  };

  const handleDeleteEventClick = () => {
    if (!event) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Supprimer l\'événement',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'événement "${event.title}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer définitivement',
      variant: 'danger',
      onConfirm: async () => {
        await deleteEvent(event.id);
        navigate(`/groups/${groupId}`);
      },
    });
  };

  if ((groupLoading || eventsLoading) && (!event || !group)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!event || !group) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center font-medium">
        Événement ou groupe introuvable.
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
              Vous ne faites plus partie de ce groupe. Vos autorisations ont été immédiatement révoquées par le gérant.
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {eventsError && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm font-medium flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{eventsError}</p>
          </div>
        )}

        {/* Header de l'événement */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 bg-slate-800/40 p-4 sm:p-6 rounded-2xl border border-slate-800">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0 w-full">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              aria-label="Retour au groupe"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shrink-0 mt-0.5 min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{event.title}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <CategoryBadge category={event.category} />
                <span className="text-slate-400 text-xs sm:text-sm">• {event.price === 0 ? 'Gratuit' : `${event.price} €`}</span>
                {event.dateMode === 'range' && event.startDate && event.endDate && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Plage : {formatDateShort(event.startDate)} - {formatDateShort(event.endDate)}</span>
                  </span>
                )}
              </div>
              
              {!isPast && (event.location || event.link) && (
                <div className="mt-4 flex flex-col gap-2">
                  {event.location && (
                    <div className="flex items-start gap-2 text-sm text-slate-300">
                      <MapPin className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" aria-hidden="true" />
                      {!event.link ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-400 hover:underline transition"
                        >
                          {event.location}
                        </a>
                      ) : (
                        <span>{event.location}</span>
                      )}
                    </div>
                  )}
                  {event.link && (
                    <div>
                      <a 
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-sm font-medium transition max-w-full"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {(() => {
                            try {
                              const url = new URL(event.link);
                              return url.hostname.replace('www.', '');
                            } catch {
                              return 'Lien externe';
                            }
                          })()}
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {!isPast && event.description && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <MarkdownView content={event.description} />
                </div>
              )}
            </div>
          </div>
          {(isGroupOwner || isEventOwner) && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              {!isPast && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition text-xs sm:text-sm font-medium min-h-[38px]"
                  title="Modifier cet événement"
                  aria-label="Modifier cet événement"
                >
                  <Edit className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteEventClick}
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition text-xs sm:text-sm font-medium min-h-[38px]"
                title="Supprimer cet événement"
                aria-label="Supprimer cet événement"
              >
                <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Rendu selon l'état de l'événement : Vue dédiée passée ou Vue active */}
        {isPast ? (
          <PastEventView
            event={event}
            memberProfiles={memberProfiles}
            currentUserId={user?.uid}
          />
        ) : (
          <>
            {/* State: Planifié Banner */}
            {isLocked && event.finalDate && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 sm:p-6 rounded-2xl text-center space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
                  <span>Événement Confirmé !</span>
                </h2>
                <p className="text-emerald-300/80 text-base sm:text-lg font-medium">
                  📅 {new Date(event.finalDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} <br/>
                  ⏰ {event.finalTimeSlot}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {currentUserResponse === 'participating' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Tu es inscrit(e)
                    </span>
                  ) : currentUserResponse === 'not_participating' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-semibold">
                      <UserX className="w-3.5 h-3.5 text-red-400" /> Tu es noté(e) indisponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Réponse en attente
                    </span>
                  )}
                </div>
                {canLock && event.dateMode !== 'fixed' && (
                  <div>
                    <button
                      type="button"
                      onClick={handleUnlockClick}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition text-xs font-semibold min-h-[36px]"
                    >
                      <Unlock className="w-4 h-4 text-amber-400" aria-hidden="true" />
                      <span>Rouvrir le sondage (Imprévu)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Colonne gauche : Saisie des disponibilités avec retour visuel immédiat */}
              <UserAvailabilityForm
                isLocked={isLocked}
                currentUserResponse={currentUserResponse}
                onSave={handleSaveParticipation}
                hasCompletedPlanning={plannings.some(p => p.userId === user?.uid)}
                groupId={groupId || ''}
              />

              {/* Colonne droite : Synthèse des réponses et dates OU Participants si date fixe */}
              {event.dateMode === 'fixed' ? (
                <EventFixedParticipantsList
                  participations={participations}
                  memberProfiles={memberProfiles}
                  currentUserId={user?.uid}
                  totalMembers={totalMembers}
                />
              ) : (
                <EventSynthesis
                  event={event}
                  respondedMembers={respondedMembers}
                  totalMembers={totalMembers}
                  participations={participations}
                  plannings={plannings}
                  memberProfiles={memberProfiles}
                  memberIds={group?.members || []}
                  currentUserId={user?.uid}
                  canLock={canLock}
                  eventState={event.state}
                  onLock={handleLock}
                  onUnlock={handleUnlockClick}
                />
              )}

            </div>
          </>
        )}
      </div>

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        onSubmit={handleUpdateEvent}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
        icon={confirmModalConfig.icon}
      />
    </div>
  );
};
