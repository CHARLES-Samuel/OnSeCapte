import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupDetails } from '../hooks/useGroupDetails';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import type { Event, EventCategory } from '../models/Event';
import { 
  ArrowLeft, Plus, Trash2, UserCheck, Utensils, Dices, PartyPopper, Pizza, Dumbbell, Gamepad2, Sparkles, Loader2, Edit2, Users
} from 'lucide-react';
import { CreateEventModal } from '../components/features/events/CreateEventModal';
import { EditEventModal } from '../components/features/events/EditEventModal';
import { TransferOwnershipModal } from '../components/features/groups/TransferOwnershipModal';
import { EditGroupModal } from '../components/features/groups/EditGroupModal';
import { ConfirmModal, type ConfirmVariant } from '../components/ui/ConfirmModal';
import { EventCard } from '../components/features/events/EventCard';
import { MarkdownView } from '../components/ui/MarkdownView';

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
    memberProfiles,
    loading: groupLoading, 
    error: groupError, 
    deleteGroup, 
    transferOwnership,
    updateGroupDetails
  } = useGroupDetails(groupId);
  const isOwner = group?.createdBy === user?.uid;
  
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useEvents(groupId, isOwner);
  
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'Toutes'>('Toutes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  
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
    const map: Record<string, string> = { ...memberProfiles };
    
    if (user) {
      map[user.uid] = user.displayName || user.email?.split('@')[0] || 'Vous';
    }
    
    events.forEach(e => {
      // Les données de memberProfiles sont prioritaires si elles existent
      if (e.createdBy && e.createdByName && !map[e.createdBy]) {
        map[e.createdBy] = e.createdByName;
      }
      if (e.availabilities) {
        Object.values(e.availabilities).forEach(avail => {
          if (avail.userId && avail.userName && !map[avail.userId]) {
            map[avail.userId] = avail.userName;
          }
        });
      }
    });
    return map;
  }, [events, user, memberProfiles]);

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
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 overflow-hidden relative">
          {/* Bouton retour absolu sur la bannière */}
          <button 
            onClick={() => navigate('/dashboard')} 
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center justify-center p-2.5 bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md text-white border border-white/10 rounded-full transition shadow-lg"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {/* Bannière */}
          {group.bannerUrl ? (
            <div className="w-full h-32 md:h-56 bg-slate-700 relative">
              <img src={group.bannerUrl} alt={`Bannière du groupe ${group.name}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-24 md:h-32 bg-gradient-to-r from-slate-800 to-slate-800/50"></div>
          )}
          
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 -mt-16 sm:-mt-20 md:-mt-24 relative z-10">
                {group.photoUrl ? (
                  <img src={group.photoUrl} alt={`Photo du groupe ${group.name}`} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-2xl shrink-0 border-4 border-slate-900 bg-slate-900" />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-800 shadow-2xl shrink-0 border-4 border-slate-900 flex items-center justify-center">
                    <Users className="w-10 h-10 text-slate-600" />
                  </div>
                )}
                <div className="flex flex-col items-center sm:items-start mb-1 sm:mb-2 text-center sm:text-left">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">{group.name}</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 md:gap-3 relative z-10 w-full sm:w-auto">
                {isOwner && (
                  <>
                    <button 
                      onClick={() => setIsEditGroupModalOpen(true)}
                      className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>
                    <button 
                      onClick={() => setIsTransferModalOpen(true)}
                      className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl transition text-sm font-medium"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden lg:inline">Transférer</span>
                    </button>
                    <button 
                      onClick={handleDeleteGroupClick} 
                      className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden lg:inline">Supprimer</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Description (Pleine largeur) */}
            <div className="mt-8 w-full text-left pt-6 border-t border-slate-800/60">
              <MarkdownView content={group.description || "Aucune description"} className="text-slate-300/90 leading-relaxed max-w-none text-base" />
            </div>
          </div>
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
