import { getPhonemes, getStressPattern, countSyllables } from './phonaesthetics';

/**
 * Evaluates how smoothly a first name transitions into a surname
 * @param first First name
 * @param last Last name
 * @param metadata Optional additional data
 * @returns Score between 0 and 1, with higher scores indicating better flow
 */
export function phoneticFlowWithSurname(
  first: string, 
  last: string, 
  metadata?: Record<string, any>
): number {
  // Normalize inputs
  first = first.trim();
  last = last.trim();
  
  if (!first || !last) {
    return 0; // Can't evaluate empty names
  }

  // Calculate individual component scores
  const transitionScore = calculateTransitionScore(first, last);
  const syllableContrastScore = calculateSyllableContrastScore(first, last);
  const stressComplementarityScore = calculateStressComplementarityScore(first, last);
  const rhymeAvoidanceScore = calculateRhymeAvoidanceScore(first, last);
  const alliterationScore = calculateAlliterationScore(first, last);

  // Weight the components - adjust weights based on importance
  const weights = {
    transition: 0.30,
    syllableContrast: 0.20,
    stressComplementarity: 0.20,
    rhymeAvoidance: 0.15,
    alliteration: 0.15
  };

  // Calculate final weighted score
  const finalScore = (
    transitionScore * weights.transition +
    syllableContrastScore * weights.syllableContrast +
    stressComplementarityScore * weights.stressComplementarity +
    rhymeAvoidanceScore * weights.rhymeAvoidance +
    alliterationScore * weights.alliteration
  );

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, finalScore));
}

function calculateTransitionScore(first: string, last: string): number {
  const firstPhonemes = getPhonemes(first);
  const lastPhonemes = getPhonemes(last);

  if (firstPhonemes.length === 0 || lastPhonemes.length === 0) return 0;

  const lastPhonemeOfFirst = firstPhonemes[firstPhonemes.length - 1];
  const firstPhonemeOfLast = lastPhonemes[0];

  const isVowel = (p: string) => /[aeiouy]/.test(p);

  if (isVowel(lastPhonemeOfFirst) !== isVowel(firstPhonemeOfLast)) return 0.9;

  if (!isVowel(lastPhonemeOfFirst) && !isVowel(firstPhonemeOfLast)) {
    const isStop = (p: string) => /[pbtdkg]/.test(p);
    if (isStop(lastPhonemeOfFirst) && isStop(firstPhonemeOfLast)) return 0.3;
    if (lastPhonemeOfFirst === firstPhonemeOfLast) return 0.4;

    const similarGroups = [['p','b'],['t','d'],['k','g'],['f','v'],['s','z'],['m','n'],['r','l']];
    for (const group of similarGroups) {
      if (group.includes(lastPhonemeOfFirst) && group.includes(firstPhonemeOfLast)) return 0.5;
    }

    return 0.7;
  }

  if (isVowel(lastPhonemeOfFirst) && isVowel(firstPhonemeOfLast)) {
    if (lastPhonemeOfFirst === firstPhonemeOfLast) return 0.4;
    const pleasingPairs = [['a','i'],['a','u'],['e','i'],['o','i'],['o','u']];
    for (const [a, b] of pleasingPairs) {
      if ((a === lastPhonemeOfFirst && b === firstPhonemeOfLast) ||
          (b === lastPhonemeOfFirst && a === firstPhonemeOfLast)) return 0.7;
    }
    return 0.5;
  }

  return 0.6;
}

function calculateSyllableContrastScore(first: string, last: string): number {
  const firstSyllables = countSyllables(first);
  const lastSyllables = countSyllables(last);
  if (firstSyllables === lastSyllables) return firstSyllables >= 3 ? 0.6 : 0.5;
  return 0.9;
}

function calculateStressComplementarityScore(first: string, last: string): number {
  const firstStress = getStressPattern(first);
  const lastStress = getStressPattern(last);
  if (firstStress.length === 0 || lastStress.length === 0) return 0.5;
  return firstStress[0] !== lastStress[0] ? 0.9 : 0.6;
}

function calculateRhymeAvoidanceScore(first: string, last: string): number {
  const firstEnd = first.slice(-2).toLowerCase();
  const lastEnd = last.slice(-2).toLowerCase();
  if (firstEnd === lastEnd) return 0.3;
  if (firstEnd[1] === lastEnd[1]) return 0.5;
  return 0.9;
}

function calculateAlliterationScore(first: string, last: string): number {
  const f = first[0]?.toLowerCase();
  const l = last[0]?.toLowerCase();
  if (!f || !l) return 0.5;
  if (f === l) return /[bdfgjkmnpv]/.test(f) ? 0.8 : 0.6;
  return 0.9;
}