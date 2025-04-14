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
  breakdown: Record<string, string>;
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

export function generateGivenNames({
  cultureWeights,
  surname,
  count,
  gender,
  style = "any",
}: GenerateOptions): GeneratedName[] {
  const candidates: NameEntry[] = Object.entries(NAME_SOURCES)
    .flatMap(([culture, list]) =>
      list.map((entry) => ({
        ...entry,
        culture,
      }))
    );

  const scored = shuffle(candidates)
    .map((entry) => {
      const rawName = entry.given_name || entry.name;
      if (!rawName) return null;

      let score = scoreName(rawName, surname, entry);

      // Style soft boost
      if (style !== "any") {
        if (entry.style === style) score *= 1.15;
        else score *= 0.9;
      }

      // Gender soft boost
      if (gender !== "neutral") {
        if (entry.gender === gender) score *= 1.15;
        else score *= 0.9;
      }

      // Culture boost
      const weight = cultureWeights[entry.culture as Culture] ?? 0;
      const cultureBoost = 1 + weight * 0.5;
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
    .filter((n): n is GeneratedName => n !== null)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count);
}