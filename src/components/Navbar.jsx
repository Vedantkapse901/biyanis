import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Student Portal', path: '/student-login' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Results', path: '/results' },
    { name: 'Branches', path: '/branches' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200 bg-white/95 py-2 shadow-sm backdrop-blur-md'
          : 'border-b border-slate-100 bg-white/95 py-3 backdrop-blur-sm sm:py-4'
      }`}
      id="main-navbar"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 sm:h-12 sm:w-12">
              <img src="/logo.png" alt="BJNP logo" className="h-8 w-8 rounded-full object-contain sm:h-10 sm:w-10" />
            </div>
            <span className="truncate font-serif text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-[#2563eb]">B</span>
              <span className="text-[#D90429]">JNP</span>
            </span>
          </Link>

          <div className="hidden lg:block">
            <div className="ml-6 flex flex-wrap items-center gap-1 xl:gap-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`rounded-md px-2.5 py-2 text-sm font-bold transition-all xl:px-3 ${
                    location.pathname === link.path
                      ? 'border-b-2 border-[#D90429] text-[#D90429]'
                      : 'text-slate-600 hover:border-b-2 hover:border-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="tap-target text-[#0A0F2C] hover:text-[#D90429] lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute left-0 top-full max-h-[70vh] w-full overflow-y-auto border-b border-slate-200 bg-white shadow-lg custom-scrollbar lg:hidden"
          >
            <div className="space-y-1 px-3 py-2 sm:px-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block min-h-12 rounded-lg px-3 py-3 text-base font-bold ${
                    location.pathname === link.path
                      ? 'bg-[#D90429]/10 text-[#D90429]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#D90429]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
