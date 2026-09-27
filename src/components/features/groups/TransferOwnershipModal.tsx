import { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: string[];
  currentOwnerId: string;
  onTransfer: (newOwnerId: string) => Promise<boolean | undefined>;
}

export const TransferOwnershipModal = ({
  isOpen,
  onClose,
  members,
  currentOwnerId,
  onTransfer,
}: TransferOwnershipModalProps) => {
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const eligibleMembers = members.filter((id) => id !== currentOwnerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setError("Veuillez sélectionner un membre.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const success = await onTransfer(selectedMember);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Impossible de transférer la propriété.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Transférer la propriété</h3>
            <p className="text-xs text-slate-400">
              Sélectionnez un nouveau gérant pour le groupe
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {eligibleMembers.length === 0 ? (
          <p className="text-sm text-slate-400 my-4">
            Aucun autre membre n'est présent dans ce groupe pour recevoir la propriété.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Membre destinataire
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">-- Sélectionner un membre --</option>
                {eligibleMembers.map((memberId) => (
                  <option key={memberId} value={memberId}>
                    ID Membre: {memberId.substring(0, 8)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !selectedMember}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? "Transfert..." : "Transférer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
