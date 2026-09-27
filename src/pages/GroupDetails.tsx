import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupDetails } from '../hooks/useGroupDetails';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import type { Event, EventCategory } from '../models/Event';
import { 
  ArrowLeft, Plus, Trash2, UserCheck, Utensils, Dices, PartyPopper, Pizza, Dumbbell, Gamepad2, Sparkles, Loader2
} from 'lucide-react';
import { CreateEventModal } from '../components/features/events/CreateEventModal';
import { EditEventModal } from '../components/features/events/EditEventModal';
import { TransferOwnershipModal } from '../components/features/groups/TransferOwnershipModal';
import { ConfirmModal, type ConfirmVariant } from '../components/ui/ConfirmModal';
import { EventCard } from '../components/features/events/EventCard';

const categoryIcons: Record<EventCategory, any> = {
  'Restaurant': Utensils,
  'Jeux de rôle': Dices,
  'Soirée': PartyPopper,
  'Repas': Pizza,
  'Sport': Dumbbell,
  'Gaming': Gamepad2,
};

export const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    group, 
    loading: groupLoading, 
    error: groupError, 
    deleteGroup, 
    transferOwnership 
  } = useGroupDetails(groupId);
  const isOwner = group?.createdBy === user?.uid;
  
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useEvents(groupId, isOwner);
  
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'Toutes'>('Toutes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  const [activeState, setActiveState] = useState<'Tous' | 'En recherche' | 'À venir' | 'Passés'>('Tous');

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
  
  const categories: (EventCategory | 'Toutes')[] = [
    'Toutes', 
    'Restaurant', 
    'Jeux de rôle', 
    'Soirée', 
    'Repas', 
    'Sport', 
    'Gaming'
  ];

  const memberNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (user) {
      map[user.uid] = user.displayName || user.email?.split('@')[0] || 'Vous';
    }
    events.forEach(e => {
      if (e.createdBy && e.createdByName) {
        map[e.createdBy] = e.createdByName;
      }
      if (e.availabilities) {
        Object.values(e.availabilities).forEach(avail => {
          if (avail.userId && avail.userName) {
            map[avail.userId] = avail.userName;
          }
        });
      }
    });
    return map;
  }, [events, user]);

  const getCreatorName = (e: Event): string => {
    if (e.createdBy === user?.uid) return "Vous";
    if (e.createdByName) return e.createdByName;
    if (memberNamesMap[e.createdBy]) return memberNamesMap[e.createdBy];
    return "Un membre";
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Filtre par catégorie
    if (activeCategory !== 'Toutes') {
      filtered = filtered.filter(e => e.category === activeCategory);
    }
    
    // Filtre par état
    if (activeState !== 'Tous') {
      const stateMapping = {
        'En recherche': 'sondage',
        'À venir': 'planifie',
        'Passés': 'passe'
      };
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
        if (success) {
          navigate('/dashboard');
        }
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

  if (groupLoading && !group) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }
  
  if (groupError || !group) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">
        {groupError || "Groupe introuvable"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header du groupe */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{group.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{group.description || "Aucune description"}</p>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl transition text-sm font-medium"
              >
                <UserCheck className="w-4 h-4" />
                <span>Transférer propriété</span>
              </button>
              <button 
                onClick={handleDeleteGroupClick} 
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Filtres d'événements et action */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800/40 border border-slate-800 p-4 rounded-2xl gap-4">
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Filtres par état */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {['Tous', 'En recherche', 'À venir', 'Passés'].map(st => (
                <button
                  key={st}
                  onClick={() => setActiveState(st as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    activeState === st 
                      ? 'bg-slate-700 border-slate-600 text-white shadow-sm' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Filtres par catégorie */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat !== 'Toutes' ? categoryIcons[cat] : Sparkles;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                      activeCategory === cat
                        ? 'bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium transition"
            >
              Prix: {sortOrder === 'asc' ? 'Croissant ↑' : 'Décroissant ↓'}
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-600/20 transition text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Créer événement</span>
            </button>
          </div>
        </div>

        {/* Liste des événements */}
        {eventsLoading && events.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Chargement des événements...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-800/50">
            <p className="text-slate-400">Aucun événement ne correspond à tes filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                groupId={groupId || ''}
                canEditOrDelete={isOwner || event.createdBy === user?.uid}
                creatorName={getCreatorName(event)}
                onEdit={(e) => {
                  setEventToEdit(e);
                  setIsEditModalOpen(true);
                }}
                onDelete={(e) => handleDeleteEventClick(e)}
              />
            ))}
          </div>
        )}
      </div>

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
        memberNamesMap={memberNamesMap}
        currentOwnerId={group.createdBy}
        onTransfer={transferOwnership}
      />

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
