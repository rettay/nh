// engine/modules/distinctiveness.ts

export function scoreDistinctiveness(first: string, last: string): {
    score: number;
    explanation: string;
  } {
    const full = `${first} ${last}`.toLowerCase();
    const firstOnly = first.toLowerCase();
    const lastOnly = last.toLowerCase();
    let score = 0;
    const notes: string[] = [];
  
    // Penalize boring combos like John Johnson, James Jameson
    if (lastOnly.startsWith(firstOnly) || lastOnly.includes(firstOnly)) {
      score -= 10;
      notes.push('First and last names are too similar');
    }
  
    // Bonus for internal rhyme or alliteration
    if (firstOnly[0] === lastOnly[0]) {
      score += 5;
      notes.push('Memorable alliteration');
    }
  
    // Bonus for longer or more lyrical names
    if (first.length + last.length > 16) {
      score += 3;
      notes.push('Striking length makes name stand out');
    }
  
    // TODO: In future — compare against real name frequency databases
    // For now, simulate with clunky or overused name fragments
    const commonFragments = ['john', 'michael', 'smith', 'james', 'lee'];
    const containsCommon = commonFragments.some((frag) => full.includes(frag));
  
    if (containsCommon) {
      score -= 3;
      notes.push('Contains overly common name fragments');
    }
  
    const explanation = notes.length
      ? notes.join('; ')
      : 'No distinctiveness features detected';
  
    return {
      score: Math.max(-10, Math.min(10, score)),
      explanation,
    };
  }
  