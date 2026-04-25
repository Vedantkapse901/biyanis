import { Users, Bot, Award, Clock, Target, Star, Quote } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';

export function About() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Hero Header */}
          <div className="mb-20 text-center">
            <h1 className="mb-6 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
              About <AccentText>BJNP</AccentText>
            </h1>
            <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-slate-600">
              Established in 2020 with a clear and focused vision — to produce outstanding results in
              Engineering and Medical Entrance Examinations while nurturing students in a supportive
              and disciplined learning environment.
            </p>
          </div>

          {/* From the Director's Desk */}
          <div className="mb-24">
            <div className="overflow-hidden rounded-3xl bg-[#0A0F2C]">
              <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* Photo */}
                <div className="relative h-72 lg:h-auto">
                  <img
                    src="/founders.jpg"
                    alt="BJNP Founders — Rakesh Shah, Yashvardhan Biyani & Piyush Singh"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F2C]/60 via-transparent to-transparent lg:bg-gradient-to-r" />
                  <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                    <p className="text-sm font-semibold text-white">Our Founders</p>
                    <p className="text-xs text-[#D90429]">Rakesh Shah · Yashvardhan Biyani · Piyush Singh</p>
                  </div>
                </div>

                {/* Text */}
                <div className="px-8 py-12 md:px-12 md:py-14">
                  <div className="mb-6 flex items-center gap-3">
                    <Quote className="h-8 w-8 shrink-0 text-[#D90429]" />
                    <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
                      From the Director's Desk
                    </h2>
                  </div>

                  <div className="space-y-4 text-base leading-relaxed text-slate-300">
                    <p>
                      BJNP Coaching was established in <span className="font-semibold text-white">2020</span> with
                      a clear and focused vision: to produce outstanding results in Engineering and Medical
                      Entrance Examinations while nurturing students in a supportive and disciplined learning
                      environment.
                    </p>
                    <p>
                      Since its inception, BJNP Coaching has consistently delivered exceptional results over
                      the last <span className="font-semibold text-white">six years</span>, including top All
                      India Ranks in JEE Main, <span className="font-semibold text-white">two Maharashtra CET
                      Rank 1</span> holders, and numerous selections in{' '}
                      <span className="font-semibold text-white">AIIMS</span> and other premier medical
                      institutions.
                    </p>
                    <p>
                      BJNP is known for its caring, motivating, and student-centric environment, where learners
                      are encouraged to grow academically as well as personally — focusing on conceptual clarity,
                      disciplined practice, and holistic learning rather than rote methods.
                    </p>
                    <p>
                      At BJNP Coaching, success is built not only through results, but through{' '}
                      <span className="font-semibold text-white">confidence, consistency, and character</span> —
                      empowering students to achieve their highest potential.
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <p className="text-xs uppercase tracking-widest text-slate-400">Founded by</p>
                    <p className="mt-1 text-base font-semibold text-[#D90429]">
                      Rakesh Shah · Yashvardhan Biyani · Piyush Singh
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="mb-24 grid grid-cols-1 gap-8 md:grid-cols-2">
            <GlassCard className="border-l-4 border-[#0A0F2C]">
              <Target className="mb-6 h-12 w-12 text-[#D90429]" />
              <h2 className="mb-4 font-serif text-3xl font-bold text-[#0A0F2C]">Our Mission</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                To bring the Kota-style academic culture to Mumbai — combining rigorous preparation,
                structured routines, personal mentorship, and high academic standards — while ensuring
                every aspirant grows in confidence, consistency, and character.
              </p>
            </GlassCard>
            <GlassCard className="border-l-4 border-[#D90429]">
              <Star className="mb-6 h-12 w-12 text-[#D90429]" />
              <h2 className="mb-4 font-serif text-3xl font-bold text-[#0A0F2C]">Our Vision</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                To produce outstanding results in JEE and NEET through a caring, motivating, and
                student-centric environment — where conceptual clarity, disciplined practice, and
                holistic learning help every student achieve their highest potential.
              </p>
            </GlassCard>
          </div>

          {/* BJNP Advantage */}
          <div className="mb-20">
            <h2 className="mb-12 text-center font-serif text-3xl font-bold text-[#0A0F2C] md:text-5xl">
              The BJNP <AccentText>Advantage</AccentText>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Users className="h-8 w-8" />,
                  title: 'Kota-Style Culture',
                  desc: 'Bringing Mumbai the rigorous preparation, structured routines, and high academic standards of Kota — with personal mentorship.',
                },
                {
                  icon: <Award className="h-8 w-8" />,
                  title: 'Proven Track Record',
                  desc: 'Top All India Ranks in JEE Main, 2× Maharashtra CET Rank 1 holders, and numerous AIIMS selections since 2020.',
                },
                {
                  icon: <Bot className="h-8 w-8" />,
                  title: 'Holistic Learning',
                  desc: 'Conceptual clarity and disciplined practice over rote methods — a caring, student-centric environment that builds confidence.',
                },
                {
                  icon: <Clock className="h-8 w-8" />,
                  title: 'Six Years Strong',
                  desc: 'Consistently delivering exceptional results in JEE, NEET, and Maharashtra CET across six years of operation.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-[#D90429]/30 hover:shadow-md"
                >
                  <div className="mb-4 flex justify-center text-[#D90429]">{item.icon}</div>
                  <h3 className="mb-2 text-xl font-bold text-[#0A0F2C]">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
