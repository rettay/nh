// engine/modules/phoneme/processors/ChineseProcessor.ts

import { Phoneme, PhonemeOptions, ContextRule } from '../types';
import { BaseLanguageProcessor } from './BaseProcessor';

export class ChineseProcessor extends BaseLanguageProcessor {
  protected phonemeMap: Map<string, Phoneme>;
  protected diphthongs: string[];
  protected contextRules: ContextRule[];
  private pinyinSyllables: Set<string>;
  private commonSyllables: string[];
  
  constructor() {
    super();
    this.phonemeMap = this.buildPhonemeMap();
    this.diphthongs = ['ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'ue', 'er'];
    this.contextRules = [];
    this.pinyinSyllables = this.buildPinyinSyllableSet();
    this.commonSyllables = this.buildCommonSyllables();
  }
  
  private buildPhonemeMap(): Map<string, Phoneme> {
    const map = new Map<string, Phoneme>();
    
    // Basic initials (consonants)
    map.set('b', {
      symbol: 'p',  // Unaspirated p
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('p', {
      symbol: 'pʰ',  // Aspirated p
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('m', {
      symbol: 'm',
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'nasal',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('f', {
      symbol: 'f',
      type: 'consonant',
      features: { 
        place: 'labiodental',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('d', {
      symbol: 't',  // Unaspirated t
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('t', {
      symbol: 'tʰ',  // Aspirated t
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('n', {
      symbol: 'n',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'nasal',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('l', {
      symbol: 'l',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'lateral',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('g', {
      symbol: 'k',  // Unaspirated k
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('k', {
      symbol: 'kʰ',  // Aspirated k
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('h', {
      symbol: 'x',  // Velar fricative
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('j', {
      symbol: 'tɕ',  // Unaspirated j
      type: 'consonant',
      features: { 
        place: 'alveolo-palatal',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('q', {
      symbol: 'tɕʰ',  // Aspirated q
      type: 'consonant',
      features: { 
        place: 'alveolo-palatal',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('x', {
      symbol: 'ɕ',  // Alveolo-palatal fricative
      type: 'consonant',
      features: { 
        place: 'alveolo-palatal',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('zh', {
      symbol: 'ʈʂ',  // Unaspirated zh
      type: 'consonant',
      features: { 
        place: 'retroflex',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('ch', {
      symbol: 'ʈʂʰ',  // Aspirated ch
      type: 'consonant',
      features: { 
        place: 'retroflex',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('sh', {
      symbol: 'ʂ',  // Retroflex fricative
      type: 'consonant',
      features: { 
        place: 'retroflex',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('r', {
      symbol: 'ʐ',  // Retroflex approximant
      type: 'consonant',
      features: { 
        place: 'retroflex',
        manner: 'approximant',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('z', {
      symbol: 'ts',  // Unaspirated z
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('c', {
      symbol: 'tsʰ',  // Aspirated c
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('s', {
      symbol: 's',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    // Finals (vowels and diphthongs)
    map.set('a', {
      symbol: 'a',
      type: 'vowel',
      features: { 
        height: 'low', 
        backness: 'central', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('o', {
      symbol: 'o',
      type: 'vowel',
      features: { 
        height: 'mid', 
        backness: 'back', 
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('e', {
      symbol: 'ɤ',
      type: 'vowel',
      features: { 
        height: 'mid', 
        backness: 'back', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('i', {
      symbol: 'i',
      type: 'vowel',
      features: { 
        height: 'high', 
        backness: 'front', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('u', {
      symbol: 'u',
      type: 'vowel',
      features: { 
        height: 'high', 
        backness: 'back', 
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ü', {
      symbol: 'y',
      type: 'vowel',
      features: { 
        height: 'high', 
        backness: 'front', 
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    // Common diphthongs
    map.set('ai', {
      symbol: 'ai',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'front',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ei', {
      symbol: 'ei',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'front',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ao', {
      symbol: 'au',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'back',
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ou', {
      symbol: 'ou',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'back',
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    // Finals with nasal codas
    map.set('an', {
      symbol: 'an',
      type: 'diphthong',
      features: { 
        height: 'low',
        backness: 'central',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('en', {
      symbol: 'ən',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'central',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ang', {
      symbol: 'aŋ',
      type: 'diphthong',
      features: { 
        height: 'low',
        backness: 'back',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('eng', {
      symbol: 'əŋ',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'central',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ong', {
      symbol: 'ʊŋ',
      type: 'diphthong',
      features: { 
        height: 'high',
        backness: 'back',
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    return map;
  }
  
  private buildPinyinSyllableSet(): Set<string> {
    // A small subset of valid Pinyin syllables for demonstration
    return new Set([
      'a', 'ai', 'an', 'ang', 'ao', 
      'ba', 'bai', 'ban', 'bang', 'bao', 'bei', 'ben', 'beng', 'bi', 'bian', 'biao', 
      'bie', 'bin', 'bing', 'bo', 'bu', 
      'ca', 'cai', 'can', 'cang', 'cao', 'ce', 'cen', 'ceng', 'cha', 'chai', 
      'chang', 'chao', 'che', 'chen', 'cheng', 'chi', 'chong', 'chou', 'chu', 
      'da', 'dai', 'dan', 'dang', 'dao', 'de', 'deng', 'di', 'dian', 'diao', 
      'ding', 'diu', 'dong', 'dou', 'du', 'duan', 'dui', 'dun', 'duo', 
      'e', 'en', 'er', 
      'fa', 'fan', 'fang', 'fei', 'fen', 'feng', 'fo', 'fou', 'fu', 
      'ga', 'gai', 'gan', 'gang', 'gao', 'ge', 'gei', 'gen', 'geng', 'gong', 
      'gou', 'gu', 'gua', 'guai', 'guan', 'guang', 'gui', 'gun', 'guo', 
      'ha', 'hai', 'han', 'hang', 'hao', 'he', 'hei', 'hen', 'heng', 'hong', 
      'hou', 'hu', 'hua', 'huai', 'huan', 'huang', 'hui', 'hun', 'huo', 
      'ji', 'jia', 'jian', 'jiang', 'jiao', 'jie', 'jin', 'jing', 'jiong', 'jiu', 
      'ju', 'juan', 'jue', 'jun', 
      'ka', 'kai', 'kan', 'kang', 'kao', 'ke', 'ken', 'keng', 'kong', 'kou', 
      'ku', 'kua', 'kuai', 'kuan', 'kuang', 'kui', 'kun', 'kuo', 
      'la', 'lai', 'lan', 'lang', 'lao', 'le', 'lei', 'leng', 'li', 'lia', 
      'lian', 'liang', 'liao', 'lie', 'lin', 'ling', 'liu', 'long', 'lou', 'lu', 
      'luan', 'lun', 'luo', 'lv', 'lve', 
      'ma', 'mai', 'man', 'mang', 'mao', 'me', 'mei', 'men', 'meng', 'mi', 
      'mian', 'miao', 'mie', 'min', 'ming', 'miu', 'mo', 'mou', 'mu', 
      'na', 'nai', 'nan', 'nang', 'nao', 'ne', 'nei', 'nen', 'neng', 'ni', 
      'nian', 'niang', 'niao', 'nie', 'nin', 'ning', 'niu', 'nong', 'nou', 'nu', 
      'nuan', 'nuo', 'nv', 'nve',
      'o', 'ou', 
      'pa', 'pai', 'pan', 'pang', 'pao', 'pei', 'pen', 'peng', 'pi', 'pian', 
      'piao', 'pie', 'pin', 'ping', 'po', 'pu', 
      'qi', 'qia', 'qian', 'qiang', 'qiao', 'qie', 'qin', 'qing', 'qiong', 'qiu', 
      'qu', 'quan', 'que', 'qun', 
      'ran', 'rang', 'rao', 're', 'ren', 'reng', 'ri', 'rong', 'rou', 'ru', 
      'ruan', 'rui', 'run', 'ruo', 
      'sa', 'sai', 'san', 'sang', 'sao', 'se', 'sen', 'seng', 'sha', 'shai', 
      'shan', 'shang', 'shao', 'she', 'shen', 'sheng', 'shi', 'shou', 'shu', 
      'shua', 'shuai', 'shuan', 'shuang', 'shui', 'shun', 'shuo', 'si', 'song', 
      'sou', 'su', 'suan', 'sui', 'sun', 'suo', 
      'ta', 'tai', 'tan', 'tang', 'tao', 'te', 'teng', 'ti', 'tian', 'tiao', 
      'tie', 'ting', 'tong', 'tou', 'tu', 'tuan', 'tui', 'tun', 'tuo', 
      'wa', 'wai', 'wan', 'wang', 'wei', 'wen', 'weng', 'wo', 'wu', 
      'xi', 'xia', 'xian', 'xiang', 'xiao', 'xie', 'xin', 'xing', 'xiong', 'xiu', 
      'xu', 'xuan', 'xue', 'xun', 
      'ya', 'yan', 'yang', 'yao', 'ye', 'yi', 'yin', 'ying', 'yo', 'yong', 
      'you', 'yu', 'yuan', 'yue', 'yun', 
      'za', 'zai', 'zan', 'zang', 'zao', 'ze', 'zei', 'zen', 'zeng', 'zha', 
      'zhai', 'zhan', 'zhang', 'zhao', 'zhe', 'zhen', 'zheng', 'zhi', 'zhong', 
      'zhou', 'zhu', 'zhua', 'zhuai', 'zhuan', 'zhuang', 'zhui', 'zhun', 'zhuo', 
      'zi', 'zong', 'zou', 'zu', 'zuan', 'zui', 'zun', 'zuo'
    ]);
  }
  
  private buildCommonSyllables(): string[] {
    // Most common syllables in Chinese names
    return [
      'ai', 'an', 'bai', 'bo', 'chan', 'chen', 'cheng', 'chi', 'chun', 
      'da', 'di', 'fang', 'fei', 'fen', 'feng', 'fu', 
      'gang', 'gao', 'ge', 'gong', 'gu', 'guo', 
      'hai', 'han', 'hao', 'he', 'hong', 'hua', 'hui', 
      'ji', 'jia', 'jian', 'jiang', 'jie', 'jin', 'jing', 'jun', 
      'kai', 'kang', 'ke', 'kun', 
      'lan', 'lei', 'li', 'lian', 'liang', 'lin', 'ling', 'long', 'lu', 
      'mei', 'meng', 'min', 'ming', 
      'na', 'nan', 'ning', 
      'peng', 'ping', 
      'qi', 'qian', 'qiang', 'qin', 'qing', 
      'rong', 'ru', 
      'shan', 'sheng', 'shi', 'shu', 
      'tai', 'tao', 'tian', 'ting', 
      'wan', 'wei', 'wen', 'wu', 
      'xi', 'xian', 'xiang', 'xiao', 'xin', 'xing', 'xiong', 'xu', 'xue', 
      'yan', 'yang', 'yao', 'ye', 'yi', 'yin', 'ying', 'yong', 'yu', 'yuan', 'yue', 
      'zhan', 'zhang', 'zhao', 'zhe', 'zhen', 'zheng', 'zhi', 'zhong', 'zhou', 'zhu'
    ];
  }
  
  protected tokenize(text: string): string[] {
    // Remove tone numbers if present
    const cleanText = text.replace(/[0-5]/g, '');
    const syllables: string[] = [];
    
    // Try to match whole syllables first
    let current = '';
    let i = 0;
    
    while (i < cleanText.length) {
      // Try to find valid syllables
      let found = false;
      
      // Check for 3-character syllables first (like "zhuang")
      if (i + 2 < cleanText.length) {
        const tryThree = cleanText.substring(i, i + 3);
        if (this.pinyinSyllables.has(tryThree)) {
          syllables.push(tryThree);
          i += 3;
          found = true;
          continue;
        }
      }
      
      // Check for 2-character syllables (like "zhong")
      if (i + 1 < cleanText.length) {
        const tryTwo = cleanText.substring(i, i + 2);
        if (this.pinyinSyllables.has(tryTwo)) {
          syllables.push(tryTwo);
          i += 2;
          found = true;
          continue;
        }
      }
      
      // Check for 1-character syllables (like "a")
      const tryOne = cleanText.substring(i, i + 1);
      if (this.pinyinSyllables.has(tryOne)) {
        syllables.push(tryOne);
        i += 1;
        found = true;
        continue;
      }
      
      // If no valid syllable found, just advance one character
      // In a production system, we would have better error handling here
      i++;
    }
    
    return syllables;
  }
  
  protected tokensToPhonemes(tokens: string[], options?: PhonemeOptions): Phoneme[] {
    const phonemes: Phoneme[] = [];
    
    for (const token of tokens) {
      // Check if the entire token is a valid Pinyin syllable
      if (this.pinyinSyllables.has(token)) {
        // Handle initial consonant if present
        let initial = '';
        let final = token;
        
        // Extract initial consonant
        if (token.startsWith('zh') || token.startsWith('ch') || token.startsWith('sh')) {
          initial = token.substring(0, 2);
          final = token.substring(2);
        } else if (token.length > 1 && !/^[aeiou]/.test(token)) {
          initial = token[0];
          final = token.substring(1);
        }
        
        // Add initial consonant phoneme
        if (initial && this.phonemeMap.has(initial)) {
          phonemes.push(this.phonemeMap.get(initial)!);
        }
        
        // Add final phoneme (vowel or diphthong)
        if (this.phonemeMap.has(final)) {
          phonemes.push(this.phonemeMap.get(final)!);
        } else {
          // Handle finals not in the map by trying to break them down
          // For example, "ian" = "i" + "an"
          let handled = false;
          
          // Try common final combinations
          for (const diphthong of this.diphthongs) {
            if (final.includes(diphthong) && this.phonemeMap.has(diphthong)) {
              phonemes.push(this.phonemeMap.get(diphthong)!);
              handled = true;
              break;
            }
          }
          
          if (!handled) {
            // Process character by character
            for (const char of final) {
              if (this.phonemeMap.has(char)) {
                phonemes.push(this.phonemeMap.get(char)!);
              }
            }
          }
        }
      } else {
        // Handle unknown token by processing character by character
        for (const char of token) {
          if (this.phonemeMap.has(char)) {
            phonemes.push(this.phonemeMap.get(char)!);
          }
        }
      }
    }
    
    return phonemes;
  }
  
  countSyllables(text: string): number {
    // In Chinese, syllable count matches valid Pinyin syllable count
    const tokens = this.tokenize(text);
    return tokens.length;
  }
  
  getSyllableStructure(phonemes: Phoneme[]): string[] {
    // Chinese syllables follow a simple structure: (C)(G)V(C)
    // C = consonant, G = glide, V = vowel, (C) = final consonant (n or ng)
    
    // Convert to CV pattern
    const cvPattern = phonemes.map(p => 
      p.type === 'vowel' || p.type === 'diphthong' ? 'V' : 'C'
    ).join('');
    
    // Split into syllables
    const tokens = this.tokenize(this.normalizeText(cvPattern));
    const syllableStructures: string[] = [];
    
    let currentPos = 0;
    for (const token of tokens) {
      const syllableLength = token.length;
      const syllablePattern = cvPattern.substring(currentPos, currentPos + syllableLength);
      syllableStructures.push(syllablePattern);
      currentPos += syllableLength;
    }
    
    return syllableStructures;
  }
  
  getStressPattern(text: string): string[] {
    // Chinese doesn't have stress in the same way as English/Italian
    // But we can represent tones instead
    const tokens = this.tokenize(text);
    
    // Extract tone numbers from each syllable if present
    // This is a simplified approach - actual implementation would handle tone marks
    const tonePattern = tokens.map(token => {
      const toneMatch = token.match(/[0-4]$/);
      return toneMatch ? toneMatch[0] : '1'; // Default to tone 1 if not specified
    });
    
    return tonePattern;
  }
  
  // Additional Chinese-specific methods
  getTones(text: string): number[] {
    // Extract tone information from Pinyin
    const toneMarks = text.match(/[0-4]/g);
    if (toneMarks) {
      return toneMarks.map(tone => parseInt(tone, 10));
    }
    
    // If no tone marks found, try to infer from tone marks on vowels
    // Simplified tone extraction
    const tones: number[] = [];
    const syllables = this.tokenize(text);
    
    for (const syllable of syllables) {
      if (syllable.includes('ā') || syllable.includes('ē') || 
          syllable.includes('ī') || syllable.includes('ō') || syllable.includes('ū')) {
        tones.push(1);
      } else if (syllable.includes('á') || syllable.includes('é') || 
                syllable.includes('í') || syllable.includes('ó') || syllable.includes('ú')) {
        tones.push(2);
      } else if (syllable.includes('ǎ') || syllable.includes('ě') || 
                syllable.includes('ǐ') || syllable.includes('ǒ') || syllable.includes('ǔ')) {
        tones.push(3);
      } else if (syllable.includes('à') || syllable.includes('è') || 
                syllable.includes('ì') || syllable.includes('ò') || syllable.includes('ù')) {
        tones.push(4);
      } else {
        tones.push(5); // Neutral tone
      }
    }
    
    return tones.length > 0 ? tones : [1]; // Default to tone 1
  }
}