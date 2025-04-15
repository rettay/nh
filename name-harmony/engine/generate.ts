// engine/generate.ts

import { US_ENGLISH_NAMES } from './data/names_us_english';
import { ITALIAN_NAMES } from './data/names_italian';
import { CHINESE_NAMES } from './data/names_chinese';
import { scoreName } from './scoreName';

type Culture = 'italian' | 'chinese' | 'us_english';

type CultureWeights = Record<Culture, number>;

type NameEntry = {
  given_name?: string;
  name?: string;
  gender?: string;
  culture?: string;
  type?: string;
  style?: string;
  meaning?: string;
};

type GeneratedName = {
  name: string;
  score: number;
  breakdown: {
    base: string;
    cultureBoost: string;
    styleMatch: string;
    genderMatch: string;
  };
  culture?: string;
  style?: string;
  meaning?: string;
};

type GenerateOptions = {
  cultureWeights: CultureWeights;
  surname: string;
  count: number;
  gender: string; // "male", "female", "neutral"
  style: string;  // "traditional", "modern", "any"
};

const NAME_SOURCES: Record<Culture, NameEntry[]> = {
  italian: ITALIAN_NAMES,
  chinese: CHINESE_NAMES,
  us_english: US_ENGLISH_NAMES,
};

// Local shuffle helper
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
// First, fix the culture weighting in generateGivenNames
export function generateGivenNames({
  cultureWeights,
  surname,
  count,
  gender,
  style = "any",
}: GenerateOptions): GeneratedName[] {
  
  // Validate inputs first to catch potential issues
  if (!cultureWeights || Object.values(cultureWeights).every(w => w === 0)) {
    console.warn("Invalid culture weights provided, defaulting to even distribution");
    cultureWeights = { italian: 0.33, chinese: 0.33, us_english: 0.34 };
  }
  
  // Normalize weights to ensure they sum to 1
  const totalWeight = Object.values(cultureWeights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights: Record<Culture, number> = {} as Record<Culture, number>;
  
  for (const culture of Object.keys(cultureWeights) as Culture[]) {
    normalizedWeights[culture] = cultureWeights[culture] / totalWeight;
  }
  
  // Create a pool of filtered candidates based on dominant culture
  const dominantCulture = Object.entries(normalizedWeights)
    .sort((a, b) => b[1] - a[1])[0][0] as Culture;
  
  // Get all candidates but filter by dominant culture preference
  const allCandidates: NameEntry[] = Object.entries(NAME_SOURCES)
    .flatMap(([culture, list]) => {
      // Apply strong weighting based on culture settings
      const cultureWeight = normalizedWeights[culture as Culture] || 0;
      
      // Only include names from a culture if its weight is significant
      // (prevents Italian names when Italian weight is 0%)
      if (cultureWeight < 0.05) return [];
      
      return list.map((entry) => ({
        ...entry,
        culture,
      }));
    });

  // Apply gender filtering BEFORE scoring
  const genderFiltered = gender !== "neutral" 
    ? allCandidates.filter(entry => entry.gender === gender || entry.gender === "neutral")
    : allCandidates;
    
  // Apply style filtering BEFORE scoring
  const styleFiltered = style !== "any"
    ? genderFiltered.filter(entry => entry.style === style || entry.style === "any" || !entry.style)
    : genderFiltered;

  // Now score the valid candidates
  const scored = shuffle(styleFiltered)
    .map((entry) => {
      const rawName = entry.given_name || entry.name;
      if (!rawName) return null;

      // Base score
      let score = scoreName(rawName, surname, entry);

      // Style scoring - MUCH stronger boost/penalty
      if (style !== "any") {
        if (entry.style === style) {
          score *= 1.5; // 50% boost for style match
        } else if (entry.style && entry.style !== "any") {
          score *= 0.5; // 50% penalty for style mismatch
        }
      }

      // Gender scoring - MUCH stronger boost/penalty
      if (gender !== "neutral") {
        if (entry.gender === gender) {
          score *= 1.5; // 50% boost for gender match
        } else if (entry.gender && entry.gender !== "neutral") {
          score *= 0.5; // 50% penalty for gender mismatch
        }
      }

      // Culture boost - make this MUCH more significant
      const weight = normalizedWeights[entry.culture as Culture] ?? 0;
      // Exponential boost based on weight - weight of 1.0 gives 3x boost, weight of 0 gives 0.1x
      const cultureBoost = weight <= 0.05 ? 0.1 : Math.pow(3, weight);
      score *= cultureBoost;

      return {
        name: rawName,
        score,
        breakdown: {
          base: score.toFixed(2),
          cultureBoost: (cultureBoost - 1).toFixed(2),
          styleMatch: entry.style === style ? "yes" : "no",
          genderMatch: entry.gender === gender ? "yes" : "no",
        },
        culture: entry.culture,
        style: entry.style,
        meaning: entry.meaning,
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count);
}