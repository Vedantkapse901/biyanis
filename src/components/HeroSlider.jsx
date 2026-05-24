import { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export function HeroSlider() {
  const { data } = useContext(AppContext);
  const slides = data.slides || [];
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(null);

  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (slides.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
  };

  const handleManualScroll = (newIndex) => {
    setCurrent(newIndex);
    startAutoplay();
  };

  useEffect(() => {
    if (!slides.length) return undefined;
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [slides.length]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  if (!slides.length) return null;

  const activeSlide = slides[current] || slides[0];

  return (
    <div className="relative mt-20 w-full">
      <div className="relative w-full">
        {activeSlide.type === 'video' ? (
          <motion.video
            key={activeSlide.url || current}
            src={activeSlide.url}
            className="block h-auto w-full max-w-full"
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <motion.img
            key={activeSlide.url || current}
            src={activeSlide.url}
            alt={activeSlide.headline || 'Banner'}
            className="block h-auto w-full max-w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {activeSlide.cta && activeSlide.cta_url && (
          <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center md:bottom-12">
            <a
              href={activeSlide.cta_url}
              className="rounded-lg bg-[#D90429] px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-[#b00320]"
            >
              {activeSlide.cta}
            </a>
          </div>
        )}

        {slides.length > 1 && (
          <>
            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-3 md:bottom-6">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleManualScroll(i)}
                  className={`h-3 rounded-full transition-all ${i === current ? 'w-8 bg-[#D90429]' : 'bg-white/70 hover:bg-white'}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleManualScroll(current === 0 ? slides.length - 1 : current - 1)}
              className="absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white transition-all hover:bg-[#D90429]/90 md:block"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={() => handleManualScroll(current === slides.length - 1 ? 0 : current + 1)}
              className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white transition-all hover:bg-[#D90429]/90 md:block"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
