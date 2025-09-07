const axios = require('axios');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "No research topic provided" });
    }
    
    const cleanTopic = topic.replace(/\s+/g, '_');
    const wikiResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTopic)}`);
    
    let summary = '';
    let citations = [];
    
    if (wikiResponse.data && wikiResponse.data.extract) {
      summary = `**${wikiResponse.data.title}**\n\n${wikiResponse.data.extract}`;
      citations.push({
        title: wikiResponse.data.title,
        url: wikiResponse.data.content_urls.desktop.page
      });
    } else {
      summary = `No information found for "${topic}". Try a different search term.`;
      citations = [
        { title: `Search "${topic}" on Wikipedia`, url: `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(topic)}` }
      ];
    }
    
    res.json({
      summary: summary,
      citations: citations
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch data",
      message: error.message 
    });
  }
}
