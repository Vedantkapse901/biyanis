import { useState } from 'react';
import { X, Image, Video, Upload } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export function SlideForm({ onClose, onSubmit, isLoading }) {
  const [step, setStep] = useState(1); // Step 1: Type selection, Step 2: Details
  const [type, setType] = useState(null); // 'image' or 'video'
  const [file, setFile] = useState(null);
  const [ctaText, setCtaText] = useState('Learn More');
  const [ctaUrl, setCtaUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const maxSizeMB = type === 'image' ? 5 : 50;

    if (selectedFile.size > maxSize) {
      setError(`File too large! Max size: ${maxSizeMB}MB`);
      return;
    }

    const isValidType =
      (type === 'image' && selectedFile.type.startsWith('image/')) ||
      (type === 'video' && selectedFile.type.startsWith('video/'));

    if (!isValidType) {
      setError(`Invalid file type! Please select a ${type}.`);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    onSubmit({
      type,
      file,
      cta: ctaText.trim() || 'Learn More',
      ctaUrl: ctaUrl.trim() || '#',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <GlassCard className="w-full max-w-md bg-white p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#0A0F2C]">
            {step === 1 ? 'Select Slide Type' : 'Slide Details'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Choose what type of media you want to add:</p>

            {/* Image Option */}
            <button
              onClick={() => {
                setType('image');
                setStep(2);
              }}
              className="w-full rounded-lg border-2 border-slate-200 p-6 text-center transition-all hover:border-[#D90429] hover:bg-blue-50"
            >
              <Image className="mx-auto mb-3 h-12 w-12 text-blue-600" />
              <h3 className="font-bold text-[#0A0F2C]">Image Slide</h3>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG (Max 5MB)</p>
            </button>

            {/* Video Option */}
            <button
              onClick={() => {
                setType('video');
                setStep(2);
              }}
              className="w-full rounded-lg border-2 border-slate-200 p-6 text-center transition-all hover:border-[#D90429] hover:bg-purple-50"
            >
              <Video className="mx-auto mb-3 h-12 w-12 text-purple-600" />
              <h3 className="font-bold text-[#0A0F2C]">Video Slide</h3>
              <p className="mt-1 text-xs text-slate-500">MP4, WebM (Max 50MB)</p>
            </button>

            {/* Info */}
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              💡 Videos auto-play and loop. Images are static. Choose based on your content!
            </div>
          </div>
        ) : (
          /* Step 2: Details Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-600">
                {type === 'image' ? '🖼️ Upload Image' : '🎥 Upload Video'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept={type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-[#D90429] hover:bg-slate-100"
                >
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                    <p className="text-sm font-bold text-slate-600">Click to upload</p>
                    <p className="text-xs text-slate-500">
                      {type === 'image' ? 'JPG, PNG • Max 5MB' : 'MP4, WebM • Max 50MB'}
                    </p>
                  </div>
                </label>
              </div>
              {file && (
                <p className="mt-2 text-xs text-green-600">
                  ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            {/* CTA Button Text */}
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-600">Button Text (Optional)</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g., Learn More, Enroll Now"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-[#0A0F2C] outline-none focus:border-[#D90429]"
              />
            </div>

            {/* CTA Button URL */}
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-600">Button Link (Optional)</label>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="e.g., /courses, https://example.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-[#0A0F2C] outline-none focus:border-[#D90429]"
              />
            </div>

            {/* Error Message */}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-[#0A0F2C] transition-colors hover:border-[#D90429] hover:text-[#D90429]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!file || isLoading}
                className="flex-1 rounded-lg bg-[#D90429] px-4 py-2 font-bold text-white transition-colors disabled:opacity-50 hover:bg-[#b00320]"
              >
                {isLoading ? '⏳ Saving...' : '✅ Save Slide'}
              </button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
