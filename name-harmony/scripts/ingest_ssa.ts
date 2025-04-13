// scripts/ingest_ssa.ts
import fs from 'fs';
import path from 'path';

type NameEntry = {
  name: string;
  gender: 'male' | 'female';
  culture: 'english';
};

// Adjust path to your SSA file
const INPUT_FILE = path.resolve('data/yob2022.txt');
const OUTPUT_FILE = path.resolve('engine/data/names_english.ts');
const MAX_NAMES = 500; // limit to top N male names

const maleNames = new Set<string>();

const raw = fs.readFileSync(INPUT_FILE, 'utf8');
const lines = raw.split('\n');

for (const line of lines) {
  const [name, gender, count] = line.split(',');
  if (gender === 'M') {
    maleNames.add(name);
    if (maleNames.size >= MAX_NAMES) break;
  }
}

const nameList: NameEntry[] = Array.from(maleNames).map((name) => ({
  name,
  gender: 'male',
  culture: 'english',
}));

fs.mkdirSync('engine/data', { recursive: true });
fs.writeFileSync(
  OUTPUT_FILE,
  `export const ENGLISH_NAMES = ${JSON.stringify(nameList, null, 2)};\n`
);

console.log(`✅ Wrote ${nameList.length} names to ${OUTPUT_FILE}`);
