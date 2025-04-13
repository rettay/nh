// engine/generate.ts

import { US_ENGLISH_NAMES } from './data/names_us_english';
import { ITALIAN_NAMES } from './data/names_italian';
import { CHINESE_NAMES } from './data/names_chinese';
import { scoreName } from './index';

type Culture = 'italian' | 'chinese' | 'us_english'; //will add more later

export type CultureWeights = {
  italian: number;
  chinese: number;
  us_english: number;
};

export type GeneratedName = {
  name: string;
  score: number;
  breakdown: Record<string, string>;
};

const NAME_SOURCES: Record<Culture, any[]> = {
  italian: ITALIAN_NAMES,
  chinese: CHINESE_NAMES,
  us_english: US_ENGLISH_NAMES,
};

export function generateGivenNames({
  cultureWeights,
  surname,
  gender = "unknown",
  count = 5
}: {
  cultureWeights: CultureWeights;
  surname: string;
  gender?: string;
  count?: number;
}): GeneratedName[] {
  const namePool: { name: string; culture: keyof CultureWeights; gender: string }[] = [];

  const totalWeight = Object.values(cultureWeights).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return [];

  const sampleFrom = (
    list: any[],
    weight: number,
    culture: keyof CultureWeights
  ) => {
    const count = Math.floor((weight / totalWeight) * 100);
    const filtered = list.filter((x) => x.given_name); 
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((entry) => ({
      name: entry.given_name,
      culture,
      gender: entry.gender || 'unknown',
    }));
  };


  namePool.push(...sampleFrom(ITALIAN_NAMES, cultureWeights.italian, "italian"));
  namePool.push(...sampleFrom(CHINESE_NAMES, cultureWeights.chinese, "chinese"));
  namePool.push(...sampleFrom(US_ENGLISH_NAMES, cultureWeights.us_english, "us_english"));

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
