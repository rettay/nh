const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = 'https://www.behindthename.com/names/gender/masculine/usage/italian';

async function scrapeNames() {
  const response = await axios.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
    }
  });

  const $ = cheerio.load(response.data);
  const names = [];

  $('div.browsename > a').each((_, el) => {
    const name = $(el).text().trim();
    if (name && /^[A-Za-z]+$/.test(name)) {
      names.push({
        name,
        culture: 'italian',
        gender: 'male'
      });
    }
  });

  const outputPath = 'engine/data/names_italian.ts';
  fs.mkdirSync('engine/data', { recursive: true });
  fs.writeFileSync(outputPath, `export const ITALIAN_NAMES = ${JSON.stringify(names, null, 2)};\n`);
  console.log(`Saved ${names.length} names to ${outputPath}`);
}

scrapeNames();
