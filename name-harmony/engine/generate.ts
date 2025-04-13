// engine/generate.ts

import { US_ENGLISH_NAMES } from './data/names_us_english';
import { ITALIAN_NAMES } from './data/names_italian';
import { CHINESE_NAMES } from './data/names_chinese';
import { scoreName } from './scoreName';

type Culture = 'italian' | 'chinese' | 'us_english';

type CultureWeights = Record<Culture, number>;

type NameEntry = {
  name?: string;
  given_name?: string;
  gender?: string;
  culture?: string;
  type?: string;
  style?: string;
};

type GeneratedName = {
  name: string;
  score: number;
  breakdown: Record<string, string>;
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

export function generateGivenNames({
  cultureWeights,
  surname,
  count,
  gender,
  style
}: GenerateOptions): GeneratedName[] {
  console.log('Generating with:', { surname, cultureWeights, gender, style, count });

  const totalWeight = Object.values(cultureWeights).reduce((sum, val) => sum + val, 0);
  const namePool: { name: string; culture: Culture; gender: string }[] = [];

  for (const culture of Object.keys(cultureWeights) as Culture[]) {
    const source = NAME_SOURCES[culture] || [];
    const weightedCount = Math.floor((cultureWeights[culture] / totalWeight) * 100);

    const filtered = source.filter((entry) => {
      const matchesType = !entry.type || entry.type === 'given_name';
      const matchesGender = gender === 'neutral' || !entry.gender || entry.gender === gender;
      const matchesStyle = style === 'any' || !entry.style || entry.style === style;
      return matchesType && matchesGender && matchesStyle;
    });

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    namePool.push(
      ...shuffled.slice(0, weightedCount).map((entry) => ({
        name: entry.name ?? entry.given_name ?? "???",
        culture,
        gender: entry.gender ?? 'unknown',
      }))
    );
  }

  if (namePool.length === 0) {
    throw new Error('No names could be generated with the given filters');
  }

  const scored = namePool.map(({ name, culture, gender }) => {
    const { score, breakdown } = scoreName(name, surname, culture, gender);
    return {
      name: `${name} ${surname}`,
      score,
      breakdown,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
