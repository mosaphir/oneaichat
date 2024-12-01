export default async function handler(req, res) {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch(`https://chat.onedevai.workers.dev/?prompt=${encodeURIComponent(prompt)}`);
    const data = await response.text();
    res.status(200).json({ response: data });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch response from API.' });
  }
}
