import { CULTURE_PROFILES } from "./culturalProfiles";

/**
 * Evaluates how well a name aligns with one or more cultural naming systems.
 * @param name - The given name to evaluate
 * @param cultureWeights - Record of culture names and their weights (e.g. { chinese: 0.6, italian: 0.4 })
 * @param metadata - Optional hints like gender or structure
 * @returns A coherence score between 0 and 1, where 1 is perfect coherence
 */
export function culturalCoherence(
  name: string,
  cultureWeights: Record<string, number>,
  metadata?: Record<string, any>
): number {
  if (!name || !Object.keys(cultureWeights).length) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  const lowerName = name.toLowerCase();

  for (const [culture, weight] of Object.entries(cultureWeights)) {
    const profile = CULTURE_PROFILES[culture];
    if (!profile) continue;

    let score = 1;

    const syllables = detectSyllables(lowerName, profile.syllableDetectionMethod || "default");

    // 1. Allowed Endings
    if (profile.allowedEndings && !hasAllowedEnding(lowerName, profile.allowedEndings)) {
      score -= profile.penalties?.endings ?? 0.2;
    }

    // 2. Forbidden Phonemes
    if (profile.forbiddenPhonemes && hasForbiddenPhonemes(lowerName, profile.forbiddenPhonemes)) {
      score -= profile.penalties?.phonemes ?? 0.3;
    }

    // 3. Syllable Count Range
    if (profile.syllableCountRange) {
      const [min, max] = profile.syllableCountRange;
      if (syllables.length < min || syllables.length > max) {
        score -= profile.penalties?.syllableCount ?? 0.2;
      }
    }

    // 4. Gender Markers
    if (metadata?.gender && profile.genderMarkers?.[metadata.gender]) {
      if (!hasGenderMarker(lowerName, profile.genderMarkers[metadata.gender])) {
        score -= profile.penalties?.genderMarkers ?? 0.2;
      }
    }

    // 5. Tone/Vowel Balance Rules (for tonal languages)
    if (profile.toneRules && !checkToneRules(lowerName, profile.toneRules)) {
      score -= profile.penalties?.tones ?? 0.25;
    }

    // Clamp score to [0, 1]
    score = Math.max(0, Math.min(1, score));

    totalScore += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

// ========== Helper Functions ==========

function detectSyllables(name: string, method: string): string[] {
  switch (method) {
    case "chinese":
      return name.split(""); // Each character = syllable
    case "japanese":
      return detectJapaneseSyllables(name);
    default:
      return name.split(/[^aeiouy]+/).filter(s => s.length > 0); // Fallback for Romance/Germanic
  }
}

function hasAllowedEnding(name: string, endings: string[]): boolean {
  return endings.some(ending => name.endsWith(ending));
}

function hasForbiddenPhonemes(name: string, phonemes: string[]): boolean {
  return phonemes.some(p => name.includes(p));
}

function hasGenderMarker(name: string, markers: string[]): boolean {
  return markers.some(marker => name.endsWith(marker.replace("-", "")));
}

function checkToneRules(name: string, toneRules: any): boolean {
  // Placeholder for tonal structure evaluation — e.g. tone sequence legality
  // Implement logic once tone rules are structured (e.g. tone marks or encoded tone pattern)
  return true;
}

// Japanese syllable segmentation (simplified)
function detectJapaneseSyllables(name: string): string[] {
  const commonSyllables = ["ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so"]; // Extend as needed
  const syllables: string[] = [];

  let i = 0;
  while (i < name.length) {
    if (i < name.length - 1) {
      const chunk = name.substring(i, i + 2);
      if (commonSyllables.includes(chunk)) {
        syllables.push(chunk);
        i += 2;
        continue;
      }
    }
    syllables.push(name[i]);
    i++;
  }

  return syllables;
}
