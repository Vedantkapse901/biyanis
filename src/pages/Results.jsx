import { motion } from 'framer-motion';
import { useResults } from '../hooks/useSupabaseData';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';

export function Results() {
  const { data: results, loading } = useResults();

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading results...</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden bg-[#F8F9FA] pb-24 pt-32">
        <div className="mx-auto mb-16 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
            Hall of <AccentText>Fame</AccentText>
          </h1>
          <p className="text-lg text-slate-600">Consistent top ranks year after year.</p>
        </div>

        <div className="relative mb-24 flex w-full overflow-x-hidden">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-32 bg-gradient-to-r from-[#F8F9FA] to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-32 bg-gradient-to-l from-[#F8F9FA] to-transparent" />
          <motion.div
            className="flex gap-6 whitespace-nowrap px-4 py-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          >
            {[...results, ...results, ...results].map((topper, i) => (
              <GlassCard
                key={i}
                className="flex min-w-[320px] flex-shrink-0 items-center gap-4 border-l-4 border-l-[#D90429] px-6 py-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {topper.image ? (
                    <img src={topper.image} alt={topper.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="font-serif text-2xl font-black text-[#0A0F2C]">
                      {topper.name?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0A0F2C]">{topper.name}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl font-black text-[#D90429]">{topper.score}</span>
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                      {topper.exam} '{topper.year?.slice(2) || ''}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 border-t border-slate-200 pt-16 text-center font-serif text-3xl font-bold text-[#0A0F2C]">
            Our <AccentText>Top Achievers</AccentText>
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((topper, i) => (
              <GlassCard
                key={`grid-${i}`}
                className="group relative overflow-hidden text-center hover:-translate-y-2"
              >
                <div className="absolute left-0 top-0 h-2 w-full bg-[#D90429]" />
                <div className="relative mx-auto mb-5 mt-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 transition-colors group-hover:border-[#D90429]">
                  {topper.image ? (
                    <img src={topper.image} alt={topper.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#0A0F2C] font-serif text-4xl font-bold text-white">
                      {topper.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div className="absolute bottom-0 z-10 w-full bg-[#0A0F2C]/90 py-0.5 text-center text-[10px] font-bold text-white">
                    {topper.year}
                  </div>
                </div>
                <h4 className="mb-1 text-xl font-bold text-[#0A0F2C]">{topper.name}</h4>
                <span className="mb-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {topper.exam}
                </span>
                <div className="text-3xl font-black text-[#D90429]">{topper.score}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
