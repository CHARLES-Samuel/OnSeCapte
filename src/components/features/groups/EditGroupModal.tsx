import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import type { Group, UpdateGroupDTO } from '../../../models/Group';
import { ImageCropperModal } from '../../ui/ImageCropperModal';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onSubmit: (data: UpdateGroupDTO, photoFile?: File, bannerFile?: File) => Promise<boolean>;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const EditGroupModal = ({ isOpen, onClose, group, onSubmit }: EditGroupModalProps) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(group.photoUrl || null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(group.bannerUrl || null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    mimeType?: string;
    type: 'photo' | 'banner';
    aspectRatio: number;
  }>({ isOpen: false, imageUrl: '', type: 'photo', aspectRatio: 1 });

  useEffect(() => {
    if (isOpen) {
      setName(group.name);
      setDescription(group.description || '');
      setPhotoFile(null);
      setPhotoPreview(group.photoUrl || null);
      setBannerFile(null);
      setBannerPreview(group.bannerUrl || null);
      setError(null);
    }
  }, [isOpen, group]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
      setError('Format non supporté. Veuillez utiliser JPG, PNG ou WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("L'image est trop volumineuse (maximum 2 Mo).");
      return;
    }

    setError(null);
    const previewUrl = URL.createObjectURL(file);

    setCropperState({
      isOpen: true,
      imageUrl: previewUrl,
      mimeType: file.type,
      type: isBanner ? 'banner' : 'photo',
      aspectRatio: isBanner ? 3 : 1 // 3:1 for banner, 1:1 for profile
    });
    
    // Clear inputs to allow selecting the same file again
    if (isBanner && bannerInputRef.current) bannerInputRef.current.value = '';
    if (!isBanner && photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (cropperState.type === 'banner') {
      setBannerPreview(croppedImageUrl);
      setBannerFile(null);
    } else {
      setPhotoPreview(croppedImageUrl);
      setPhotoFile(null);
    }
  };

  const compressImage = (source: File | Blob | string, maxDim: number = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionnement proportionnel
          const MAX_SIZE = maxDim;
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(typeof source === 'string' ? source : '');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Détecter si l'image possède de la transparence
          let hasAlpha = false;
          try {
            const imgData = ctx.getImageData(0, 0, width, height);
            for (let i = 3; i < imgData.data.length; i += 4) {
              if (imgData.data[i] < 255) {
                hasAlpha = true;
                break;
              }
            }
          } catch {
            // Ignorer les erreurs d'accès aux pixels
          }

          // Si l'image a de la transparence, on applique le dégradé en fond
          if (hasAlpha) {
            const compCanvas = document.createElement('canvas');
            compCanvas.width = width;
            compCanvas.height = height;
            const compCtx = compCanvas.getContext('2d');
            if (compCtx) {
              const grad = compCtx.createLinearGradient(0, 0, width, height);
              grad.addColorStop(0, '#6366f1');   // indigo-500
              grad.addColorStop(0.5, '#a855f7'); // purple-500
              grad.addColorStop(1, '#ec4899');   // pink-500
              compCtx.fillStyle = grad;
              compCtx.fillRect(0, 0, width, height);
              compCtx.drawImage(canvas, 0, 0);
              resolve(compCanvas.toDataURL('image/jpeg', 0.8));
              return;
            }
          }

          // Compression en JPEG qualité 0.75 par défaut
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (err) => reject(err);

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(source);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);

      let base64Photo: string | undefined;
      if (photoPreview && photoPreview !== group.photoUrl && photoPreview.startsWith('data:')) {
        base64Photo = await compressImage(photoPreview, 400);
      } else if (photoFile) {
        base64Photo = await compressImage(photoFile, 400);
      }

      let base64Banner: string | undefined;
      if (bannerPreview && bannerPreview !== group.bannerUrl && bannerPreview.startsWith('data:')) {
        base64Banner = await compressImage(bannerPreview, 1000);
      } else if (bannerFile) {
        base64Banner = await compressImage(bannerFile, 1000);
      }

      const success = await onSubmit({
        name: name.trim(),
        description: description.trim(),
        ...(base64Photo ? { photoUrl: base64Photo } : {}),
        ...(base64Banner ? { bannerUrl: base64Banner } : {})
      }, undefined, undefined);

      if (success) {
        onClose();
      } else {
        setError('Une erreur est survenue lors de la mise à jour.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">Modifier le groupe</h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition rounded-lg p-1.5 hover:bg-slate-800 min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto scrollbar-stable flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm" role="alert">
              {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-medium text-slate-400">Photo profil</span>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden photo-gradient-bg border border-slate-700 flex items-center justify-center group shrink-0 shadow-lg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Aperçu de la photo de groupe" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/80" />
                )}
                <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <input 
                type="file" 
                ref={photoInputRef} 
                onChange={(e) => handleFileChange(e, false)} 
                accept={VALID_TYPES.join(',')} 
                className="hidden" 
                aria-label="Sélectionner une photo de groupe"
              />
              
              <button 
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-xs text-primary-400 hover:text-primary-300 transition"
              >
                Changer (Max 2 Mo)
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 w-full flex-1">
              <span className="text-xs font-medium text-slate-400">Bannière (optionnelle)</span>
              <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center group">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Aperçu de la bannière" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                )}
                <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <input 
                type="file" 
                ref={bannerInputRef} 
                onChange={(e) => handleFileChange(e, true)} 
                accept={VALID_TYPES.join(',')} 
                className="hidden" 
                aria-label="Sélectionner une bannière"
              />
              
              <button 
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="text-xs text-primary-400 hover:text-primary-300 transition"
              >
                Changer (Max 2 Mo)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-slate-300 mb-1.5">
                Nom du groupe <span className="text-red-400">*</span>
              </label>
              <input
                id="groupName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition"
                placeholder="Ex: Les copains du samedi"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label htmlFor="groupDescription" className="block text-sm font-medium text-slate-300">
                  Description
                </label>
                <span className="text-xs text-slate-500">Supporte le Markdown</span>
              </div>
              <textarea
                id="groupDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition resize-none h-24"
                placeholder="Petite description du groupe..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition border border-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 transition shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      <ImageCropperModal
        isOpen={cropperState.isOpen}
        onClose={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
        imageUrl={cropperState.imageUrl}
        mimeType={cropperState.mimeType}
        aspectRatio={cropperState.aspectRatio}
        onCropCompleteAction={handleCropComplete}
        title={cropperState.type === 'banner' ? "Recadrer la bannière" : "Recadrer la photo"}
      />
    </div>
  );
};
