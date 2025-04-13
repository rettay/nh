// engine/modules/phoneticFlow.ts
import { getCVPattern } from '../utils/phonemeUtils';

export function scorePhoneticFlow(first: string, last: string): {
  score: number;
  explanation: string;
} {
  const firstCV = getCVPattern(first);
  const lastCV = getCVPattern(last);

  const transition = firstCV.slice(-1) + '-' + lastCV.slice(0, 1);

  if (transition === 'V-C') {
    return {
      score: 10,
      explanation: 'Vowel-to-consonant transition provides smooth phonetic flow.',
    };
  }

  if (transition === 'C-C') {
    return {
      score: -5,
      explanation: 'Consonant-to-consonant transition may sound harsh or abrupt.',
    };
  }

  return {
    score: 0,
    explanation: 'Neutral transition (e.g., consonant-to-vowel).',
  };
}
