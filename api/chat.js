// api/chat.js - Vercel serverless function
// Запрос идёт: browser -> /api/chat -> Claude API -> browser

export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory } = req.body;

  // Проверяем API ключ
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Формируем сообщения для Claude
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Запрос к Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: messages,
        system: 'Ты добрый, терпеливый помощник для пожилого человека. Говори понятно, коротко и дружелюбно. Используй простые слова. Помни, что с тобой разговаривает пожилой человек, которому может быть сложно слышать - говори чётко и не спеши.'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message });
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    return res.status(200).json({
      message: assistantMessage,
      success: true
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
