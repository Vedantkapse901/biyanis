import { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export function GlobalWhatsApp() {
  const { data } = useContext(AppContext);
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY < 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const msg = encodeURIComponent("Hi, I'd like to know more about BJNP courses (IIT JEE, NEET, CET).");
  return (
    <AnimatePresence>
      {isTop && (
        <motion.a
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          href={`https://wa.me/${data.settings.whatsapp}?text=${msg}`}
          target="_blank"
          rel="noreferrer"
          className="group fixed bottom-6 left-6 z-40 flex items-center justify-center rounded-full bg-green-500 p-4 shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-transform hover:scale-110"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg bg-[#0A0F2C] px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
            Enquire Now
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
