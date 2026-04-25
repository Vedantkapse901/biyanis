import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, BookOpen, Trophy, Star, Quote } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';
import { HeroSlider } from '../components/HeroSlider';

function Counter({ value }) {
  const numeric = useMemo(() => Number(String(value).replace(/[^0-9.]/g, '')) || 0, [value]);
  const suffix = useMemo(() => String(value).replace(/[0-9.]/g, ''), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let rafId;
    const start = performance.now();
    const duration = 1400;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(numeric * progress));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [numeric]);

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Home() {
  return (
    <PageTransition>
      <HeroSlider />
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-slate-200 md:h-48 md:w-48">
            <img
              src="/logo.png"
              alt="BJNP logo"
              className="h-32 w-32 rounded-full object-contain md:h-40 md:w-40"
            />
          </div>
        </div>
      </section>
      <section className="relative z-20 border-y border-slate-200 bg-[#0A0F2C] py-16 shadow-lg">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { n: '10,000+', l: 'Students' },
            { n: '98%', l: 'Success Rate' },
            { n: '6+', l: 'Years Strong' },
            { n: '5', l: 'Branches' },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-2 text-4xl font-black text-white md:text-5xl">
                <Counter value={c.n} />
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-[#D90429]">{c.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#F8F9FA] py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-16 font-serif text-4xl font-bold text-[#0A0F2C] md:text-5xl">
            Explore <AccentText>Excellence</AccentText>
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Link to="/courses">
              <GlassCard className="group flex h-full cursor-pointer flex-col items-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0F2C]/5 transition-colors group-hover:bg-[#D90429]/10">
                  <Target className="h-10 w-10 text-[#D90429]" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#0A0F2C]">Premium Courses</h3>
                <p className="text-slate-600">Kota-style JEE & NEET programs, now in Mumbai.</p>
              </GlassCard>
            </Link>
            <Link to="/study-material">
              <GlassCard className="group flex h-full cursor-pointer flex-col items-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0F2C]/5 transition-colors group-hover:bg-[#D90429]/10">
                  <BookOpen className="h-10 w-10 text-[#D90429]" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#0A0F2C]">Study Material</h3>
                <p className="text-slate-600">HOTs, mock tests & disciplined practice resources.</p>
              </GlassCard>
            </Link>
            <Link to="/results">
              <GlassCard className="group flex h-full cursor-pointer flex-col items-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0F2C]/5 transition-colors group-hover:bg-[#D90429]/10">
                  <Trophy className="h-10 w-10 text-[#D90429]" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#0A0F2C]">Hall of Fame</h3>
                <p className="text-slate-600">Top AIRs, MHT-CET Rank 1s & AIIMS selections.</p>
              </GlassCard>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-5xl">
              Student <AccentText>Success Stories</AccentText>
            </h2>
            <p className="text-slate-600">Six years of confidence, consistency, and character — hear from those who made it.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <GlassCard className="relative border-none bg-slate-50 shadow-sm hover:shadow-md">
              <Quote className="absolute right-4 top-4 h-12 w-12 text-[#D90429]/10" />
              <div className="mb-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mb-6 italic text-slate-700">
                "The faculty here is top-notch. The mock tests were exactly at the level of JEE Advanced, which made
                the actual exam feel like a breeze. The AI doubt solver changed how I study at night!"
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A0F2C] font-serif text-xl font-bold text-white">
                  V
                </div>
                <div>
                  <h4 className="font-bold text-[#0A0F2C]">Vikram Singh</h4>
                  <p className="text-sm font-medium text-[#D90429]">JEE Advanced AIR 210</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="relative border-none bg-slate-50 shadow-sm hover:shadow-md">
              <Quote className="absolute right-4 top-4 h-12 w-12 text-[#D90429]/10" />
              <div className="mb-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mb-6 italic text-slate-700">
                "Cracked NEET with 690 marks purely because of their HOTs worksheets and mock tests. The personal
                attention from the biology faculty helped me clear all my conceptual doubts instantly."
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A0F2C] font-serif text-xl font-bold text-white">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-[#0A0F2C]">Anjali Mehta</h4>
                  <p className="text-sm font-medium text-[#D90429]">NEET Score 690/720</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
