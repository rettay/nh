
// Minimal mock implementations. Replace with real logic if available.
export function getPhonemes(name: string): string[] {
  return name.toLowerCase().replace(/[^a-z]/g, '').split('');
}

export function getStressPattern(name: string): string[] {
  // Mock: pretend 2-syllable names have primary stress on the first syllable
  return name.length > 3 ? ['1', '0'] : ['1'];
}

export function countSyllables(name: string): number {
  // Naive syllable count approximation
  return name.toLowerCase().split(/[aeiouy]+/).filter(Boolean).length || 1;
}
