// engine/modules/phonaesthetics.ts
import { getCVPattern } from '../utils/phonemeUtils';

const softSounds = ['l', 'm', 'n', 'v', 'w', 'y'];
const harshClusters = ['gr', 'kr', 'cl', 'tr', 'zv', 'sn', 'dr'];

export function scorePhonaesthetics(first: string, last: string): {
  score: number;
  explanation: string;
} {
  const name = `${first} ${last}`.toLowerCase();
  const cv = getCVPattern(first + last);

  let score = 0;
  const notes: string[] = [];

  // Bonus for repeated consonants or vowels
  const repeats = /([bcdfghjklmnpqrstvwxyz])\1|([aeiou])\2/;
  if (repeats.test(name)) {
    score += 5;
    notes.push('Pleasant repetition of sounds');
  }

  // Bonus for soft phonemes
  const softHits = softSounds.filter((s) => name.includes(s)).length;
  if (softHits >= 3) {
    score += 5;
    notes.push('Includes soft consonants like L, M, N, or V');
  }

  // Penalty for harsh clusters
  const harshHits = harshClusters.filter((h) => name.includes(h)).length;
  if (harshHits > 0) {
    score -= 5 * harshHits;
    notes.push(`Harsh clusters found: ${harshHits}`);
  }

  // Sonority variation (basic heuristic)
  const alternation = cv.match(/(VC|CV)/g)?.length || 0;
  if (alternation > 5) {
    score += 5;
    notes.push('Strong alternation between consonants and vowels');
  }

  // Final scoring
  const explanation = notes.length
    ? notes.join('; ')
    : 'No distinct phonaesthetic traits detected';

  return {
    score: Math.max(-10, Math.min(10, score)),
    explanation,
  };
}
