// /engine/phoneticHarmony.ts
import {
  analyzePhonemes,
  syllableStructure,
  estimateStressPattern,
  sonorityProfile,
} from './phonaesthetics';

/**
 * Calculates phonetic harmony score for a name
 * @param name - The name to analyze
 * @param metadata - Optional configuration (e.g., language)
 * @returns Score between 0-1 with higher values indicating better phonetic harmony
 */
export function phoneticHarmony(name: string, metadata?: Record<string, any>): number {
  const lowerName = name.toLowerCase().trim();

  if (!lowerName) return 0;

  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(lowerName)) {
    console.warn('Name contains non-alphabetic characters');
    return 0.1; // return minimal score for invalid names
  }

  try {
    const structureScore = scoreSyllableStructure(lowerName);
    const sonorityScore = scoreSonorityProfile(lowerName);
    const vowelConsonantScore = scoreVowelConsonantBalance(lowerName);
    const stressScore = scoreStressPattern(lowerName, metadata?.language || 'english');
    const euphonyScore = scoreEuphonicPhonemes(lowerName);

    const WEIGHTS = {
      structure: 0.3,
      sonority: 0.2,
      vowelConsonant: 0.15,
      stress: 0.15,
      euphony: 0.2,
    };

    const score =
      WEIGHTS.structure * structureScore +
      WEIGHTS.sonority * sonorityScore +
      WEIGHTS.vowelConsonant * vowelConsonantScore +
      WEIGHTS.stress * stressScore +
      WEIGHTS.euphony * euphonyScore;

    return Math.round(score * 1000) / 1000; // round to 3 decimals
  } catch (error) {
    console.error(`Error computing phonetic harmony for '${name}':`, error);
    return 0;
  }
}

// --- Subcomponent scoring functions ---
function scoreSyllableStructure(name: string): number {
  const structure = syllableStructure(name); // e.g., ['CV', 'CVC']
  const idealPatterns = ['CV', 'CVC', 'CVCV']; // optionally from metadata later
  const matchCount = structure.filter((s) => idealPatterns.includes(s)).length;
  return structure.length > 0 ? matchCount / structure.length : 0;
}

function scoreSonorityProfile(name: string): number {
  return sonorityProfile(name); // returns score from 0–1
}

function scoreVowelConsonantBalance(name: string): number {
  const { vowels, consonants } = analyzePhonemes(name);
  const total = vowels + consonants;
  if (total === 0) return 0;
  const ratio = vowels / total;
  return 1 - Math.abs(0.5 - ratio) * 2; // best at 0.5
}

function scoreStressPattern(name: string, language: string): number {
  const pattern = estimateStressPattern(name, language);
  if (language === 'english') return pattern === 'trochaic' ? 1 : 0.5;
  if (language === 'italian') return pattern === 'penultimate' ? 1 : 0.5;
  return 0.5; // fallback
}

function scoreEuphonicPhonemes(name: string): number {
  const euphonics = ['l', 'm', 'n', 'r', 'a', 'e', 'i', 'o', 'u'];
  const phonemes = name.toLowerCase().split('');
  const match = phonemes.filter((p) => euphonics.includes(p)).length;
  return phonemes.length > 0 ? match / phonemes.length : 0;
}
