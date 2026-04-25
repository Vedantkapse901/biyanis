import { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { generateAIContent } from '../api/gemini';

export function DoubtChatbot() {
  const { data } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm BJNP's AI Tutor. Ask me any JEE/NEET doubt!" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const endRef = useRef(null);
  const sendLockRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY < 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || sendLockRef.current) return;
    sendLockRef.current = true;
    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg].map((m) => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Conversation (latest message is the student's question; reply once with a full answer):\n${history}\nassistant:`;

    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await generateAIContent(
        prompt,
        "You are a JEE/NEET expert tutor for BJNP. Answer in one complete message: clear, concise, no mid-sentence cutoffs; text only, no markdown unless needed.",
        2048,
        data.settings.geminiApiKey,
      );
      setMessages((p) => [...p, { role: 'assistant', content: res }]);
    } finally {
      sendLockRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isTop && !isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex rounded-full bg-[#D90429] p-4 shadow-[0_4px_15px_rgba(217,4,41,0.4)] transition-all hover:scale-110 hover:bg-[#b00320]"
          >
            <Bot className="h-7 w-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 z-50 flex h-[500px] w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:w-[350px] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0A0F2C] p-4">
              <span className="flex items-center gap-2 font-bold text-white">
                <Bot className="h-5 w-5 text-[#D90429]" /> BJNP AI Tutor
              </span>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">
                <X />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-sm ${
                      m.role === 'user'
                        ? 'rounded-br-none bg-[#D90429] font-medium text-white shadow-sm'
                        : 'rounded-bl-none border border-slate-200 bg-white text-[#0A0F2C] shadow-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-xs italic text-slate-400">AI is typing...</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 bg-white p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a doubt..."
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-[#0A0F2C] outline-none focus:border-[#D90429]"
              />
              <button
                type="submit"
                disabled={!input || isLoading}
                className="rounded-full bg-[#D90429] p-2 text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
