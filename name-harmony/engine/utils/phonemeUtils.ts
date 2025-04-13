// engine/utils/phonemeUtils.ts
export function getCVPattern(name: string): string {
    const vowels = 'aeiouy';
    return name
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .split('')
      .map((char) => (vowels.includes(char) ? 'V' : 'C'))
      .join('');
  }
  