// engine/modules/phoneticHarmony.ts

import { analyzer } from '../modules/phoneme';
import { detectLanguage } from '../modules/phoneme/utils/languageDetector';

/**
 * Calculates phonetic harmony score for a name based on
 * syllable structure, stress pattern, and sonority.
 */
export function phoneticHarmony(name: string): number {
  const language = detectLanguage(name);
  const phonemes = analyzer.getPhonemes(name, { language });
  const stress = analyzer.getStressPattern(name, { language });

  const syllableCount = analyzer.countSyllables(name, { language });
  if (!syllableCount || phonemes.length === 0) return 0.5;

  // Score components
  const hasSonorants = phonemes.some(p => p.features?.sonorant);
  const vowelConsonantBalance = calculateVowelConsonantBalance(phonemes);
  const openEnding = /[aeiou]$/.test(name.toLowerCase()) ? 0.9 : 0.6;

  // Weights
  const weights = {
    sonorants: 0.3,
    vowelConsonant: 0.3,
    openEnding: 0.2,
    stressVariation: 0.2,
  };

  const stressVariety = stress.length > 1 && stress[0] !== stress[1] ? 0.9 : 0.6;

  const score =
    (hasSonorants ? 1 : 0.5) * weights.sonorants +
    vowelConsonantBalance * weights.vowelConsonant +
    openEnding * weights.openEnding +
    stressVariety * weights.stressVariation;

  return Math.max(0, Math.min(1, score));
}

function calculateVowelConsonantBalance(phonemes: any[]): number {
  const vowels = phonemes.filter(p => p.type === 'vowel').length;
  const consonants = phonemes.filter(p => p.type === 'consonant').length;
  if (vowels + consonants === 0) return 0.5;
  const ratio = vowels / (vowels + consonants);
  return 1 - Math.abs(0.5 - ratio); // ideal balance around 0.5
}