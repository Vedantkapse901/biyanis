# 🤖 AI Doubt Chatbot - Complete Guide

## WHERE IS THE CHATBOT?

### Location in Code
```
src/components/DoubtChatbot.jsx  ← The chatbot component
src/api/gemini.js                ← Google Gemini API integration
```

### On Website
The chatbot appears as a **floating red button** (🤖) in the bottom-right corner of the page when you scroll to the top.

---

## How It Works

```
User Types Question
        ↓
[Chatbot Component]
        ↓
[Google Gemini API]
        ↓
AI Tutor Response
        ↓
Message appears in chat
```

---

## Features

✅ **Floating Widget** - Red button (🤖) appears when you scroll to top
✅ **Chat Interface** - Clean message bubbles (user blue, AI white)
✅ **Real-time Typing** - Shows "AI is typing..." 
✅ **Smooth Animations** - Framer Motion transitions
✅ **Auto-scroll** - Messages auto-scroll to latest
✅ **Mobile Responsive** - Works on phone & desktop

---

## Setup (3 Steps)

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key
5. Example: `AIzaSyD1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m`

### Step 2: Add to .env.local

```env
VITE_GEMINI_API_KEY=AIzaSyD1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m
```

### Step 3: Add to Admin Settings

In Admin Panel:
1. Go to **Settings** tab
2. Find **Gemini API Key** field
3. Paste your API key
4. Click **"Save to Website"**

---

## How to Use the Chatbot

### For Users (Students)

1. **Scroll to top** of website
2. **Click red 🤖 button** (bottom-right)
3. **Type your question** in the input field
   - Example: "What is projectile motion?"
   - Example: "How to solve quadratic equations?"
   - Example: "Explain NEET biology concepts"
4. **Press Enter or click Send** (➤ icon)
5. **Wait for AI response** (shows "AI is typing...")
6. **See answer in chat** (white bubble)
7. **Ask follow-up questions** or close (X button)

### For Admins (Set API Key)

1. **Go to Admin Panel** (#/admin)
2. **Login** with password (Biyanis@123)
3. **Click Settings tab**
4. **Scroll to "Gemini API Key"**
5. **Paste your API key**
6. **Click "Save to Website"**
7. **Chatbot now active** ✅

---

## Component Files Explained

### DoubtChatbot.jsx (The UI)

```javascript
export function DoubtChatbot() {
  // Red button appears when scrolled to top
  if (isTop && !isOpen) {
    return <motion.button>🤖</motion.button>
  }
  
  // Chat window opens when button clicked
  if (isOpen) {
    return (
      <div>
        {/* Display all messages */}
        {messages.map(msg => <ChatBubble msg={msg} />)}
        
        {/* Input field */}
        <input placeholder="Ask a doubt..." />
        
        {/* Send button */}
        <button onClick={handleSend}>➤</button>
      </div>
    )
  }
}
```

**Key Features:**
- `isTop` - Tracks scroll position
- `isOpen` - Toggle chat window
- `messages` - Array of chat messages
- `handleSend` - Sends message to Gemini API

### gemini.js (The API)

```javascript
export async function generateAIContent(
  prompt,              // User's question
  systemInstruction,   // AI instructions
  maxTokens,          // Response length limit
  apiKey              // Your API key
) {
  // 1. Validate API key
  if (!apiKey) {
    return 'Add API key in Admin → Settings'
  }
  
  // 2. Send to Google Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    }
  )
  
  // 3. Parse response
  const parsed = await response.json()
  
  // 4. Extract text
  return parsed.candidates[0].content.parts[0].text
}
```

**System Instructions:**
> "You are a JEE/NEET expert tutor for BJNP. Answer in one complete message: clear, concise, no mid-sentence cutoffs; text only, no markdown unless needed."

---

## File Structure

```
src/
├── components/
│   └── DoubtChatbot.jsx        ← Chat UI component
├── api/
│   └── gemini.js               ← Gemini API calls
├── App.jsx
│   └── <DoubtChatbot />        ← Used here
└── main.jsx
```

---

## Data Flow

```
App.jsx (loads DoubtChatbot)
    ↓
DoubtChatbot.jsx
    ↓
User asks question
    ↓
handleSend() called
    ↓
generateAIContent() from gemini.js
    ↓
POST to: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    ↓
Google Gemini API processes question
    ↓
AI response returned
    ↓
Message added to chat
    ↓
User sees response
```

---

## Customization Options

### Change AI Personality

Edit `DoubtChatbot.jsx` line 47:

```javascript
// Current
"You are a JEE/NEET expert tutor for BJNP. Answer in one complete message..."

// Change to
"You are a friendly math teacher. Use emojis and simple explanations..."
```

### Change Button Color

Edit line 69:

```javascript
// Current red
className="... bg-[#D90429] ..."

// Change to blue
className="... bg-blue-600 ..."
```

### Change Chat Window Size

Edit line 82:

```javascript
// Current 350px width
className="... sm:w-[350px] ..."

// Make wider
className="... sm:w-[450px] ..."
```

### Change Initial Message

Edit line 11:

```javascript
// Current
{ role: 'assistant', content: "Hi! I'm BJNP's AI Tutor. Ask me any JEE/NEET doubt!" }

// Change to
{ role: 'assistant', content: "Hello! I'm your study buddy. What would you like to learn today?" }
```

---

## Troubleshooting

### ❌ "Add your Gemini API key" message appears

**Cause:** No API key in settings
**Solution:**
1. Go to Admin Panel (#/admin)
2. Settings tab
3. Paste Gemini API key
4. Save to Website

### ❌ Chatbot button not showing

**Cause:** You're not scrolled to top
**Solution:**
1. Scroll to top of page
2. Red 🤖 button should appear bottom-right
3. Scroll down - button disappears (intentional)

### ❌ "API request failed" error

**Cause:** Invalid or expired API key
**Solution:**
1. Create new key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update in Admin Settings
3. Try again

### ❌ "This API key was blocked"

**Cause:** Key was publicly exposed (committed to GitHub, etc.)
**Solution:**
1. Create new key at Google AI Studio
2. Never commit .env.local to GitHub
3. Use new key in settings

### ❌ Network error

**Cause:** 
- Internet connection issue
- API rate limit exceeded
- Google API down

**Solution:**
1. Check internet connection
2. Try again after few minutes
3. Check Google API status

### ❌ "That request was blocked by AI safety filters"

**Cause:** Question contains inappropriate content
**Solution:**
- Rephrase question
- Ask something appropriate

---

## Costs

### Google Gemini API Pricing

**Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- Sufficient for small classroom use

**Paid Tier:**
- $0.075 per 1M input tokens
- $0.30 per 1M output tokens
- Billed monthly

**Estimate for Biyanis:**
- 100 students × 5 questions/day = 500 questions/day
- Free tier covers this easily ✅

---

## Integration with Supabase

### Optional: Store Conversation History

Add to database:

```sql
CREATE TABLE ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  query TEXT,
  response TEXT,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Update `DoubtChatbot.jsx`:

```javascript
// Save conversation
await supabase.from('ai_conversations').insert({
  user_id: user?.id,
  query: userMsg.content,
  response: res,
  tokens_used: estimatedTokens,
})
```

Benefits:
- Analytics on student doubts
- Identify common topics
- AI improvement over time

---

## Advanced Features (Future)

### Coming Soon (Optional)

- [ ] Save conversation to database
- [ ] Search past conversations
- [ ] Export chats as PDF
- [ ] Rate AI responses
- [ ] Track API usage
- [ ] Multiple AI personalities
- [ ] Voice input/output
- [ ] Image upload support

---

## Security Notes

### ✅ Safe:
- API key stored in admin settings (not in code)
- Key protected by admin password
- Client-side only - no server needed

### ⚠️ Risk:
- Don't commit API key to GitHub
- Don't share in screenshots/messages
- Keep key private

### 🔐 Mitigation:
- Store key in admin panel
- Use environment variables in production
- Rotate key if compromised

---

## Testing the Chatbot

### Test Case 1: Basic Question
**Input:** "What is kinetic energy?"
**Expected:** AI tutor response about kinetic energy

### Test Case 2: Multi-turn Conversation
**Q1:** "Explain photosynthesis"
**Q2:** "What's the role of chlorophyll?"
**Expected:** Second response references photosynthesis context

### Test Case 3: No API Key
**Setup:** Remove API key from settings
**Input:** Ask any question
**Expected:** "Add your Gemini API key..." message

### Test Case 4: Mobile Responsive
**Device:** Mobile phone
**Action:** Click chatbot button, type question
**Expected:** Chat window resizes for mobile screen

---

## Complete Implementation Checklist

- [ ] Get Google Gemini API key
- [ ] Add to .env.local
- [ ] Restart dev server
- [ ] Go to Admin Panel
- [ ] Paste API key in Settings
- [ ] Click Save to Website
- [ ] Test chatbot on home page
- [ ] Ask test questions
- [ ] Verify responses appear
- [ ] Test on mobile
- [ ] Deploy to production

---

## Support & Resources

- **Google Gemini API Docs:** https://ai.google.dev/docs
- **Google AI Studio:** https://makersuite.google.com/app/apikey
- **Pricing:** https://ai.google.dev/pricing

---

## Quick Reference

| Item | Details |
|------|---------|
| Component | `DoubtChatbot.jsx` |
| API Integration | `gemini.js` |
| API Provider | Google Gemini 2.5 Flash |
| Model | gemini-2.5-flash |
| Max Response | 2048 tokens |
| Button Position | Bottom-right, when scrolled to top |
| Appears on | All pages |
| Requires Setup | Yes - add API key to admin settings |

---

*Last Updated: April 19, 2026*
*Status: Ready to Use ✅*
