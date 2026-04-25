import { supabase } from '../lib/supabase'

/**
 * Search FAQs by user query
 * Returns best matching FAQ answers
 */
export async function searchFAQs(userQuery) {
  if (!userQuery || userQuery.trim().length === 0) {
    return {
      success: false,
      answer: 'Please ask a question to get help.',
      source: 'system',
    }
  }

  try {
    const query = userQuery.toLowerCase().trim()

    // Fetch all FAQs
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('id, question, answer, category, keywords')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching FAQs:', error)
      return {
        success: false,
        answer: 'Sorry, I could not search our database right now. Please try again later.',
        source: 'error',
      }
    }

    if (!faqs || faqs.length === 0) {
      return {
        success: false,
        answer: 'No FAQs found in our database. Please contact us directly.',
        source: 'error',
      }
    }

    // Score each FAQ based on relevance
    const scoredFAQs = faqs.map(faq => {
      const score = calculateRelevanceScore(query, faq)
      return { ...faq, score }
    })

    // Sort by score (highest first)
    const sorted = scoredFAQs.sort((a, b) => b.score - a.score)

    // Return top match if score is above threshold
    const topMatch = sorted[0]
    if (topMatch.score >= 2) {
      return {
        success: true,
        answer: topMatch.answer,
        source: 'faq',
        question: topMatch.question,
        category: topMatch.category,
        confidence: topMatch.score,
      }
    }

    // No good match found
    return {
      success: false,
      answer: `I couldn't find an answer to that question. Here's what I can help with:\n\n${getRandomFAQSuggestion(faqs)}`,
      source: 'suggestion',
    }
  } catch (error) {
    console.error('Chatbot service error:', error)
    return {
      success: false,
      answer: 'An unexpected error occurred. Please try again.',
      source: 'error',
    }
  }
}

/**
 * Calculate relevance score between user query and FAQ
 * Checks question, answer, keywords, and category
 */
function calculateRelevanceScore(query, faq) {
  let score = 0

  // Check question (highest weight)
  const questionWords = faq.question.toLowerCase().split(/\s+/)
  const matchedQuestionWords = questionWords.filter(word => query.includes(word))
  score += matchedQuestionWords.length * 2

  // Check keywords
  if (faq.keywords) {
    const keywordList = faq.keywords.toLowerCase().split(',').map(k => k.trim())
    const matchedKeywords = keywordList.filter(kw => query.includes(kw))
    score += matchedKeywords.length * 1.5
  }

  // Check answer (lower weight)
  const answerWords = faq.answer.toLowerCase().split(/\s+/)
  const matchedAnswerWords = answerWords.filter(word => query.includes(word) && word.length > 3)
  score += matchedAnswerWords.length * 0.5

  return score
}

/**
 * Get random FAQ for suggestion
 */
function getRandomFAQSuggestion(faqs) {
  const categories = {}

  // Group by category
  faqs.forEach(faq => {
    if (!categories[faq.category]) {
      categories[faq.category] = []
    }
    categories[faq.category].push(faq)
  })

  // Pick random category and FAQ
  const categoryNames = Object.keys(categories)
  const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)]
  const categoryFAQs = categories[randomCategory]
  const randomFAQ = categoryFAQs[Math.floor(Math.random() * categoryFAQs.length)]

  return `🔹 ${randomFAQ.question}\n"${randomFAQ.answer.substring(0, 100)}..."\n\nTry asking about: ${categoryNames.join(', ')}`
}

/**
 * Get all FAQs grouped by category
 * Useful for showing FAQ list to user
 */
export async function getFAQsByCategory() {
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('display_order')

    if (error) throw error

    const grouped = {}
    faqs.forEach(faq => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = []
      }
      grouped[faq.category].push(faq)
    })

    return { success: true, data: grouped }
  } catch (error) {
    console.error('Error fetching FAQs by category:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get specific FAQ by ID
 */
export async function getFAQById(id) {
  try {
    const { data: faq, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error

    return { success: true, data: faq }
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get website content summary for chatbot context
 * Includes courses, branches, downloads
 */
export async function getWebsiteContext() {
  try {
    const [coursesRes, branchesRes, downloadsRes] = await Promise.all([
      supabase.from('courses').select('title, description').limit(10),
      supabase.from('branches').select('name, address'),
      supabase.from('free_downloads').select('title'),
    ])

    const courses = coursesRes.data?.map(c => c.title).join(', ') || 'Not available'
    const branches = branchesRes.data?.map(b => b.name).join(', ') || 'Not available'
    const downloads = downloadsRes.data?.map(d => d.title).join(', ') || 'Not available'

    return {
      courses,
      branches,
      downloads,
    }
  } catch (error) {
    console.error('Error getting website context:', error)
    return null
  }
}

/**
 * Log chat interaction (optional - for analytics)
 */
export async function logChatInteraction(userQuery, answer, source) {
  try {
    const { error } = await supabase.from('chat_logs').insert({
      user_query: userQuery,
      answer: answer,
      source: source,
      created_at: new Date(),
    })

    if (error) console.error('Error logging chat:', error)
  } catch (error) {
    console.error('Error in logChatInteraction:', error)
  }
}
