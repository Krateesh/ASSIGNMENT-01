const express = require('express');
const axios = require('axios');

//parses HTML and help us to use jQuery-loke syntax($) to extract data
const cheerio = require('cheerio');

//aloows cross origin requests i.e.,frontend can call this API
const cors = require('cors'); 

const app = express();

// It helps to Allow requests from any origin
app.use(cors()); 

const PORT = process.env.PORT || 3000;

//base-url
const TIME_BASE = 'https://time.com';

// helper: make absolute url
function absUrl(href)
{
  if (!href || typeof href!=='string')
     return null;
     href=href.trim();

  if (href.startsWith('http')) 
    return href;

  if (href.startsWith('//')) 
      return 'https:' + href;

  if (href.startsWith('/')) 
    return TIME_BASE + href;

  return TIME_BASE + '/' + href;
}

app.get('/getTimeStories', async (req, res) => {
  try 
  {
    const response = await axios.get(TIME_BASE, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; scraper/1.0)' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const results = [];

    $('a[href^="/"]').each((i, element) => {
      const title = $(element).text().trim();
      const href = $(element).attr('href');
      if (title && href && !href.includes('/tag/') && title.length > 10) {
        results.push({
          title,
          link: absUrl(href)
        });
      }

      // stop after 6 latest stories
      if (results.length >= 6)
         return false; 
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Time stories' });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}/getTimeStories`)
);