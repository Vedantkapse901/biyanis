import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, AlertCircle, HelpCircle } from 'lucide-react'
import { searchFAQs, getFAQsByCategory } from '../api/chatbotService'

export function DoubtChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm here to help with questions about Biyanis courses, admissions, and our programs. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTop, setIsTop] = useState(true)
  const [faqList, setFaqList] = useState(null)
  const [showFAQs, setShowFAQs] = useState(false)
  const endRef = useRef(null)
  const sendLockRef = useRef(false)

  // Auto-scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY < 50)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load FAQs when chat opens (optional, for FAQ list feature)
  useEffect(() => {
    if (isOpen && !faqList) {
      loadFAQs()
    }
  }, [isOpen])

  async function loadFAQs() {
    try {
      const { data } = await getFAQsByCategory()
      if (data) {
        setFaqList(data)
      }
    } catch (error) {
      console.error('Error loading FAQs:', error)
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault()

    if (!input.trim() || isLoading || sendLockRef.current) return

    sendLockRef.current = true
    const userMsg = { role: 'user', content: input.trim() }

    // Add user message to chat
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Search FAQs for answer
      const result = await searchFAQs(input.trim())

      // Create assistant message with source info
      let assistantContent = result.answer

      // Add source attribution
      if (result.source === 'faq') {
        assistantContent += `\n\n_Answer from: ${result.category} FAQ_`
      } else if (result.source === 'suggestion') {
        assistantContent += '\n\n_No exact match found. Here are some suggestions:_'
      }

      const assistantMsg = {
        role: 'assistant',
        content: assistantContent,
        source: result.source,
        confidence: result.confidence,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your question. Please try again.',
        source: 'error',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      sendLockRef.current = false
      setIsLoading(false)
    }
  }

  const handleFAQClick = (faq) => {
    setInput(faq.question)
    setShowFAQs(false)
  }

  return (
    <>
      {/* Floating Button */}
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
            title="Open help chat"
          >
            <Bot className="h-7 w-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 z-50 flex h-[500px] w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:w-[400px] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0A0F2C] p-4">
              <span className="flex items-center gap-2 font-bold text-white">
                <Bot className="h-5 w-5 text-[#D90429]" />
                Biyanis Help
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-sm ${
                      msg.role === 'user'
                        ? 'rounded-br-none bg-[#D90429] font-medium text-white shadow-sm'
                        : msg.source === 'faq'
                          ? 'rounded-bl-none border-2 border-green-200 bg-green-50 text-slate-800 shadow-sm'
                          : 'rounded-bl-none border border-slate-200 bg-white text-slate-800 shadow-sm'
                    }`}
                  >
                    {msg.content}

                    {/* Confidence indicator for FAQ matches */}
                    {msg.source === 'faq' && msg.confidence && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                        <span>✓ Match confidence: {Math.round(msg.confidence * 10) / 10}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-bl-none border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 delay-100" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* FAQ List Toggle */}
            {faqList && (
              <div className="border-t border-slate-200 bg-slate-100 px-3 py-2">
                <button
                  onClick={() => setShowFAQs(!showFAQs)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  <HelpCircle className="h-4 w-4" />
                  {showFAQs ? 'Hide FAQ' : 'Show FAQ'}
                </button>

                {/* FAQ Dropdown */}
                {showFAQs && (
                  <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded border border-slate-300 bg-white p-2">
                    {Object.entries(faqList).map(([category, faqs]) => (
                      <div key={category}>
                        <p className="text-xs font-bold text-slate-600 px-2 py-1">{category}</p>
                        {faqs.map(faq => (
                          <button
                            key={faq.id}
                            onClick={() => handleFAQClick(faq)}
                            className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            • {faq.question}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 bg-white p-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about courses, admissions..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:border-[#D90429] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-full bg-[#D90429] p-2 text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Info Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="flex items-center justify-center gap-1 text-xs text-slate-600">
                <AlertCircle className="h-3 w-3" />
                Answers based on website content only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
