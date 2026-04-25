import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Copy } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { generateAIContent } from '../api/gemini';
import { ThemeButton } from './ui/ThemeButton';

export function SmartReviewModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { data } = useContext(AppContext);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    setStep(2);

    const prompt = `Generate a genuine Google review (2-3 sentences) for BJNP (IIT JEE, NEET, CET coaching). User: ${name}. Rating: ${rating}/5. Note: "${note || 'Good coaching'}". First person, authentic, no quotes.`;
    const systemPrompt = 'You are an expert at writing realistic local business reviews.';

    const result = await generateAIContent(prompt, systemPrompt, 1024, data.settings.geminiApiKey);
    setGeneratedReview(result);
    setIsLoading(false);
  };

  const handleCopyAndRedirect = () => {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(generatedReview);
    else {
      const ta = document.createElement('textarea');
      ta.value = generatedReview;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }

    setIsCopied(true);
    setTimeout(() => {
      window.open(data.settings.reviewLink, '_blank');
      onClose();
      setTimeout(() => {
        setStep(1);
        setName('');
        setNote('');
        setIsCopied(false);
      }, 500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A0F2C]/60 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <h3 className="mb-6 flex items-center gap-2 font-serif text-xl font-bold text-[#0A0F2C]">
          <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" /> AI Review Assistant
        </h3>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-[#0A0F2C] focus:border-[#D90429] focus:outline-none"
            />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  role="button"
                  tabIndex={0}
                  onClick={() => setRating(s)}
                  onKeyDown={(e) => e.key === 'Enter' && setRating(s)}
                  className={`h-8 w-8 cursor-pointer ${rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Quick Note (Optional)"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-[#0A0F2C] focus:border-[#D90429] focus:outline-none"
            />
            <ThemeButton onClick={handleGenerate} disabled={!name} className="w-full">
              Generate Review
            </ThemeButton>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            {isLoading ? (
              <div className="py-10">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent" />
                <p className="font-bold text-[#D90429]">Crafting review...</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left font-medium text-slate-700">
                  {generatedReview}
                </div>
                {isCopied ? (
                  <div className="rounded-lg border border-green-200 bg-green-100 p-3 font-bold text-green-700">
                    Redirecting to Google...
                  </div>
                ) : (
                  <ThemeButton onClick={handleCopyAndRedirect} className="w-full">
                    <Copy className="h-4 w-4" /> Looks Good! Copy & Post
                  </ThemeButton>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
