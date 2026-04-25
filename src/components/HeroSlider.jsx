import { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { ThemeButton } from './ui/ThemeButton';

export function HeroSlider() {
  const { data } = useContext(AppContext);
  const slides = data.slides || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[current] || {};

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0A0F2C]">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 z-10 bg-black/60" />

          {activeSlide.type === 'video' ? (
            <video
              src={activeSlide.url}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={activeSlide.url}
              alt="Hero"
              className="h-full w-full origin-center object-cover animate-[kenburns_10s_ease-out_forwards]"
            />
          )}

          <div className="absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
            <div className="max-w-4xl">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 font-serif text-5xl font-black leading-tight text-white drop-shadow-2xl md:text-7xl"
              >
                {activeSlide.headline}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-10 text-xl font-light text-gray-200 drop-shadow-md md:text-2xl"
              >
                {activeSlide.sub}
              </motion.p>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <ThemeButton>{activeSlide.cta}</ThemeButton>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-3 rounded-full transition-all ${i === current ? 'w-8 bg-[#D90429]' : 'bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1))}
        className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition-all hover:bg-[#D90429]/80 md:block"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => setCurrent((p) => (p === slides.length - 1 ? 0 : p + 1))}
        className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition-all hover:bg-[#D90429]/80 md:block"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
