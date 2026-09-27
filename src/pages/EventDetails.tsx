import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useGroupDetails } from '../hooks/useGroupDetails';
import { useAuth } from '../hooks/useAuth';
import type { TimeSlot, EventAvailability, CreateEventDTO } from '../models/Event';
import { ArrowLeft, CheckCircle, XCircle, Trash2, Lock, Unlock, Edit, Loader2 } from 'lucide-react';
import { MonthCalendarPicker } from '../components/features/events/MonthCalendarPicker';
import { TimeSlotSelector } from '../components/features/events/TimeSlotSelector';
import { EventSynthesis } from '../components/features/events/EventSynthesis';
import { EditEventModal } from '../components/features/events/EditEventModal';
import { MarkdownView } from '../components/ui/MarkdownView';
import { ConfirmModal, ConfirmVariant } from '../components/ui/ConfirmModal';

export const EventDetails = () => {
  const { groupId, eventId } = useParams<{ groupId: string; eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { group, loading: groupLoading } = useGroupDetails(groupId);
  const isGroupOwner = group?.createdBy === user?.uid;

  const { 
    events, 
    loading: eventsLoading, 
    updateAvailability, 
    lockEventDate, 
    unlockEventDate, 
    updateEvent, 
    deleteEvent 
  } = useEvents(groupId, isGroupOwner);
  
  const event = events.find(e => e.id === eventId);
  const isEventOwner = event?.createdBy === user?.uid;
  const canLock = isGroupOwner || isEventOwner;

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

  const availabilities = event?.availabilities || {};
  const totalMembers = group?.members.length || 0;
  const respondedMembers = Object.keys(availabilities).length;
  const currentUserResponse = user ? availabilities[user.uid] : null;

  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [selectedDatesMap, setSelectedDatesMap] = useState<Record<string, TimeSlot[]>>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (currentUserResponse && !hasInitialized) {
      setIsAvailable(currentUserResponse.isAvailable);
      const newMap: Record<string, TimeSlot[]> = {};
      currentUserResponse.availableDates.forEach(d => {
        newMap[d.date] = d.timeSlots;
      });
      setSelectedDatesMap(newMap);
      setHasInitialized(true);
    }
  }, [currentUserResponse, hasInitialized]);

  const toggleDate = (dateStr: string) => {
    if (event?.state === 'planifie') return;
    setSelectedDatesMap(prev => {
      const newMap = { ...prev };
      if (newMap[dateStr]) {
        delete newMap[dateStr];
      } else {
        newMap[dateStr] = ['Toute la journée'];
      }
      return newMap;
    });
  };

  const toggleTimeSlot = (dateStr: string, ts: TimeSlot) => {
    if (event?.state === 'planifie') return;
    setSelectedDatesMap(prev => {
      const currentSlots = prev[dateStr] || [];
      let newSlots: TimeSlot[];
      if (ts === 'Toute la journée') {
        newSlots = ['Toute la journée'];
      } else {
        newSlots = currentSlots.includes(ts)
          ? currentSlots.filter(t => t !== ts)
          : [...currentSlots.filter(t => t !== 'Toute la journée'), ts];
      }
      if (newSlots.length === 0) newSlots = ['Toute la journée'];
      return { ...prev, [dateStr]: newSlots };
    });
  };

  const bestDates = useMemo(() => {
    if (!event) return [];
    const dateCounts: Record<string, Record<TimeSlot, number>> = {};
    
    Object.values(availabilities).forEach(avail => {
      if (!avail.isAvailable) return;
      avail.availableDates.forEach(d => {
        if (!dateCounts[d.date]) dateCounts[d.date] = { 'Matin': 0, 'Après-midi': 0, 'Soirée': 0, 'Toute la journée': 0 };
        d.timeSlots.forEach(ts => {
          dateCounts[d.date][ts] = (dateCounts[d.date][ts] || 0) + 1;
        });
      });
    });

    const result: { date: string; timeSlot: TimeSlot; count: number }[] = [];
    Object.keys(dateCounts).forEach(date => {
      Object.keys(dateCounts[date]).forEach(ts => {
        const count = dateCounts[date][ts as TimeSlot];
        if (count > 0) {
          result.push({ date, timeSlot: ts as TimeSlot, count });
        }
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }, [event, availabilities]);

  const handleUpdateAvailability = async () => {
    if (!event || !user || event.state === 'planifie') return;
    
    const availableDates = Object.keys(selectedDatesMap).map(dateStr => ({
      date: dateStr,
      timeSlots: selectedDatesMap[dateStr]
    }));

    const availability: Omit<EventAvailability, 'userId' | 'updatedAt' | 'userName'> = {
      isAvailable,
      availableDates: isAvailable ? availableDates : []
    };

    await updateAvailability(event.id, availability);
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

  const isLocked = event.state === 'planifie';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-start space-x-4 flex-1">
            <button onClick={() => navigate(`/groups/${groupId}`)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shrink-0 mt-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-slate-400 text-sm">{event.category} • {event.price === 0 ? 'Gratuit' : `${event.price} €`}</p>
              {event.description && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <MarkdownView content={event.description} />
                </div>
              )}
            </div>
          </div>
          {canLock && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition text-sm font-medium"
                title="Modifier cet événement"
              >
                <Edit className="w-4 h-4 text-primary-400" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
              <button
                onClick={handleDeleteEventClick}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition text-sm font-medium"
                title="Supprimer cet événement"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* State: Planifié Banner */}
        {isLocked && event.finalDate && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6" /> Événement Confirmé !
            </h2>
            <p className="text-emerald-300/80 text-lg font-medium mt-2">
              📅 {new Date(event.finalDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} <br/>
              ⏰ {event.finalTimeSlot}
            </p>
            {canLock && (
              <button
                onClick={handleUnlockClick}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition text-xs font-semibold"
              >
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>Rouvrir le sondage (Imprévu)</span>
              </button>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: User Availability Input */}
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Tes disponibilités</h2>
              <p className="text-sm text-slate-400">
                {isLocked ? "Le sondage est clôturé." : "Indique si tu seras présent et choisis tes jours."}
              </p>
            </div>

            {isLocked && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-300 text-xs font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ce sondage est clôturé et verrouillé. Les réponses ne peuvent plus être modifiées.</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Global Available / Not Available Toggle */}
              <div className="flex gap-4">
                <button 
                  disabled={isLocked}
                  onClick={() => !isLocked && setIsAvailable(true)}
                  className={`flex-1 py-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition ${isAvailable ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'} ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  <CheckCircle className="w-5 h-5" /> Disponible
                </button>
                <button 
                  disabled={isLocked}
                  onClick={() => !isLocked && setIsAvailable(false)}
                  className={`flex-1 py-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition ${!isAvailable ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'} ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  <XCircle className="w-5 h-5" /> Pas dispo
                </button>
              </div>

              {isAvailable && (
                <div className="space-y-6 pt-2">
                  {/* Month Grid Calendar */}
                  <MonthCalendarPicker
                    selectedDates={Object.keys(selectedDatesMap)}
                    onToggleDate={toggleDate}
                  />

                  {/* Time Slot Customization Dropdown */}
                  <TimeSlotSelector
                    selectedDatesMap={selectedDatesMap}
                    onToggleTimeSlot={toggleTimeSlot}
                  />
                </div>
              )}
              
              {!isLocked && (
                <button 
                  onClick={handleUpdateAvailability}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary-600/20 transition mt-4"
                >
                  {currentUserResponse ? 'Mettre à jour ma réponse' : 'Valider ma réponse'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Event Synthesis */}
          <EventSynthesis
            respondedMembers={respondedMembers}
            totalMembers={totalMembers}
            bestDates={bestDates}
            availabilities={availabilities}
            currentUserId={user?.uid}
            canLock={canLock}
            eventState={event.state}
            onLock={handleLock}
            onUnlock={handleUnlockClick}
          />

        </div>
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
