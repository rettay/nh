// phonaesthetics.ts

/**
 * Converts a name to an array of phonemes
 * 
 * @param name - The name to convert
 * @returns Array of phonemes
 */
export function getPhonemes(name: string): string[] {
  // This is a simplified implementation
  // A real implementation would use a proper phoneme dictionary or API
  return name.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/ph/g, 'f')
    .replace(/th/g, 'θ')
    .replace(/ch/g, 'tʃ')
    .replace(/sh/g, 'ʃ')
    .split('');
}

/**
 * Identifies the stress pattern in a name
 * 
 * @param name - The name to analyze
 * @returns Array of stress markers where '1' is primary stress, '2' is secondary, '0' is unstressed
 */
export function getStressPattern(name: string): string[] {
  const syllableCount = countSyllables(name);
  
  if (syllableCount <= 1) {
    return ['1'];
  }
  
  // Default English pattern for 2-syllable names is trochee (stress on first syllable)
  if (syllableCount === 2) {
    return ['1', '0'];
  }
  
  // For 3+ syllable names, approximate common patterns
  if (syllableCount === 3) {
    return ['1', '0', '0']; // Dactyl pattern (common in English)
  }
  
  // For longer names, apply a simplified pattern with primary stress
  // on the antepenultimate (third from last) syllable
  const pattern = Array(syllableCount).fill('0');
  pattern[syllableCount - 3] = '1';
  return pattern;
}

/**
 * Counts the number of syllables in a name
 * 
 * @param name - The name to analyze
 * @returns Number of syllables
 */
export function countSyllables(name: string): number {
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, '');
  
  // If empty, return 0
  if (!cleaned) return 0;
  
  // Count vowel sequences as syllable nuclei
  const vowelGroups = cleaned.match(/[aeiouy]+/g) || [];
  
  // Handle special cases where adjacent vowels might be diphthongs (one syllable)
  const diphthongs = (cleaned.match(/[aeiouy]{2}/g) || []).length;
  const triphthongs = (cleaned.match(/[aeiouy]{3}/g) || []).length;
  
  // Subtract estimated diphthongs/triphthongs
  const syllables = Math.max(1, vowelGroups.length - (diphthongs * 0.5) - (triphthongs * 0.7));
  
  return Math.round(syllables);
}

/**
 * Gets the syllable structure of a name
 * 
 * @param name - The name to analyze
 * @returns Array of syllables with their structure (C for consonant, V for vowel)
 */
export function getSyllableStructure(name: string): string[] {
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, '');
  
  // Split name into syllables (simplified approach)
  const syllables = splitIntoSyllables(cleaned);
  
  // Convert each syllable to CV pattern
  return syllables.map(syllable => 
    syllable.replace(/[aeiouy]/g, 'V').replace(/[^V]/g, 'C')
  );
}

/**
 * Helper function to split a name into syllables
 * 
 * @param name - The name to split
 * @returns Array of syllables
 */
function splitIntoSyllables(name: string): string[] {
  // Find vowel groups as syllable nuclei
  const matches = name.match(/[^aeiouy]*[aeiouy]+/g);
  
  if (!matches) {
    return [name]; // Fallback to whole name if no vowels
  }
  
  // Handle consonants between vowel groups
  const syllables: string[] = [];
  let currentIndex = 0;
  
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    
    if (next) {
      // Find start of next syllable
      const currentEnd = name.indexOf(current, currentIndex) + current.length;
      const nextStart = name.indexOf(next, currentEnd);
      
      // Get consonants between syllables
      const consonantCluster = name.substring(currentEnd, nextStart);
      
      if (consonantCluster) {
        // Determine where to split the consonant cluster
        const splitPoint = getSplitPoint(consonantCluster);
        
        // Add current syllable plus some consonants
        syllables.push(current + consonantCluster.substring(0, splitPoint));
        
        // Update starting point for next iteration
        currentIndex = currentEnd + splitPoint;
      } else {
        syllables.push(current);
        currentIndex = currentEnd;
      }
    } else {
      // Last syllable includes everything remaining
      syllables.push(name.substring(currentIndex));
    }
  }
  
  return syllables;
}

/**
 * Determines where to split a consonant cluster between syllables
 * 
 * @param cluster - The consonant cluster to analyze
 * @returns Index where the split should occur
 */
function getSplitPoint(cluster: string): number {
  // For single consonants, keep with next syllable (onset)
  if (cluster.length === 1) {
    return 0;
  }
  
  // For two consonants, common practice is to split: VC|CV
  if (cluster.length === 2) {
    return 1;
  }
  
  // For longer clusters, try to respect common onsets
  const commonOnsets = ['pl', 'pr', 'tr', 'dr', 'cl', 'cr', 'gl', 'gr', 'th', 'sh', 'ph', 'st', 'sp', 'sk'];
  
  for (let i = 1; i < cluster.length; i++) {
    const potential = cluster.substring(i);
    if (commonOnsets.some(onset => potential.startsWith(onset))) {
      return i;
    }
  }
  
  // Default: split at the middle
  return Math.floor(cluster.length / 2);
}