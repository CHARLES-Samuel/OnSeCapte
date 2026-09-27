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
    } catch (err: any) {
      setError(err.message || "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Rejoindre un Groupe</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
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
              className="w-full bg-slate-800 border border-slate-700 text-white font-mono text-center text-xl tracking-[0.3em] rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
              autoFocus
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading || code.length !== 8}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Rejoindre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
