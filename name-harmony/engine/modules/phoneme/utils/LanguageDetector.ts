// engine/modules/phoneme/utils/languageDetector.ts

/**
 * Simple language detection based on phonological patterns
 */
export function detectLanguage(text: string): string {
    const normalized = text.toLowerCase();
    
    // Check for Chinese patterns (pinyin)
    if (/zh|xi|qi|[aoei]ng$/.test(normalized) || 
        /[aeiou][0-4]/.test(normalized)) { // Tone numbers
      return 'zh';
    }
    
    // Check for Italian patterns
    if (/[aeiou]$/.test(normalized) && 
        (/[bcdfglmnpqrstvz]{2}/.test(normalized) || 
         /([aeio])(\1)/.test(normalized))) { // Double vowels
      return 'it';
    }
    
    // Check for common English patterns
    if (/th|sh|wh|ph|gh|ck/.test(normalized) ||
        /[^aeiou]y$/.test(normalized)) {
      return 'en';
    }
    
    // Default to English
    return 'en';
  }