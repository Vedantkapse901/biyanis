/** Concatenate all `text` segments from the first candidate (Gemini may return multiple parts). */
function textFromGenerateContentResponse(parsed) {
  const parts = parsed.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => (p && typeof p.text === 'string' ? p.text : ''))
    .join('')
    .trim();
}

export async function generateAIContent(prompt, systemInstruction, maxTokens = 2048, apiKey = '') {
  const key = String(apiKey || '').trim();
  if (!key) {
    return 'Add your Gemini API key in Admin → Settings to use the AI Tutor and Review Assistant. Get a free key at Google AI Studio.';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
  // Gemini 2.5 can use "thinking" tokens; small maxOutputTokens leaves almost no room for visible text.
  const outputBudget = Math.max(256, Math.min(Number(maxTokens) || 2048, 8192));
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      maxOutputTokens: outputBudget,
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('Gemini API non-JSON response:', raw.slice(0, 200));
      return 'AI service returned an unexpected response. Please try again.';
    }
    if (!response.ok) {
      const msg = parsed?.error?.message || 'API request failed';
      console.error('Gemini API Error:', parsed?.error || parsed);
      if (String(msg).toLowerCase().includes('leaked')) {
        return 'This API key was blocked (often because it was exposed publicly). Create a new key in Google AI Studio and update Admin → Settings.';
      }
      if (/thinking|ThinkingConfig|unknown field/i.test(String(msg))) {
        const fallbackPayload = {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            maxOutputTokens: outputBudget,
            temperature: 0.7,
          },
        };
        const response2 = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackPayload),
        });
        const raw2 = await response2.text();
        let parsed2;
        try {
          parsed2 = JSON.parse(raw2);
        } catch {
          return `AI error: ${msg}`;
        }
        if (response2.ok) {
          const t2 = textFromGenerateContentResponse(parsed2);
          if (t2) return t2;
        } else {
          console.error('Gemini API Error (fallback):', parsed2?.error || parsed2);
          return `AI error: ${parsed2?.error?.message || msg}`;
        }
      }
      return `AI error: ${msg}`;
    }
    const text = textFromGenerateContentResponse(parsed);
    if (text) return text;
    const block = parsed.promptFeedback?.blockReason;
    if (block) return 'That request was blocked by the AI safety filters. Try rephrasing.';
    return "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error(error);
    return 'Network error or API limit reached. Please try again.';
  }
}
