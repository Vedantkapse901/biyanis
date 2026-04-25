import { motion } from 'framer-motion';
import { MapPin, Phone, Navigation, CheckCircle } from 'lucide-react';
import { useBranches } from '../hooks/useSupabaseData';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';

export function Branches() {
  const { data: branches, loading } = useBranches();

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading branches...</p>
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
            <h1 className="mb-4 font-serif text-4xl font-bold uppercase tracking-wider text-[#0A0F2C] md:text-6xl">
              Our <AccentText>Branches & Locations</AccentText>
            </h1>
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-[#D90429]" />
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              State-of-the-art infrastructure across Mumbai & Thane, designed to foster distraction-free learning.
            </p>
          </div>

          <div className="mb-24 grid h-[600px] grid-cols-1 gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative h-full overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md"
            >
              <iframe
                title="Branch map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.196568478477!2d72.8666046!3d19.2897795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b04735155555%3A0xc713c1d0cffe821c!2sBJNP!5e0!3m2!1sen!2sin!4v1711310000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-slate-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md">
                <p className="flex items-center gap-2 text-sm font-bold text-[#0A0F2C]">
                  <MapPin className="h-4 w-4 text-[#D90429]" /> Mumbai & Thane Region
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="custom-scrollbar h-full space-y-5 overflow-y-auto pb-4 pr-2"
            >
              {branches.map((branch) => (
                <GlassCard
                  key={branch.id}
                  className="group !p-6 flex flex-col justify-between transition-transform hover:-translate-y-1"
                >
                  <div>
                    <h3 className="mb-4 font-serif text-xl font-bold uppercase text-[#0A0F2C]">{branch.name}</h3>
                    <div className="mb-6 flex items-start gap-3">
                      <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-[#D90429]" />
                      <p className="text-sm leading-relaxed text-slate-600">{branch.address}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={branch.mapLink || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A0F2C] px-6 py-2.5 font-medium text-white shadow-md transition-colors hover:bg-[#D90429]"
                    >
                      <Navigation className="h-4 w-4" /> Get Directions
                    </a>
                    <span className="flex items-center gap-2 text-sm font-bold text-[#0A0F2C]">
                      <Phone className="h-4 w-4 text-[#D90429]" /> {branch.phone}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          </div>

          <div className="border-t border-slate-200 pt-16">
            <h2 className="mb-10 text-center font-serif text-3xl font-bold text-[#0A0F2C]">
              Premium <AccentText>Facilities</AccentText>
            </h2>
            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
              {[
                { title: 'Smart Classrooms', desc: 'Interactive 4K panels & acoustics.' },
                { title: 'Silent Library', desc: 'Access to 500+ reference books.' },
                { title: 'Doubt Rooms', desc: '1-on-1 faculty availability.' },
                { title: 'CBT Labs', desc: 'Computer labs for mock tests.' },
              ].map((facility, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#D90429]/30 hover:shadow-md"
                >
                  <CheckCircle className="mx-auto mb-3 h-8 w-8 text-[#D90429]" />
                  <h4 className="mb-2 font-bold text-[#0A0F2C]">{facility.title}</h4>
                  <p className="text-xs text-slate-500">{facility.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
