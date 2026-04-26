// api/ai.js — Vercel Serverless Function
// This keeps your Gemini API key secure on the server side.
// The browser NEVER sees the API key.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Please add GEMINI_API_KEY to Vercel environment variables.' });
  }

  const { prompt, systemCtx } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  // Build messages
  const messages = [];
  if (systemCtx) {
    messages.push({ role: 'user', parts: [{ text: systemCtx + '\n\n' + prompt }] });
  } else {
    messages.push({ role: 'user', parts: [{ text: prompt }] });
  }

  // Use gemini-2.0-flash — free tier, fast, reliable
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);

      // Parse and return a helpful error
      let errMsg = `Gemini API error (${response.status})`;
      try {
        const errJson = JSON.parse(errorBody);
        errMsg = errJson?.error?.message || errMsg;
      } catch {}

      return res.status(response.status).json({ error: errMsg });
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(200).json({ text: 'No response generated. Try rephrasing your question.' });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
