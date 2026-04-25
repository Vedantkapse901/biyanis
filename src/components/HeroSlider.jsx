import { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export function HeroSlider() {
  const { data } = useContext(AppContext);
  const slides = data.slides || [];
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(null);

  // Auto-scroll every 5 seconds
  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
  };

  // Reset autoplay when user manually scrolls
  const handleManualScroll = (newIndex) => {
    setCurrent(newIndex);
    startAutoplay(); // Restart 5-second timer
  };

  useEffect(() => {
    if (!slides.length) return;
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [slides.length]);

  const activeSlide = slides[current] || {};

  useEffect(() => {
    console.log('Current slide:', activeSlide);
    console.log('Has CTA?', !!activeSlide.cta);
    console.log('Has CTA URL?', !!activeSlide.cta_url);
  }, [current, activeSlide]);

  return (
    <div className="relative mt-20 h-[calc(100vh-80px)] w-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Image/Video Display - No Text Overlay */}
          {activeSlide.type === 'video' ? (
            <video
              src={activeSlide.url}
              className="h-full w-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={activeSlide.url}
              alt="Slide"
              className="h-full w-full object-contain"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA Button */}
      {activeSlide.cta && activeSlide.cta_url && (
        <div className="absolute bottom-32 left-0 right-0 z-30 flex justify-center">
          <a
            href={activeSlide.cta_url}
            className="rounded-lg bg-[#D90429] px-8 py-3 font-bold text-white transition-all hover:bg-[#b00320] shadow-lg"
          >
            {activeSlide.cta}
          </a>
        </div>
      )}

      {/* Dot Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleManualScroll(i)}
            className={`h-3 rounded-full transition-all ${i === current ? 'w-8 bg-[#D90429]' : 'bg-white/50 hover:bg-white'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Left Arrow */}
      <button
        type="button"
        onClick={() => handleManualScroll(current === 0 ? slides.length - 1 : current - 1)}
        className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white transition-all hover:bg-[#D90429]/90 md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={() => handleManualScroll(current === slides.length - 1 ? 0 : current + 1)}
        className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white transition-all hover:bg-[#D90429]/90 md:block"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
