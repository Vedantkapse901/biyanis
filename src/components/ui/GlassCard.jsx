import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-md transition-all duration-300 sm:p-6 md:hover:-translate-y-1 md:hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
