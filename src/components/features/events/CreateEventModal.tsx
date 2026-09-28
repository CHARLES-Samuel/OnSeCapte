import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { EventCategory, CreateEventDTO, EventDateMode, TimeSlot } from "../../../models/Event";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateEventDTO, "groupId">) => Promise<boolean | undefined>;
}

const CATEGORIES: EventCategory[] = [
  "Restaurant",
  "Jeux de rôle",
  "Soirée",
  "Repas",
  "Sport",
  "Gaming",
  "Autres",
];

const MAX_DESCRIPTION_LENGTH = 1500;

export const CreateEventModal = ({ isOpen, onClose, onSubmit }: CreateEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("Soirée");
  const [price, setPrice] = useState<number>(0);
  const [dateMode, setDateMode] = useState<EventDateMode>("poll");
  const [finalDate, setFinalDate] = useState("");
  const [finalTimeSlot, setFinalTimeSlot] = useState<TimeSlot>("Soirée");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est obligatoire");
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.`);
      return;
    }

    if (dateMode === 'fixed' && !finalDate) {
      setError("La date est obligatoire pour un événement planifié.");
      return;
    }

    if (link.trim() && !link.trim().startsWith("http://") && !link.trim().startsWith("https://")) {
      setError("Le lien doit commencer par http:// ou https://");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const success = await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        price: Number(price) || 0,
        dateMode,
        finalDate: dateMode === 'fixed' ? finalDate : undefined,
        finalTimeSlot: dateMode === 'fixed' ? finalTimeSlot : undefined,
        location: location.trim() || undefined,
        link: link.trim() || undefined,
      });

      if (success) {
        setTitle("");
        setDescription("");
        setCategory("Soirée");
        setPrice(0);
        setDateMode("poll");
        setFinalDate("");
        setFinalTimeSlot("Soirée");
        setLocation("");
        setLink("");
        onClose();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-xl text-white relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la modale"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <h3 className="text-lg sm:text-xl font-bold mb-4 pr-8">Créer un nouvel événement</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Soirée jeux de société"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-300">
                Description
              </label>
              <span className={`text-xs ${description.length > MAX_DESCRIPTION_LENGTH ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                {description.length} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="Détails de l'événement... (Markdown supporté : **gras**, *italique*, listes, etc.)"
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none font-sans"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Astuce : Tu peux utiliser la syntaxe Markdown pour mettre en forme ton texte.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Choix de la date
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateMode"
                  value="poll"
                  checked={dateMode === 'poll'}
                  onChange={() => setDateMode('poll')}
                  className="w-4 h-4 text-primary-500 bg-slate-900 border-slate-700 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-300">Date à déterminer ensemble (sondage)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateMode"
                  value="fixed"
                  checked={dateMode === 'fixed'}
                  onChange={() => setDateMode('fixed')}
                  className="w-4 h-4 text-primary-500 bg-slate-900 border-slate-700 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-300">Date déjà fixée</span>
              </label>
            </div>
          </div>

          {dateMode === 'fixed' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-700/30 p-3 rounded-lg border border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={finalDate}
                  onChange={(e) => setFinalDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  required={dateMode === 'fixed'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Moment de la journée
                </label>
                <select
                  value={finalTimeSlot}
                  onChange={(e) => setFinalTimeSlot(e.target.value as TimeSlot)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="Matin">Matin</option>
                  <option value="Après-midi">Après-midi</option>
                  <option value="Soirée">Soirée</option>
                  <option value="Toute la journée">Toute la journée</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-100 py-2">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Prix (€) (0 = Gratuit)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Lieu
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Chez Maxime, Restaurant Le Bistro..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Lien utile
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
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
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-medium transition disabled:opacity-50 min-h-[42px]"
            >
              {loading ? "Création..." : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
