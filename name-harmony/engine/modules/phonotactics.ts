// phonotactics.ts

/**
 * Interface defining the phonotactic profile for a language or culture
 */
export interface PhonotacticProfile {
  /** Name of the culture/language profile */
  name: string;
  /** Regular expressions defining preferred syllable structures */
  preferredSyllables: RegExp[];
  /** Regular expressions defining disallowed consonant clusters */
  disallowedClusters: RegExp[];
  /** Minimum ratio of vowels required in a name */
  minVowelRatio: number;
  /** Maximum allowed length of consonant clusters */
  maxClusterLength: number;
  /** Letters that commonly appear at the start of names in this culture */
  legalStartLetters?: string[];
  /** Letters that commonly appear at the end of names in this culture */
  legalEndLetters?: string[];
}

// Scoring weight constants
const SYLLABLE_WEIGHT = 0.3;
const VOWEL_WEIGHT = 0.25;
const CLUSTER_WEIGHT = 0.25;
const BOUNDARY_WEIGHT = 0.2;

// Penalty constants
const BAD_CLUSTER_PENALTY = 0.3;
const BOUNDARY_PENALTY = 0.5;

// Create the internal profiles store with memoization capabilities
let profilesLoaded = false;
let profilesLoadPromise: Promise<void> | null = null;
let dynamicProfiles: Record<string, PhonotacticProfile> = {};

/**
 * Pre-defined phonotactic profiles for different cultures/languages
 */
export const DEFAULT_PROFILES: Record<string, PhonotacticProfile> = {
  universal: {
    name: "universal",
    preferredSyllables: [/^C?V$/, /^C?VC$/, /^CV$/, /^VC$/],
    disallowedClusters: [/[^aeiouy]{4,}/],
    minVowelRatio: 0.3,
    maxClusterLength: 3,
    legalStartLetters: ["m", "l", "a", "s", "r", "t", "k", "n", "j"],
    legalEndLetters: ["a", "e", "n", "r", "l", "o", "y"]
  },
  english: {
    name: "english",
    preferredSyllables: [/^C?V$/, /^C?VC$/, /^CV$/, /^VC$/],
    disallowedClusters: [/[^aeiouy]{4,}/],
    minVowelRatio: 0.3,
    maxClusterLength: 3,
    legalStartLetters: ["m", "l", "a", "s", "j", "k", "b", "t", "r"],
    legalEndLetters: ["a", "e", "n", "r", "l", "y"]
  },
  chinese: {
    name: "chinese",
    preferredSyllables: [/^CV$/, /^CVN$/],
    disallowedClusters: [/[^aeiouy]{2,}/],
    minVowelRatio: 0.4,
    maxClusterLength: 2,
    legalStartLetters: ["x", "l", "m", "zh", "ch", "sh", "j", "q"],
    legalEndLetters: ["a", "i", "n", "g"]
  },
  italian: {
    name: "italian",
    preferredSyllables: [/^CV$/, /^CVCV$/, /^CVC$/],
    disallowedClusters: [/[^aeiouy]{4,}/],
    minVowelRatio: 0.4,
    maxClusterLength: 3,
    legalStartLetters: ["a", "m", "l", "s", "r", "g", "f", "p"],
    legalEndLetters: ["a", "o", "e", "i"]
  }
};

// Profile cache for performance optimization
const profilesCache = new Map<string, Record<string, PhonotacticProfile>>();
const MAX_CACHE_SIZE = 20;

/**
 * Get syllables from a name using a robust approach
 * 
 * @param name - The name to split into syllables
 * @returns Array of syllables
 */
function getSyllables(name: string): string[] {
  // First identify vowel nuclei
  const vowelIndices: number[] = [];
  for (let i = 0; i < name.length; i++) {
    if (/[aeiouy]/.test(name[i])) {
      vowelIndices.push(i);
    }
  }
  
  // If no vowels, treat the whole thing as one syllable
  if (vowelIndices.length === 0) {
    return [name];
  }
  
  // Divide consonants between vowel nuclei
  const syllables: string[] = [];
  let startIndex = 0;
  
  for (let i = 0; i < vowelIndices.length; i++) {
    const vowelIndex = vowelIndices[i];
    const nextVowelIndex = vowelIndices[i + 1];
    
    if (nextVowelIndex) {
      // Find the midpoint between consonants
      const consonantCluster = name.substring(vowelIndex + 1, nextVowelIndex);
      let splitPoint = Math.floor(consonantCluster.length / 2);
      
      // Adjust split point to prefer CV syllables when possible
      if (consonantCluster.length > 1) {
        splitPoint = 1;
      }
      
      const syllableEnd = vowelIndex + 1 + splitPoint;
      syllables.push(name.substring(startIndex, syllableEnd));
      startIndex = syllableEnd;
    } else {
      // Last syllable
      syllables.push(name.substring(startIndex));
    }
  }
  
  return syllables;
}

/**
 * Calculates a score based on potential mismatch between spelling and pronunciation
 * 
 * @param name - The name to analyze
 * @returns Score from 0 to 1 where 1 means easy letter-to-phoneme mapping
 */
function calculateLetterPhonemeScore(name: string): number {
  // Check for silent letters and complex graphemes
  const complexGraphemes = [
    'ph', 'ch', 'sh', 'th', 'wh', 'gh', 'kn', 'gn', 'ps', 'wr', 'mb', 'igh', 'eigh', 'ough'
  ];
  
  let complexCount = 0;
  for (const grapheme of complexGraphemes) {
    if (name.includes(grapheme)) {
      complexCount++;
    }
  }
  
  // Penalize based on complexity
  return 1 - Math.min(complexCount * 0.1, 0.4);
}

/**
 * Evaluates a name's pronounceability against a specific phonotactic profile
 * 
 * @param name - The name to evaluate
 * @param profile - The phonotactic profile to evaluate against
 * @returns A score from 0 (hard to pronounce) to 1 (easy to pronounce)
 */
export function evaluatePronounceabilityWithProfile(name: string, profile: PhonotacticProfile): number {
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;

  const vowels = cleaned.match(/[aeiouy]/g) || [];
  const vowelRatio = vowels.length / cleaned.length;

  // Consonant cluster penalties
  const badClusters = profile.disallowedClusters.reduce((count, regex) => {
    return count + ((cleaned.match(regex) || []).length);
  }, 0);
  const clusterScore = 1 - Math.min(badClusters * BAD_CLUSTER_PENALTY, 1);

  // Vowel presence
  const vowelScore = vowelRatio >= profile.minVowelRatio ? 1 : vowelRatio / profile.minVowelRatio;

  // Start/end letter legality
  const startOk = profile.legalStartLetters?.includes(cleaned[0]) ? 1 : BOUNDARY_PENALTY;
  const endOk = profile.legalEndLetters?.includes(cleaned.slice(-1)) ? 1 : BOUNDARY_PENALTY;
  const boundaryScore = (startOk + endOk) / 2;

  // Syllable pattern matching
  const syllables = getSyllables(cleaned);
  let matchScore = 0;
  syllables.forEach(syl => {
    const pattern = syl.replace(/[aeiouy]/g, "V").replace(/[^V]/g, "C");
    if (profile.preferredSyllables.some(r => r.test(pattern))) {
      matchScore += 1;
    }
  });
  const syllableScore = syllables.length ? matchScore / syllables.length : 0;

  // Letter-to-phoneme ratio analysis
  const letterPhonemeScore = calculateLetterPhonemeScore(cleaned);

  return (SYLLABLE_WEIGHT * syllableScore) + 
         (VOWEL_WEIGHT * vowelScore) + 
         (CLUSTER_WEIGHT * clusterScore) + 
         (BOUNDARY_WEIGHT * boundaryScore) * letterPhonemeScore;
}

/**
 * Returns the appropriate phonotactic profiles for the given culture keys
 * Combines default profiles with any dynamically loaded ones
 * 
 * @param cultureKeys - Array of culture identifiers
 * @returns Record of culture identifiers to their phonotactic profiles
 */
export function getPhonotacticProfiles(cultureKeys: string[]): Record<string, PhonotacticProfile> {
  // Generate cache key
  const cacheKey = [...cultureKeys].sort().join(',');
  
  // Check cache first
  if (profilesCache.has(cacheKey)) {
    return profilesCache.get(cacheKey)!;
  }
  
  const result: Record<string, PhonotacticProfile> = {};
  
  cultureKeys.forEach(key => {
    // Check dynamic profiles first, then fall back to defaults
    if (dynamicProfiles[key]) {
      result[key] = dynamicProfiles[key];
    } else if (DEFAULT_PROFILES[key]) {
      result[key] = DEFAULT_PROFILES[key];
    } else {
      // Fallback to universal profile if the specific culture is not found
      result[key] = DEFAULT_PROFILES.universal;
    }
  });
  
  // Ensure we have at least one profile
  if (Object.keys(result).length === 0) {
    result.universal = DEFAULT_PROFILES.universal;
  }
  
  // Cache the result
  if (profilesCache.size >= MAX_CACHE_SIZE) {
    // Clear first entry if cache is full (simple LRU)
    const firstKey = profilesCache.keys().next().value;
    profilesCache.delete(firstKey);
  }
  profilesCache.set(cacheKey, result);
  
  return result;
}

/**
 * Loads phonotactic profiles from external configuration
 * Merges with default profiles, with external taking precedence
 * 
 * @param configPath - Optional path to config file or endpoint, defaults to standard location
 * @returns Promise that resolves when profiles are loaded
 */
export async function loadProfiles(configPath?: string): Promise<void> {
  // Don't reload if already loading
  if (profilesLoadPromise) {
    return profilesLoadPromise;
  }
  
  // Set default config path if not provided
  const path = configPath || '/config/phonotactic-profiles.json';
  
  // Create and store the loading promise
  profilesLoadPromise = new Promise<void>(async (resolve) => {
    try {
      // Attempt to fetch profiles from config
      const response = await fetch(path);
      
      if (response.ok) {
        const loadedProfiles = await response.json();
        
        // Process loaded profiles - convert string regex to actual RegExp objects
        Object.entries(loadedProfiles).forEach(([key, profile]: [string, any]) => {
          if (profile.preferredSyllables && Array.isArray(profile.preferredSyllables)) {
            profile.preferredSyllables = profile.preferredSyllables.map(
              (pattern: string) => new RegExp(pattern)
            );
          }
          
          if (profile.disallowedClusters && Array.isArray(profile.disallowedClusters)) {
            profile.disallowedClusters = profile.disallowedClusters.map(
              (pattern: string) => new RegExp(pattern)
            );
          }
          
          // Add to dynamic profiles
          dynamicProfiles[key] = profile as PhonotacticProfile;
        });
        
        // Clear cache since we have new profiles
        profilesCache.clear();
      }
    } catch (error) {
      console.error('Error loading phonotactic profiles:', error);
      // Continue with default profiles on error
    }
    
    profilesLoaded = true;
    resolve();
  });
  
  return profilesLoadPromise;
}

// Legacy alias for backward compatibility
export const evaluateAgainstProfile = evaluatePronounceabilityWithProfile;