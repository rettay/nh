/*
TO DO implement explain: true
*/
import { US_ENGLISH_NAMES } from "@/data/names_us_english";
import { getPhonemes, getNGrams, getSyllableStructure } from "@/engine/modules/phonaesthetics";

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
  // Add other corpora as they become available:
  // ITALIAN: ITALIAN_NAMES.map(n => n.given_name),
  // CHINESE: CHINESE_NAMES.map(n => n.given_name),
  // GERMAN: GERMAN_NAMES.map(n => n.given_name),
  // JAPANESE: JAPANESE_NAMES.map(n => n.given_name),
  // SPANISH: SPANISH_NAMES.map(n => n.given_name),
};

// Cache for expensive computations
const corpusCache = new Map<string, {
  nameFrequencies: Map<string, number>,
  ngramFrequencies: Map<string, number>,
  syllableCounts: Map<number, number>,
  totalCount: number
}>();

// Cache for blended corpora to avoid regenerating them
const blendedCorpusCache = new Map<string, string[]>();

/**
 * Scores how unusual, memorable, and structurally unique a name is.
 * @param name - The name to evaluate
 * @param options - Configuration options including corpus, cultural blend, and scoring adjustments
 * @returns A score from 0 (common, boring) to 1 (distinct, memorable)
 */
export function distinctiveness(name: string, options: DistinctivenessOptions = {}): number {
  const nameLower = name.toLowerCase();
  let score = 1.0;

  // Determine which corpus to use
  let corpus = options.corpus;
  if (!corpus) {
    if (options.culturalBlend) {
      corpus = getBlendedCorpus(options.culturalBlend);
    } else {
      corpus = CORPORA.US_ENGLISH; // Default
    }
  }
  
  // Get thresholds with defaults
  const thresholds = {
    ...DEFAULT_THRESHOLDS,
    ...options.thresholds
  };
  
  // Get weights with defaults
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...options.weights
  };

  // Get or compute corpus analysis
  const corpusAnalysis = getCorpusAnalysis(corpus, options.language);
  
  // Calculate individual component scores (0-1 range for each)
  const scores = {
    corpusRarity: scoreCorpusRarity(nameLower, corpusAnalysis, thresholds),
    ngramNovelty: scoreNgramNovelty(nameLower, corpusAnalysis, thresholds),
    phonemeDiversity: scorePhonemeDiversity(nameLower, thresholds),
    structureVariation: scoreStructureVariation(nameLower, corpusAnalysis, thresholds),
    invented: scoreInvented(nameLower, corpusAnalysis, scores, thresholds)
  };

  // Calculate final weighted score
  score = 
    (scores.corpusRarity * weights.corpusRarity) +
    (scores.ngramNovelty * weights.ngramNovelty) +
    (scores.phonemeDiversity * weights.phonemeDiversity) +
    (scores.structureVariation * weights.structureVariation) +
    (scores.invented * weights.invented);
  
  // Normalize to ensure 0-1 range (in case weights don't sum to 1)
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight !== 0) {
    score = score / totalWeight;
  }

  // Final clamp and return
  return Math.max(0, Math.min(1, score));
}

/**
 * Scores the corpus rarity aspect
 */
function scoreCorpusRarity(
  nameLower: string, 
  corpusAnalysis: ReturnType<typeof getCorpusAnalysis>,
  thresholds: Required<DistinctivenessOptions>['thresholds']
): number {
  const frequency = (corpusAnalysis.nameFrequencies.get(nameLower) || 0) / corpusAnalysis.totalCount;
  const isCommon = frequency > 0;
  
  if (isCommon) {
    // Scale penalty based on frequency, capped at threshold
    return 1 - Math.min(thresholds.commonName!, frequency * 10);
  }
  
  return 1.0; // Not found in corpus = maximum distinctiveness
}

/**
 * Scores the n-gram novelty aspect
 */
function scoreNgramNovelty(
  nameLower: string, 
  corpusAnalysis: ReturnType<typeof getCorpusAnalysis>,
  thresholds: Required<DistinctivenessOptions>['thresholds']
): number {
  const bigrams = getNGrams(nameLower, 2);
  const trigrams = getNGrams(nameLower, 3);
  const allNGrams = [...bigrams, ...trigrams];
  
  if (allNGrams.length === 0) return 1.0;
  
  // Count n-grams that exceed threshold frequency
  let commonNgramCount = 0;
  allNGrams.forEach(n => {
    if ((corpusAnalysis.ngramFrequencies.get(n) || 0) > thresholds.commonNgram!) {
      commonNgramCount++;
    }
  });

  // Calculate score based on ratio of common n-grams
  return 1 - Math.min(1, (commonNgramCount / allNGrams.length) * 2);
}

/**
 * Scores phoneme diversity
 */
function scorePhonemeDiversity(
  nameLower: string,
  thresholds: Required<DistinctivenessOptions>['thresholds']
): number {
  const phonemes = getPhonemes(nameLower);
  
  if (phonemes.length === 0) return 0.5; // Fallback for empty phonemes
  
  const diversityRatio = new Set(phonemes).size / phonemes.length;
  
  // Base score: around 0.5 for average diversity
  let score = 0.5;
  
  // Bonus for high diversity
  if (diversityRatio > thresholds.diversity!) {
    score += Math.min(0.5, (diversityRatio - thresholds.diversity!) * 2);
  }
  // Slight penalty for very low diversity (repetitive sounds)
  else if (diversityRatio < thresholds.diversity! / 2) {
    score -= Math.min(0.2, (thresholds.diversity! / 2 - diversityRatio) * 2);
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Scores structure variation (syllable patterns)
 */
function scoreStructureVariation(
  nameLower: string, 
  corpusAnalysis: ReturnType<typeof getCorpusAnalysis>,
  thresholds: Required<DistinctivenessOptions>['thresholds']
): number {
  const nameSyllables = getSyllableStructure(nameLower).length;
  const commonStructureRatio = (corpusAnalysis.syllableCounts.get(nameSyllables) || 0) / corpusAnalysis.totalCount;

  // Base score: 0.7 as a reasonable starting point
  let score = 0.7;
  
  // Apply penalty for common structures
  if (commonStructureRatio > thresholds.commonStructure!) {
    score -= Math.min(0.5, (commonStructureRatio - thresholds.commonStructure!) * 2);
  }
  
  // Bonus for very uncommon structures
  if (commonStructureRatio < thresholds.commonStructure! / 3) {
    score += Math.min(0.3, 0.3 - commonStructureRatio);
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Scores the "invented" aspect (truly novel names)
 */
function scoreInvented(
  nameLower: string,
  corpusAnalysis: ReturnType<typeof getCorpusAnalysis>,
  otherScores: Record<string, number>,
  thresholds: Required<DistinctivenessOptions>['thresholds']
): number {
  const isNotInCorpus = !corpusAnalysis.nameFrequencies.has(nameLower);
  const hasHighDiversity = otherScores.phonemeDiversity > 0.7;
  const hasUncommonNgrams = otherScores.ngramNovelty > 0.8;
  
  // Fully invented bonus
  if (isNotInCorpus && hasHighDiversity && hasUncommonNgrams) {
    return 1.0;
  }
  
  // Partially invented bonus
  if (isNotInCorpus && (hasHighDiversity || hasUncommonNgrams)) {
    return 0.7;
  }
  
  // Not particularly invented
  return 0.0;
}

/**
 * Gets or computes analysis of the corpus for efficient lookups
 * @param corpus - Array of names to analyze
 * @param language - Optional language hint for specialized processing
 * @returns Preprocessed corpus data
 */
function getCorpusAnalysis(corpus: string[], language?: string) {
  // Create a hash of the corpus to use as cache key
  const corpusHash = hashCorpus(corpus);
  
  // Check if we've already analyzed this corpus
  if (corpusCache.has(corpusHash)) {
    return corpusCache.get(corpusHash)!;
  }

  // Initialize data structures
  const nameFrequencies = new Map<string, number>();
  const ngramFrequencies = new Map<string, number>();
  const syllableCounts = new Map<number, number>();
  
  // Process each name in the corpus
  corpus.forEach(name => {
    const nameLower = name.toLowerCase();
    
    // Count name frequency
    nameFrequencies.set(nameLower, (nameFrequencies.get(nameLower) || 0) + 1);
    
    // Process n-grams
    const ngrams = [...getNGrams(nameLower, 2), ...getNGrams(nameLower, 3)];
    ngrams.forEach(ng => {
      ngramFrequencies.set(ng, (ngramFrequencies.get(ng) || 0) + 1);
    });
    
    // Count syllable structures
    let syllableCount: number;
    
    // Language-specific adaptations could go here
    if (language === 'CHINESE') {
      // Chinese names often have one syllable per character
      syllableCount = nameLower.length; // Simplified approach - would need proper handling
    } else {
      syllableCount = getSyllableStructure(nameLower).length;
    }
    
    syllableCounts.set(syllableCount, (syllableCounts.get(syllableCount) || 0) + 1);
  });

  // Store computed analysis in cache
  const analysis = {
    nameFrequencies,
    ngramFrequencies,
    syllableCounts,
    totalCount: corpus.length
  };
  
  corpusCache.set(corpusHash, analysis);
  return analysis;
}

/**
 * Creates or retrieves a blended corpus based on cultural proportions
 * @param blend - Record of culture IDs and their proportions (should sum to 1)
 * @returns Array of names representing the blended corpus
 */
function getBlendedCorpus(blend: CulturalBlend): string[] {
  // Create a hash of the blend to use as cache key
  const blendHash = Object.entries(blend).sort().map(([k, v]) => `${k}:${v}`).join("|");

  
  // Check if we've already created this blend
  if (blendedCorpusCache.has(blendHash)) {
    return blendedCorpusCache.get(blendHash)!;
  }
  
  const blendedCorpus: string[] = [];
  const targetSize = 1000; // Reasonable size for statistical validity
  
  // Normalize weights in case they don't sum to 1
  const totalWeight = Object.values(blend).reduce((sum, w) => sum + w, 0);
  const normalizedBlend = Object.fromEntries(
    Object.entries(blend).map(([culture, weight]) => [culture, weight / totalWeight])
  );
  
  // For each cultural corpus
  Object.entries(normalizedBlend).forEach(([culture, ratio]) => {
    const cultureCorpus = CORPORA[culture as CultureId];
    if (!cultureCorpus || cultureCorpus.length === 0) return;
    
    // Calculate how many names to include based on ratio
    const namesToInclude = Math.round(ratio * targetSize);
    
    // Randomly select names according to ratio
    for (let i = 0; i < namesToInclude; i++) {
      const randomIndex = Math.floor(Math.random() * cultureCorpus.length);
      blendedCorpus.push(cultureCorpus[randomIndex]);
    }
  });
  
  // If we got an empty corpus (could happen if all cultures are unknown), use default
  if (blendedCorpus.length === 0) {
    return CORPORA.US_ENGLISH;
  }
  
  // Store the blend in cache
  blendedCorpusCache.set(blendHash, blendedCorpus);
  return blendedCorpus;
}

/**
 * Creates a hash for a corpus to use as a cache key
 * @param corpus - Array of names
 * @returns A string hash
 */
function hashCorpus(corpus: string[]): string {
  // For simplicity, we'll use a sampling approach for very large corpora
  if (corpus.length > 1000) {
    let hash = corpus.length.toString();
    // Sample every Nth element
    const sampleRate = Math.max(1, Math.floor(corpus.length / 100));
    for (let i = 0; i < corpus.length; i += sampleRate) {
      hash += '|' + corpus[i];
    }
    return hash;
  }
  
  // For smaller corpora, we can be more precise
  return corpus.join('|');
}

/**
 * Registers a new corpus for use in distinctiveness calculations
 * @param id - Unique identifier for the corpus
 * @param corpus - Array of names
 */
export function registerCorpus(id: CultureId, corpus: string[]): void {
  CORPORA[id] = corpus;
  
  // Clear any cached blends that might use this corpus
  // (A more sophisticated approach would only clear affected blends)
  blendedCorpusCache.clear();
}

/**
 * Gets a registered corpus by ID
 * @param id - Corpus identifier
 * @returns The corpus or undefined if not found
 */
export function getCorpus(id: CultureId): string[] | undefined {
  return CORPORA[id];
}

/**
 * Gets all available corpus IDs
 */
export function getAvailableCorpora(): CultureId[] {
  return Object.keys(CORPORA);
}

/**
 * Clears all cached data (useful for testing or when corpora change)
 */
export function clearCache(): void {
  corpusCache.clear();
  blendedCorpusCache.clear();
}