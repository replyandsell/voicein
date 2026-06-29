export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, conversationHistory } = req.body;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: 'Ты добрый, терпеливый и заботливый помощник для пожилого человека. Говори просто и понятно. Будь позитивным и поддерживающим.',
        messages: [
          ...conversationHistory,
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const assistantMessage = data.content[0].text;

    res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Ошибка: ' + error.message });
  }
}
