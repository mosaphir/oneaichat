export default async function handler(req, res) {
  try {
    const { prompt } = req.query;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Send request to external API
    const response = await fetch(`https://chat.onedevai.workers.dev/?prompt=${encodeURIComponent(prompt)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from external API' });
    }

    const data = await response.json();

    // Extract and join all response texts
    const botResponses = data.map((item) => item.response?.response).join(' ');

    // Send back the bot response
    res.status(200).json({ response: botResponses });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
