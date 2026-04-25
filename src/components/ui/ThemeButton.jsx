export function ThemeButton({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseStyle =
    'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3 font-bold transition-all duration-300';
  const variants = {
    primary: 'bg-[#D90429] text-white shadow-lg shadow-[#D90429]/30 hover:bg-[#b00320]',
    secondary:
      'border-2 border-[#D90429] bg-transparent text-[#D90429] hover:bg-[#D90429]/10',
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
    </button>
  );
}
