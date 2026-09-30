import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => Promise<any>;
}

export const JoinGroupModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 8) {
      setError("Le code doit contenir 8 caractères.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(code.trim().toUpperCase());
      setCode("");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Code invalide.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up max-h-[92vh] overflow-y-auto scrollbar-stable">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-bold text-white">Rejoindre un Groupe</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Code d'invitation (8 caractères)</label>
            <input 
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: A8F9K2X7"
              maxLength={8}
              className="w-full bg-slate-800 border border-slate-700 text-white font-mono text-center text-lg sm:text-xl tracking-[0.25em] sm:tracking-[0.3em] rounded-xl px-4 py-3 sm:py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
              autoFocus
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
              disabled={loading || code.length !== 8}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Rejoindre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
