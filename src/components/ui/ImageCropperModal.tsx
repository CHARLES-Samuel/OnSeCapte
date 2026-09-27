import { useState, useCallback } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  aspectRatio: number;
  onCropCompleteAction: (croppedImageUrl: string) => void;
  title?: string;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Calculate bounding box of the rotated image
  const size = Math.max(image.width, image.height);
  canvas.width = size;
  canvas.height = size;

  // Draw image in center of canvas, rotated
  ctx.translate(size / 2, size / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the cropped image data from the canvas
  const data = ctx.getImageData(
    (size - image.width) / 2 + pixelCrop.x,
    (size - image.height) / 2 + pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Create a new canvas to store the cropped image
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  // Return base64 string
  return canvas.toDataURL('image/jpeg', 0.9);
};

export const ImageCropperModal = ({
  isOpen,
  onClose,
  imageUrl,
  aspectRatio,
  onCropCompleteAction,
  title = "Recadrer l'image"
}: ImageCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      if (croppedImage) {
        onCropCompleteAction(croppedImage);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition rounded-lg p-1 hover:bg-slate-800"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 bg-black overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{
              containerClassName: "h-full w-full",
            }}
          />
        </div>
        
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 font-medium">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition border border-slate-700"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 transition shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                "Traitement..."
              ) : (
                <>
                  <Check className="w-5 h-5" /> Valider
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
