// engine/index.ts

import { scorePhoneticFlow } from './modules/phoneticFlow';
import { scorePhonaesthetics } from './modules/phonaesthetics';
import { scoreCulturalCoherence } from './modules/culturalCoherence';
import { scoreDistinctiveness } from './modules/distinctiveness';
import { scoreEmotionalResonance } from './modules/emotionalResonance';

type Weights = {
    phoneticFlow: number;
    phonaesthetics: number;
    culturalCoherence: number;
    distinctiveness: number;
    emotionalResonance: number;
  };
  
  const defaultWeights: Weights = {
    phoneticFlow: 1.0,
    phonaesthetics: 1.0,
    culturalCoherence: 1.0,
    distinctiveness: 0.75,
    emotionalResonance: 0.75,
  };
  

export function scoreName(
  first: string,
  last: string,
  culture: string = 'english',
  gender: string = 'male',
  weights?: Partial<Weights>
): {
  score: number;
  breakdown: Record<string, string>;
} {
  const breakdown: Record<string, string> = {};
  let total = 50; // Start from a neutral base score

  // Module: Phonetic Flow
  const flow = scorePhoneticFlow(first, last);
  total += flow.score * (weights?.phoneticFlow ?? defaultWeights.phoneticFlow);
  breakdown['Phonetic Flow'] = flow.explanation;

  // Module: Phonaesthetics
  const sound = scorePhonaesthetics(first, last);
  total += sound.score * (weights?.phonaesthetics ?? defaultWeights.phonaesthetics);
  breakdown['Phonaesthetics'] = sound.explanation;

  // Module: Cultural Coherence
  const cultureMatch = scoreCulturalCoherence(first, last);
  total += cultureMatch.score * (weights?.culturalCoherence ?? defaultWeights.culturalCoherence);
  breakdown['Cultural Coherence'] = cultureMatch.explanation;

  // Module: Distinctiveness
  const distinct = scoreDistinctiveness(first, last);
  total += distinct.score * (weights?.distinctiveness ?? defaultWeights.distinctiveness);
  breakdown['Distinctiveness'] = distinct.explanation;


  // Module: EmotionalResonance
  const emotion = scoreEmotionalResonance(first, last);
  total += emotion.score * (weights?.emotionalResonance ?? defaultWeights.emotionalResonance);
  breakdown['Emotional Resonance'] = emotion.explanation;

  // Clamp the final score
  const score = Math.max(0, Math.min(100, total));

  return { score, breakdown };
}
