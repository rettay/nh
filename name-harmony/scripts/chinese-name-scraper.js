/**
 * Simple Chinese Names Generator
 * 
 * A reliable script that generates Chinese names data from Wikipedia
 * with comprehensive error handling and backup data.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Output file path - adjust as needed for your Windows environment
const OUTPUT_PATH = path.resolve(__dirname, '..', 'engine', 'data', 'names_chinese.ts');

// Backup data in case web scraping fails
const BACKUP_FAMILY_NAMES = [
  { "name": "Wang", "gender": "n/a", "culture": "chinese" },
  { "name": "Li", "gender": "n/a", "culture": "chinese" },
  { "name": "Zhang", "gender": "n/a", "culture": "chinese" },
  { "name": "Liu", "gender": "n/a", "culture": "chinese" },
  { "name": "Chen", "gender": "n/a", "culture": "chinese" },
  { "name": "Yang", "gender": "n/a", "culture": "chinese" },
  { "name": "Zhao", "gender": "n/a", "culture": "chinese" },
  { "name": "Huang", "gender": "n/a", "culture": "chinese" },
  { "name": "Zhou", "gender": "n/a", "culture": "chinese" },
  { "name": "Wu", "gender": "n/a", "culture": "chinese" }
];

const BACKUP_GIVEN_NAMES = [
  { "name": "Wei", "gender": "male", "culture": "chinese" },
  { "name": "Jian", "gender": "male", "culture": "chinese" },
  { "name": "Ming", "gender": "male", "culture": "chinese" },
  { "name": "Hao", "gender": "male", "culture": "chinese" },
  { "name": "Jun", "gender": "male", "culture": "chinese" },
  { "name": "Ying", "gender": "female", "culture": "chinese" },
  { "name": "Mei", "gender": "female", "culture": "chinese" },
  { "name": "Lan", "gender": "female", "culture": "chinese" },
  { "name": "Yu", "gender": "female", "culture": "chinese" },
  { "name": "Jing", "gender": "female", "culture": "chinese" }
];

/**
 * Main function to generate Chinese names data
 */
async function generateChineseNames() {
  console.log('=== Chinese Names Generator ===');
  console.log('Output will be saved to:', OUTPUT_PATH);

  try {
    // Create arrays to store our collected names
    let familyNames = [];
    let givenNames = [];

    // 1. Try to get Chinese surnames from Wikipedia
    try {
      console.log('\nAttempting to fetch surnames from Wikipedia...');
      const surnames = await fetchChineseSurnames();
      
      if (surnames && surnames.length > 0) {
        console.log(`Successfully fetched ${surnames.length} surnames from Wikipedia`);
        familyNames = surnames;
      } else {
        console.log('No surnames found on Wikipedia, using backup data');
        familyNames = BACKUP_FAMILY_NAMES;
      }
    } catch (error) {
      console.error('Error fetching surnames:', error.message);
      console.log('Using backup surname data instead');
      familyNames = BACKUP_FAMILY_NAMES;
    }

    // 2. Use backup data for given names (could be expanded later)
    console.log('\nUsing embedded data for given names');
    givenNames = BACKUP_GIVEN_NAMES;

    // 3. Generate TypeScript file
    console.log('\nGenerating TypeScript file...');
    const tsContent = generateTypeScriptFile(familyNames, givenNames);

    // 4. Ensure the output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      console.log(`Directory ${outputDir} already exists or cannot be created:`, error.message);
    }

    // 5. Write the file
    await fs.writeFile(OUTPUT_PATH, tsContent);
    console.log(`Success! Chinese names data written to: ${OUTPUT_PATH}`);

    return {
      familyNamesCount: familyNames.length,
      givenNamesCount: givenNames.length
    };
  } catch (error) {
    console.error('Fatal error in generateChineseNames:', error);
    throw error;
  }
}

/**
 * Fetches Chinese surnames from Wikipedia
 */
async function fetchChineseSurnames() {
  try {
    console.log('  Making HTTP request to Wikipedia...');
    const response = await axios.get('https://en.wikipedia.org/wiki/List_of_common_Chinese_surnames', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (response.status !== 200) {
      console.log(`  Wikipedia returned status code ${response.status}`);
      return null;
    }

    console.log('  HTTP request successful, parsing data...');
    
    // Parse HTML with Cheerio
    const $ = cheerio.load(response.data);
    const surnames = [];
    
    // Find the main surname table
    console.log('  Searching for surname table...');
    const table = $('table.wikitable').first();
    
    if (!table.length) {
      console.log('  Could not find surname table on the page');
      return null;
    }
    
    console.log('  Found surname table, extracting rows...');
    
    // Extract surnames from the table
    table.find('tr').each((i, row) => {
      // Skip header row
      if (i === 0) return;
      
      const columns = $(row).find('td');
      
      if (columns.length >= 3) {
        try {
          const pinyin = $(columns[0]).text().trim();
          
          // Extract just the basic name without tones
          const cleanName = pinyin
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s/g, '')
            .trim();
          
          // Format with first letter capitalized
          if (cleanName) {
            const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
            surnames.push({
              name: formattedName,
              gender: "n/a",
              culture: "chinese"
            });
          }
        } catch (parseError) {
          console.log(`  Error parsing row ${i}:`, parseError.message);
        }
      }
    });
    
    console.log(`  Extracted ${surnames.length} surnames from Wikipedia`);
    return surnames;
  } catch (error) {
    console.error('  Error in fetchChineseSurnames:', error.message);
    throw error;
  }
}

/**
 * Generates TypeScript file content in the same format as names_us_english.ts
 */
function generateTypeScriptFile(familyNames, givenNames) {
  // Combine all names into a single array like your English names file
  const allNames = [
    ...familyNames,
    ...givenNames
  ];

  // Format the TypeScript export statement
  return `export const CHINESE_NAMES = ${JSON.stringify(allNames, null, 2)};
`;
}

/**
 * Entry point
 */
async function main() {
  try {
    await generateChineseNames();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { generateChineseNames };