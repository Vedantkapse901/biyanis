import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { X, ZoomIn, Check } from 'lucide-react';
import { getCroppedImageBlob, imageUrlToDataUrl, fileToDataUrl } from '../../lib/cropImage';

/**
 * Modal to crop an image to a circle-friendly square.
 * @param {string} imageSrc - data URL, blob URL, or remote URL
 * @param {File} [sourceFile] - original file (best for cropping without CORS issues)
 */
export function ImageCircleCrop({ imageSrc, sourceFile, fileName = 'photo.jpg', onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [displaySrc, setDisplaySrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError('');
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);

      try {
        let src = '';
        if (sourceFile) {
          src = await fileToDataUrl(sourceFile);
        } else if (imageSrc?.startsWith('data:')) {
          src = imageSrc;
        } else if (imageSrc) {
          src = await imageUrlToDataUrl(imageSrc);
        }
        if (!cancelled) {
          if (!src) throw new Error('No image to crop');
          setDisplaySrc(src);
        }
      } catch (err) {
        console.error('Crop image load failed:', err);
        if (!cancelled) {
          setLoadError('Could not load image. Try choosing the file again.');
          setDisplaySrc('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [imageSrc, sourceFile]);

  const onCropAreaChange = useCallback((_area, pixels) => {
    if (pixels?.width && pixels?.height) {
      setCroppedAreaPixels(pixels);
    }
  }, []);

  const handleConfirm = async () => {
    if (!displaySrc) {
      alert(loadError || 'Image not ready yet.');
      return;
    }
    if (!croppedAreaPixels) {
      alert('Please wait a moment for the crop preview to load, then try again.');
      return;
    }

    try {
      setSaving(true);
      const mime = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      const blob = await getCroppedImageBlob(displaySrc, croppedAreaPixels, mime);
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      const base = fileName.replace(/\.[^.]+$/, '') || 'photo';
      const file = new File([blob], `${base}-cropped.${ext}`, { type: mime });
      const previewUrl = URL.createObjectURL(blob);
      onConfirm({ file, previewUrl });
    } catch (err) {
      console.error('Crop failed:', err);
      alert('Could not crop image. Try another photo or re-upload.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="font-bold text-[#0A0F2C]">Crop for circle</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-4 pt-3 text-sm text-slate-600">
          Drag to position and use zoom so the face fits inside the circle.
        </p>

        <div className="relative mx-4 mt-3 h-72 w-[calc(100%-2rem)] rounded-xl bg-slate-900 overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/80">
              Loading image…
            </div>
          ) : loadError ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-200">
              {loadError}
            </div>
          ) : (
            <Cropper
              image={displaySrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              roundCropAreaPixels
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropAreaChange}
              onCropAreaChange={onCropAreaChange}
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-4">
          <ZoomIn className="h-4 w-4 text-slate-500 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={loading || !!loadError}
            className="w-full accent-[#D90429]"
          />
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-lg border border-slate-300 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || loading || !!loadError}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#D90429] py-2.5 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {saving ? 'Applying…' : 'Use crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
