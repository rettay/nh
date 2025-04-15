/**
 * Evaluates the emotional resonance of a name based on phonetic characteristics.
 * Considers: sonority balance, vowel brightness, sound symbolism, harsh clusters, and overall flow.
 * Returns a score from 0 (harsh, unpleasant) to 1 (euphonic, pleasing).
 */
export function emotionalResonance(name: string): number {
  // Handle edge cases
  if (!name || name.length <= 1) return 0;
  
  const normalizedName = name.toLowerCase();
  
  // Phoneme classification
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  const sonorants = ['m', 'n', 'l', 'r', 'w', 'y'];
  const sibilants = ['s', 'z', 'sh', 'zh'];
  const plosives = ['p', 't', 'k', 'b', 'd', 'g'];
  const hardConsonants = [...plosives, 'x', 'q', 'j'];
  
  // Vowel brightness classification
  const brightVowels = ['i', 'e', 'y'];
  const darkVowels = ['o', 'u', 'a'];
  
  // Harsh consonant clusters (examples)
  const harshClusters = ['zk', 'kt', 'tz', 'kz', 'bk', 'gd', 'tk', 'bt', 'krz', 'brk', 'zkn', 'tzt'];
  
  // Count character types
  let vowelCount = 0;
  let sonorantCount = 0;
  let hardConsonantCount = 0;
  let brightVowelCount = 0;
  let darkVowelCount = 0;
  let harshClusterCount = 0;

  // Character alternation (consonant-vowel pattern) analysis
  let alternationScore = 0;
  let lastWasVowel = vowels.includes(normalizedName[0]);
  let alternationCount = 0;
  
  // Analyze phonemes
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName[i];
    
    // Count phoneme types
    if (vowels.includes(char)) {
      vowelCount++;
      if (brightVowels.includes(char)) brightVowelCount++;
      if (darkVowels.includes(char)) darkVowelCount++;
      
      // Check alternation pattern
      if (!lastWasVowel) {
        alternationCount++;
      }
      lastWasVowel = true;
    } else {
      if (sonorants.includes(char)) sonorantCount++;
      if (hardConsonants.includes(char)) hardConsonantCount++;
      
      // Check alternation pattern
      if (lastWasVowel) {
        alternationCount++;
      }
      lastWasVowel = false;
    }
    
    // Check for harsh clusters
    if (i > 0) {
      const currentPair = normalizedName.slice(i-1, i+1);
      if (harshClusters.includes(currentPair)) {
        harshClusterCount++;
      }
      
      // Check for 3-character clusters
      if (i > 1) {
        const currentTriple = normalizedName.slice(i-2, i+1);
        for (const harshCluster of harshClusters) {
          if (currentTriple.includes(harshCluster)) {
            harshClusterCount++;
          }
        }
      }
    }
  }
  
  // Calculate scores for each component
  
  // 1. Sonority balance (0-1)
  // Higher ratio of sonorants to hard consonants is better
  const sonorantRatio = sonorantCount / (hardConsonantCount + 1); // Add 1 to avoid division by zero
  const sonorityScore = Math.min(sonorantRatio, 1); // Cap at 1
  
  // 2. Vowel-consonant balance (0-1)
  // Ideal is around 40-60% vowels
  const vowelRatio = vowelCount / normalizedName.length;
  const balanceScore = 1 - Math.abs(0.45 - vowelRatio) * 2; // 0.45 is close to ideal
  
  // 3. Vowel brightness balance (0-1)
  // Balance of bright and dark vowels is usually pleasing
  const brightRatio = brightVowelCount / (vowelCount || 1);
  const vowelBrightnessScore = 1 - Math.abs(0.5 - brightRatio) * 1.5; // 0.5 means balanced
  
  // 4. Alternation score (consonant-vowel pattern) (0-1)
  // Higher alternation means more pleasing rhythm
  alternationScore = Math.min(alternationCount / (normalizedName.length - 1), 1);
  
  // 5. Harsh cluster penalty (0-1)
  // More harsh clusters reduce score
  const harshClusterPenalty = Math.min(harshClusterCount * 0.25, 1);
  
  // Adjust scores based on name length
  // Very short names typically don't have much rhythm or flow
  const lengthFactor = Math.min(normalizedName.length / 4, 1);
  
  // Calculate final score with appropriate weights
  const finalScore = (
    (sonorityScore * 0.25) +
    (balanceScore * 0.15) +
    (vowelBrightnessScore * 0.15) +
    (alternationScore * 0.25) - 
    (harshClusterPenalty * 0.3)
  ) * lengthFactor;
  
  // Special case adjustments
  
  // Bonus for names with high sonorant ratio and good alternation
  // (These tend to sound very pleasing like "Luna", "Mila", "Owen")
  const melodicBonus = (sonorityScore > 0.7 && alternationScore > 0.7) ? 0.1 : 0;
  
  // Extreme penalty for unpronounceable combinations
  // (Like "Brktz" from the test case)
  let extremePenalty = 0;
  if (harshClusterCount > 2 || 
      (harshClusterCount > 0 && vowelCount === 0) || 
      normalizedName.match(/[^aeiouy]{4,}/)) { // 4+ consonants in a row
    extremePenalty = 0.3;
  }
  
  // Finalize score with adjustments and ensure it's within 0-1 range
  return Math.max(0, Math.min(1, finalScore + melodicBonus - extremePenalty));
}