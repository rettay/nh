// pronounceability.ts
import { getPhonemes, countSyllables, getSyllableStructure } from "@/engine/modules/phonaesthetics";
import { 
  PhonotacticProfile, 
  getPhonotacticProfiles, 
  evaluatePronounceabilityWithProfile 
} from "./phonotactics";

/**
 * Normalizes weights in a cultural blend to sum to 1.0
 * 
 * @param blend - Record mapping culture names to their weights
 * @returns Normalized blend where weights sum to 1.0
 */
function normalizeBlend(blend: Record<string, number>): Record<string, number> {
  // Filter out non-positive weights
  const filteredBlend: Record<string, number> = {};
  let totalWeight = 0;
  
  for (const culture in blend) {
    if (blend[culture] > 0) {
      filteredBlend[culture] = blend[culture];
      totalWeight += blend[culture];
    }
  }
  
  // If no valid weights, return default universal
  if (totalWeight <= 0) {
    return { universal: 1.0 };
  }
  
  // Normalize weights to sum to 1.0
  const normalizedBlend: Record<string, number> = {};
  for (const culture in filteredBlend) {
    normalizedBlend[culture] = filteredBlend[culture] / totalWeight;
  }
  
  return normalizedBlend;
}

/**
 * Evaluates how easy a name is to pronounce, with optional cultural weighting
 * 
 * @param name - The name to evaluate
 * @param culturalBlend - Record mapping culture names to their weight (any positive numbers)
 * @returns A score from 0 (very hard to pronounce) to 1 (very easy to pronounce)
 * 
 * @example
 * // Get pronounceability for a name in a universal context
 * const score = pronounceability("Mira");
 * 
 * @example
 * // Get pronounceability for a name in a blended cultural context
 * const score = pronounceability("Lin", { chinese: 0.7, english: 0.3 });
 */
export function pronounceability(
  name: string,
  culturalBlend: Record<string, number> = { universal: 1.0 }
): number {
  // Basic validation
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;

  // Normalize the cultural blend weights
  const normalizedBlend = normalizeBlend(culturalBlend);
  
  // Get the appropriate profiles based on cultural blend
  const profiles = getPhonotacticProfiles(Object.keys(normalizedBlend));
  let totalScore = 0;

  // Calculate weighted score across all profiles
  for (const culture in normalizedBlend) {
    const weight = normalizedBlend[culture];
    const profile = profiles[culture];
    if (!profile) continue;

    const score = evaluatePronounceabilityWithProfile(name, profile);
    totalScore += score * weight;
  }

  // Bound the final score
  return Math.max(0, Math.min(totalScore, 1));
}