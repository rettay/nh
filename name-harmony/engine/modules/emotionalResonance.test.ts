import { emotionalResonance } from "./emotionalResonance";

describe("emotionalResonance", () => {
  test("High resonance: Luna", () => {
    const score = emotionalResonance("Luna");
    expect(score).toBeGreaterThan(0.9);
  });

  test("High resonance: Kiki", () => {
    const score = emotionalResonance("Kiki");
    expect(score).toBeGreaterThan(0.8);
  });

  test("Moderate resonance: Ragnar", () => {
    const score = emotionalResonance("Ragnar");
    expect(score).toBeGreaterThan(0.6);
    expect(score).toBeLessThan(0.8);
  });

  test("Low resonance: Brktz", () => {
    const score = emotionalResonance("Brktz");
    expect(score).toBeLessThan(0.4);
  });

  test("Neutral resonance: Tana", () => {
    const score = emotionalResonance("Tana");
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(0.8);
  });

  test("Harsh cluster penalty applies: Krztn", () => {
    const score = emotionalResonance("Krztn");
    expect(score).toBeLessThan(0.3);
  });

  test("Empty name gets zero score", () => {
    const score = emotionalResonance("");
    expect(score).toBe(0);
  });

  test("Single character name gets fallback score", () => {
    const score = emotionalResonance("A");
    expect(score).toBe(0);
  });

  test("Mixed vowels and consonants, well-balanced: Elina", () => {
    const score = emotionalResonance("Elina");
    expect(score).toBeGreaterThan(0.75);
  });

  test("Dark vowel heavy name: Bruno", () => {
    const score = emotionalResonance("Bruno");
    expect(score).toBeGreaterThan(0.5);
  });
});
