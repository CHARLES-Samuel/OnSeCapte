import { useState, useEffect } from 'react';
import { X, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface EditPseudoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditPseudoModal = ({ isOpen, onClose }: EditPseudoModalProps) => {
  const { user, updatePseudo } = useAuth();
  const [pseudo, setPseudo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setPseudo(user.displayName || '');
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) {
      setError("Le pseudo ne peut pas être vide.");
      return;
    }
    
    if (pseudo.trim() === user?.displayName) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await updatePseudo(pseudo.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du pseudo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-pseudo-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 id="edit-pseudo-title" className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            Modifier mon pseudo
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Fermer la fenêtre"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="pseudo" className="block text-sm font-medium text-slate-300 mb-1">
                Nouveau pseudo
              </label>
              <input
                id="pseudo"
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: Alex, SamLeGamer..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                autoFocus
                disabled={isSubmitting}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "pseudo-error" : undefined}
              />
              {error && (
                <p id="pseudo-error" className="mt-2 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>
            
            <p className="text-xs text-slate-500">
              C'est ce nom qui sera visible par les autres membres dans vos groupes et événements.
            </p>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !pseudo.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 rounded-xl transition-colors shadow-lg shadow-primary-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
