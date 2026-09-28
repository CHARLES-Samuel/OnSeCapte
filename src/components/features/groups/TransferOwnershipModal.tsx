import { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: string[];
  currentOwnerId: string;
  memberProfilesMap?: Record<string, import('../../../models/Group').MemberProfile>;
  onTransfer: (newOwnerId: string) => Promise<boolean | undefined>;
}

export const TransferOwnershipModal = ({
  isOpen,
  onClose,
  members,
  currentOwnerId,
  memberProfilesMap = {},
  onTransfer,
}: TransferOwnershipModalProps) => {
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const eligibleMembers = members.filter((id) => id !== currentOwnerId);

  const getMemberDisplayName = (id: string) => {
    if (memberProfilesMap[id]?.displayName) return memberProfilesMap[id].displayName;
    return `Membre (${id.substring(0, 6)})`;
  };

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de transférer la propriété.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl text-white relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la modale"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-6">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">Transférer la propriété</h3>
            <p className="text-xs text-slate-400">
              Sélectionnez un nouveau gérant pour le groupe
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg" role="alert">
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
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 text-sm min-h-[44px]"
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Sélectionner un membre --</option>
                {eligibleMembers.map((memberId) => (
                  <option key={memberId} value={memberId} className="bg-slate-900 text-slate-100 py-2">
                    👤 {getMemberDisplayName(memberId)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition min-h-[42px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !selectedMember}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-medium transition disabled:opacity-50 min-h-[42px]"
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
