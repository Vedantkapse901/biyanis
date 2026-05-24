import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, FileText, Zap, Video, Trophy, Map } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';
const materials = [
  {
    title: 'Smart Q&A Banks',
    icon: <HelpCircle className="h-8 w-8" />,
    desc: 'Topic-wise questions graded by difficulty to build concepts from ground up.',
  },
  {
    title: 'Interactive Worksheets',
    icon: <FileText className="h-8 w-8" />,
    desc: "Daily practice papers (DPPs) tailored to the day's lectures.",
  },
  {
    title: 'HOTs Questions',
    icon: <Zap className="h-8 w-8" />,
    desc: 'High Order Thinking Skills questions for top-tier ranks in Advanced.',
  },
  {
    title: 'HD Video Lectures',
    icon: <Video className="h-8 w-8" />,
    desc: 'Missed a class? Watch 4K recorded sessions of our top educators anytime.',
  },
  {
    title: 'Mock Test Series',
    icon: <Trophy className="h-8 w-8" />,
    desc: 'All-India level simulated tests with exact NTA UI and instant AI analysis.',
  },
  {
    title: 'Revision Maps',
    icon: <Map className="h-8 w-8" />,
    desc: 'Mind maps and formula sheets for lightning-fast pre-exam revision.',
  },
];

export function StudyMaterial() {
  return (
    <PageTransition>
      <div className="page-shell bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
              Next-Level <AccentText>Study Arsenal</AccentText>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Access our exhaustive library of digital and physical study materials curated by India's top educators.
            </p>
          </div>

          <div className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((mat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="group flex h-full flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D90429]/10 text-[#D90429] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D90429] group-hover:text-white">
                    {mat.icon}
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-bold text-[#0A0F2C]">{mat.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{mat.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-16 text-center">
            <Link
              to="/student-login"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#D90429] px-8 py-3 font-bold text-white shadow-lg shadow-[#D90429]/30 transition-all duration-300 hover:bg-[#b00320]"
            >
              <span className="relative z-10">Access Full Student Portal</span>
              <div className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
