import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';
import { ThemeButton } from '../components/ui/ThemeButton';

export function Contact() {
  const { data } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your inquiry! Our counselors will contact you shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const miraRoadBranch = data.branches.find((b) => b.name.includes('MIRA ROAD')) || data.branches[0];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
              Get in <AccentText>Touch</AccentText>
            </h1>
            <p className="text-lg text-slate-600">We are here to answer all your questions and guide your career path.</p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <GlassCard>
                <h3 className="mb-6 font-serif text-2xl font-bold text-[#0A0F2C]">Send an Inquiry</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-[#0A0F2C]">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] transition-colors focus:border-[#D90429] focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-bold text-[#0A0F2C]">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] transition-colors focus:border-[#D90429] focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-[#0A0F2C]">Phone</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] transition-colors focus:border-[#D90429] focus:outline-none"
                        placeholder="+91 90000 00000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-[#0A0F2C]">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] transition-colors focus:border-[#D90429] focus:outline-none"
                      placeholder="I am interested in..."
                    />
                  </div>
                  <ThemeButton type="submit" className="mt-4 w-full">
                    Submit Inquiry
                  </ThemeButton>
                </form>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <GlassCard className="group text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D90429]/10 transition-colors group-hover:bg-[#D90429]">
                    <Phone className="h-6 w-6 text-[#D90429] group-hover:text-white" />
                  </div>
                  <h4 className="mb-1 font-bold text-[#0A0F2C]">Admissions Helpdesk</h4>
                  <p className="font-bold text-slate-600">+91 98765 43210</p>
                </GlassCard>
                <GlassCard className="group text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D90429]/10 transition-colors group-hover:bg-[#D90429]">
                    <Mail className="h-6 w-6 text-[#D90429] group-hover:text-white" />
                  </div>
                  <h4 className="mb-1 font-bold text-[#0A0F2C]">Email Us</h4>
                  <p className="text-sm font-bold text-slate-600">info@biyanisjeeneet.com</p>
                </GlassCard>
              </div>

              <GlassCard className="relative flex h-auto flex-col items-center justify-center overflow-hidden border-2 border-[#8B0000] py-10 text-center group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-white/80" />
                <div className="relative z-10 w-full px-4">
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-[#D90429]" />
                  <h4 className="mb-2 font-serif text-xl font-bold uppercase text-[#0A0F2C]">{miraRoadBranch.name}</h4>
                  <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-slate-600">{miraRoadBranch.address}</p>
                  <a
                    href={miraRoadBranch.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A0F2C] bg-transparent px-6 py-2 text-sm font-bold text-[#0A0F2C] transition-all hover:bg-[#0A0F2C] hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> View on Maps
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
