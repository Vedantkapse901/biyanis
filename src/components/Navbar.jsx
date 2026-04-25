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

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Study Material', path: '/study-material' },
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
          ? 'border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur-md'
          : 'border-b border-slate-100 bg-white/95 py-5 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <img src="/logo.png" alt="BJNP logo" className="h-10 w-10 rounded-full object-contain" />
            </div>
            <span className="font-serif text-2xl font-black tracking-tight">
              <span className="text-[#2563eb]">B</span>
              <span className="text-[#D90429]">JNP</span>
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-5">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${
                    location.pathname === link.path
                      ? 'border-b-2 border-[#D90429] text-[#D90429]'
                      : 'text-slate-600 hover:text-[#D90429]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-[#0A0F2C] hover:text-[#D90429]"
            onClick={() => setIsOpen(!isOpen)}
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
            className="absolute left-0 top-full w-full overflow-hidden border-b border-slate-200 bg-white shadow-lg md:hidden"
          >
            <div className="space-y-1 px-4 py-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block border-b border-slate-100 px-3 py-4 text-base font-bold last:border-0 ${
                    location.pathname === link.path ? 'text-[#D90429]' : 'text-slate-600 hover:text-[#D90429]'
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
