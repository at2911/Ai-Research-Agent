const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Wikipedia API function (free, no API key needed)
async function getWikipediaSummary(topic) {
  try {
    const cleanTopic = topic.replace(/\s+/g, '_');
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTopic)}`);
    return {
      title: response.data.title,
      summary: response.data.extract,
      url: response.data.content_urls.desktop.page
    };
  } catch (error) {
    return null;
  }
}

// Search Wikipedia for related articles
async function searchWikipedia(topic) {
  try {
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/search/${encodeURIComponent(topic)}`);
    return response.data.pages.slice(0, 3).map(page => ({
      title: page.title,
      summary: page.description || page.excerpt,
      url: `https://en.wikipedia.org/wiki/${page.key}`
    }));
  } catch (error) {
    return [];
  }
}

app.post('/api/research', async (req, res) => {
  try {
    const topic = (req.body.topic || '').trim();
    if (!topic) {
      return res.status(400).json({ error: "No research topic provided" });
    }

    console.log(`Researching: ${topic}`);
    
    // Get main Wikipedia summary
    const mainSummary = await getWikipediaSummary(topic);
    
    // Get related articles
    const relatedArticles = await searchWikipedia(topic);
    
    let summary = '';
    let citations = [];
    
    if (mainSummary && mainSummary.summary) {
      summary = `**${mainSummary.title}**\n\n${mainSummary.summary}`;
      citations.push({
        title: mainSummary.title,
        url: mainSummary.url
      });
    }
    
    // Add related articles
    if (relatedArticles.length > 0) {
      summary += '\n\n**Related Information:**\n';
      relatedArticles.forEach(article => {
        if (article.summary) {
          summary += `\n• **${article.title}**: ${article.summary}\n`;
          citations.push({
            title: article.title,
            url: article.url
          });
        }
      });
    }
    
    if (!summary) {
      summary = `No detailed information found for "${topic}". This could be due to the topic being too specific, misspelled, or not available in Wikipedia. Try searching for a more general term or check the spelling.`;
      citations = [
        { title: `Search "${topic}" on Wikipedia`, url: `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(topic)}` },
        { title: `Google Search for "${topic}"`, url: `https://www.google.com/search?q=${encodeURIComponent(topic)}` }
      ];
    }
    
    res.json({
      summary: summary,
      citations: citations
    });
    
  } catch (error) {
    console.error("Error in /api/research:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to fetch research data. Please try again."
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: "running", message: "AI Research Agent API is online" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
