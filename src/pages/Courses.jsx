import { motion } from 'framer-motion';
import { useCourses, useSettings } from '../hooks/useSupabaseData';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';
import { ThemeButton } from '../components/ui/ThemeButton';

export function Courses() {
  const { data: courses, loading } = useCourses();
  const { settings } = useSettings();
  const msg = encodeURIComponent("Hi, I'd like to know more about the courses.");

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading courses...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
              Elite <AccentText>Programs</AccentText>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Bringing Mumbai the rigorous preparation, structured routines, and personal mentorship of Kota — with a caring, student-centric environment since 2020.
            </p>
          </div>

          <div className="mb-24 grid grid-cols-1 gap-8 md:grid-cols-2">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="group relative flex h-full flex-col justify-between overflow-hidden">
                  <div>
                    <div className="absolute right-4 top-4 rounded-full bg-[#0A0F2C] px-3 py-1 text-xs font-bold text-white">
                      {course.badge}
                    </div>
                    <h3 className="mb-2 font-serif text-3xl font-bold text-[#0A0F2C]">{course.title}</h3>
                    <p className="mb-4 inline-block rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                      Duration: {course.duration}
                    </p>
                    <p className="mb-6 leading-relaxed text-slate-600">{course.description}</p>
                  </div>
                  <a href={`https://wa.me/${settings?.whatsapp || '917208324505'}?text=${msg}`} target="_blank" rel="noreferrer">
                    <ThemeButton variant="secondary" className="w-full">
                      Enquire Now via WhatsApp
                    </ThemeButton>
                  </a>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 border-t border-slate-200 pt-16 text-center">
            <h2 className="mb-12 font-serif text-3xl font-bold text-[#0A0F2C] md:text-5xl">
              The BJNP <AccentText>Methodology</AccentText>
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="relative mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#D90429] text-xl font-bold text-white shadow-md">
                  1
                </div>
                <h3 className="mb-2 mt-6 text-xl font-bold text-[#0A0F2C]">Conceptual Clarity</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Starting from fundamentals, we build a rock-solid foundation through understanding — not rote learning. Clarity first, complexity second.
                </p>
              </div>
              <div className="relative mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#D90429] text-xl font-bold text-white shadow-md">
                  2
                </div>
                <h3 className="mb-2 mt-6 text-xl font-bold text-[#0A0F2C]">Disciplined Practice</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Daily Practice Papers, weekly quizzes, and HOTS questions within structured routines — the same Kota discipline that produces top rankers.
                </p>
              </div>
              <div className="relative mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#D90429] text-xl font-bold text-white shadow-md">
                  3
                </div>
                <h3 className="mb-2 mt-6 text-xl font-bold text-[#0A0F2C]">Holistic Learning</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  All-India level mock tests with personal mentorship and AI gap analysis — building confidence, consistency, and character in every student.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
