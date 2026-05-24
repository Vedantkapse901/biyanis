import { motion } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';
import { HallOfFameCarousel } from '../components/HallOfFameCarousel';
import { useResults } from '../hooks/useSupabaseData';
import { filterHallOfFame, filterTopAchievers } from '../lib/dedupeResults';
import { ResolvedImage } from '../components/ResolvedImage';

export function Results() {
  const { data: results, loading } = useResults();

  if (loading) {
    return (
      <PageTransition>
        <div className="page-shell flex items-center justify-center bg-[#F8F9FA]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent mx-auto" />
            <p className="mt-4 text-slate-600">Loading results...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const hallOfFameResults = filterHallOfFame(results);
  const topAchieversResults = filterTopAchievers(results);

  return (
    <PageTransition>
      <motion.div
        className="page-shell overflow-hidden bg-[#F8F9FA]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto mb-16 max-w-7xl px-4 text-center sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
            Hall of <AccentText>Fame</AccentText>
          </h1>
          <p className="text-lg text-slate-600">Consistent top ranks year after year.</p>
        </motion.div>

        {hallOfFameResults.length > 0 ? (
          <motion.div
            className="mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HallOfFameCarousel results={hallOfFameResults} alwaysRoll />
          </motion.div>
        ) : (
          <div className="mb-24 text-center text-slate-600">No Hall of Fame entries yet.</div>
        )}

        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="mb-10 border-t border-slate-200 pt-16 text-center font-serif text-3xl font-bold text-[#0A0F2C]">
            Our <AccentText>Top Achievers</AccentText>
          </h2>
          <p className="-mt-6 mb-10 text-center text-slate-600">
            College admissions, entrance exams, and outstanding ranks.
          </p>
          {topAchieversResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {topAchieversResults.map((topper) => (
                <GlassCard
                  key={topper.id}
                  className="group relative overflow-hidden text-center hover:-translate-y-2"
                >
                  <motion.div
                    className="absolute left-0 top-0 h-2 w-full bg-[#D90429]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="relative mx-auto mb-5 mt-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 transition-colors group-hover:border-[#D90429]">
                    {topper.photo ? (
                      <ResolvedImage src={topper.photo} alt={topper.name} className="h-full w-full object-cover" />
                    ) : (
                      <motion.div
                        className="flex h-full w-full items-center justify-center bg-[#0A0F2C] font-serif text-4xl font-bold text-white"
                        whileHover={{ scale: 1.1 }}
                      >
                        {topper.name?.charAt(0) || 'S'}
                      </motion.div>
                    )}
                  </div>
                  <h4 className="mb-1 text-xl font-bold text-[#0A0F2C]">{topper.name}</h4>
                  {(topper.achievement || topper.rank) && (
                    <span className="mb-2 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-[#D90429]">
                      {topper.achievement || topper.rank}
                    </span>
                  )}
                  {topper.college && (
                    <p className="mb-1 text-sm font-semibold text-slate-700">{topper.college}</p>
                  )}
                  {topper.exam && (
                    <p className="mb-3 text-xs text-slate-500">{topper.exam}</p>
                  )}
                  {topper.remark && (
                    <p className="mb-3 text-sm italic text-slate-600">&ldquo;{topper.remark}&rdquo;</p>
                  )}
                </GlassCard>
              ))}
            </div>
          ) : (
            <motion.div
              className="py-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-slate-600">No top achievers yet. Add students under &ldquo;Top Achievers&rdquo; in the admin panel.</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
