import { analyzer } from '../modules/phoneme';
import { detectLanguage } from '../modules/phoneme/utils/languageDetector';
import { US_ENGLISH_NAMES } from '../data/names_us_english';

// Type definitions for better type safety
export type CultureId = string;
export type CulturalBlend = Record<CultureId, number>;

interface DistinctivenessOptions {
  corpus?: string[];
  culturalBlend?: CulturalBlend;
  language?: string;
  thresholds?: {
    commonName?: number;
    commonNgram?: number;
    diversity?: number;
    commonStructure?: number;
    invented?: number;
  };
  weights?: {
    corpusRarity?: number;
    ngramNovelty?: number;
    phonemeDiversity?: number;
    structureVariation?: number;
    invented?: number;
  };
}

// Default thresholds
const DEFAULT_THRESHOLDS = {
  commonName: 0.4,
  commonNgram: 50,
  diversity: 0.6,
  commonStructure: 0.25,
  invented: 0.2
};

// Default weights for scoring components
const DEFAULT_WEIGHTS = {
  corpusRarity: 0.3,
  ngramNovelty: 0.25, 
  phonemeDiversity: 0.2,
  structureVariation: 0.15,
  invented: 0.1
};

// Registry of available corpora
const CORPORA: Record<CultureId, string[]> = {
  US_ENGLISH: US_ENGLISH_NAMES.map(n => n.given_name),
  // Add other corpora as needed
};

// Local helper to compute n-grams from a string
function getNGrams(str: string, n: number = 2): string[] {
  const padded = `_${str.toLowerCase()}_`;
  const grams = [];
  for (let i = 0; i < padded.length - n + 1; i++) {
    grams.push(padded.slice(i, i + n));
  }
  return grams;
}

export function distinctiveness(name: string, corpus: string[] = CORPORA.US_ENGLISH, options?: DistinctivenessOptions): number {
  const language = options?.language || detectLanguage(name);
  const phonemes = analyzer.getPhonemes(name, { language });
  const syllables = analyzer.getSyllableStructure(name, { language });
  const corpusSet = new Set(
    corpus.map(n => typeof n === 'string' ? n : (n as { given_name: string }).given_name).map(n => n.toLowerCase())
  );
  const weights = { ...DEFAULT_WEIGHTS, ...(options?.weights || {}) };

  const nameLower = name.toLowerCase();

  // 1. Corpus Rarity Score
  const corpusRarity = corpusSet.has(nameLower) ? 0.3 : 0.9;

  // 2. N-gram Novelty Score
  const nameGrams = getNGrams(nameLower, 2);
  let matching = 0;
  for (const gram of nameGrams) {
    for (const entry of corpusSet) {
      if (entry.includes(gram)) {
        matching++;
        break;
      }
    }
  }
  const ngramRatio = matching / nameGrams.length;
  const ngramNovelty = 1 - Math.min(1, ngramRatio);

  // 3. Phoneme Diversity
  const uniquePhonemeTypes = new Set(phonemes.map(p => p.symbol)).size;
  const diversity = Math.min(1, uniquePhonemeTypes / (phonemes.length || 1));

  // 4. Structure Variation Score (against typical 2-syllable, CVCV patterns)
  const structureVariation = syllables.length >= 3 ? 0.9 : syllables.length === 2 ? 0.6 : 0.4;

  // 5. Invented Score (not in corpus and ends in unusual suffix)
  const invented = !corpusSet.has(nameLower) && /[xzq]$/.test(nameLower) ? 0.9 : 0.4;

  const score =
    corpusRarity * weights.corpusRarity +
    ngramNovelty * weights.ngramNovelty +
    diversity * weights.phonemeDiversity +
    structureVariation * weights.structureVariation +
    invented * weights.invented;

  return Math.max(0, Math.min(1, score));
}