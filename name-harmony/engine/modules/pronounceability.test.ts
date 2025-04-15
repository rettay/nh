import { pronounceability } from "./pronounceability";

test("Easy: Mira", () => {
  expect(pronounceability("Mira")).toBeGreaterThan(0.9);
});

test("Medium: Zkra", () => {
  const score = pronounceability("Zkra");
  expect(score).toBeGreaterThan(0.3);
  expect(score).toBeLessThan(0.6);
});

test("Hard: Brktz", () => {
  expect(pronounceability("Brktz")).toBeLessThan(0.3);
});
