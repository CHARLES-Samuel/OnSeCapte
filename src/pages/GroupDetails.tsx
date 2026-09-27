import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupDetails } from '../hooks/useGroupDetails';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import type { EventCategory } from '../models/Event';
import { 
  ArrowLeft, Plus, Trash2, UserCheck, Utensils, Dices, PartyPopper, Pizza, Dumbbell, Gamepad2, Sparkles
} from 'lucide-react';
import { CreateEventModal } from '../components/features/events/CreateEventModal';
import { TransferOwnershipModal } from '../components/features/groups/TransferOwnershipModal';

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
  
  const { events, loading: eventsLoading, createEvent, deleteEvent } = useEvents(groupId, isOwner);
  
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'Toutes'>('Toutes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  const categories: (EventCategory | 'Toutes')[] = [
    'Toutes', 
    'Restaurant', 
    'Jeux de rôle', 
    'Soirée', 
    'Repas', 
    'Sport', 
    'Gaming'
  ];

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeCategory !== 'Toutes') {
      filtered = filtered.filter(e => e.category === activeCategory);
    }
    return filtered.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
  }, [events, activeCategory, sortOrder]);

  const handleDeleteGroup = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce groupe ?")) {
      const success = await deleteGroup();
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  if (groupLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Chargement du groupe...</div>;
  if (groupError || !group) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">{groupError || "Groupe introuvable"}</div>;

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
                onClick={handleDeleteGroup} 
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
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
            {categories.map(cat => {
              const Icon = cat !== 'Toutes' ? categoryIcons[cat as EventCategory] : Sparkles;
              return (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition ${activeCategory === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="asc">Prix : Croissant</option>
              <option value="desc">Prix : Décroissant</option>
            </select>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-primary-600/20 transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un événement</span>
            </button>
          </div>
        </div>

        {/* Liste des événements */}
        {eventsLoading ? (
          <div className="text-center py-12 text-slate-500">Chargement des événements...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 border border-slate-800 rounded-2xl">
            <p className="text-slate-400">Aucun événement ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const CategoryIcon = categoryIcons[event.category] || Sparkles;
              const canEditOrDelete = isOwner || event.createdBy === user?.uid;
              
              return (
                <div key={event.id} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:border-slate-600 transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="flex items-center space-x-1.5 px-3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-semibold rounded-full">
                        <CategoryIcon className="w-3.5 h-3.5" />
                        <span>{event.category}</span>
                      </span>
                      <span className="font-bold text-lg text-emerald-400">
                        {event.price === 0 ? 'Gratuit' : `${event.price} €`}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{event.description || "Pas de description"}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500">Par {event.createdBy === user?.uid ? 'Vous' : 'Un membre'}</span>
                    {canEditOrDelete && (
                      <button 
                        onClick={() => deleteEvent(event.id)} 
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                        title="Supprimer l'événement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createEvent}
      />

      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        members={group.members}
        currentOwnerId={group.createdBy}
        onTransfer={transferOwnership}
      />
    </div>
  );
};
