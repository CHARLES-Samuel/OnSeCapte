import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { CreateGroupDTO } from "../../../models/Group";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupDTO) => Promise<any>;
}

export const CreateGroupModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du groupe est requis.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up max-h-[92vh] overflow-y-auto scrollbar-stable">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-bold text-white">Nouveau Groupe</h2>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Fermer la modale"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <p className="text-xs text-slate-400">
            Remarque : chaque utilisateur peut créer un maximum de <span className="text-primary-400 font-semibold">3 groupes</span>.
          </p>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nom du groupe *</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vacances au ski"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm sm:text-base"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-300">Description (optionnelle)</label>
              <span className="text-xs text-slate-500">Supporte le Markdown</span>
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Le groupe pour organiser notre séjour..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none text-sm sm:text-base"
            />
          </div>
          
          <div className="pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors min-h-[44px]"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
