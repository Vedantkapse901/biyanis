import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
