import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { en } from './en';

const ARABIC = /[\u0600-\u06FF]/;
// Arabic strings that are data or not user-facing text, so they need no translation
const IGNORED = new Set(['تقرير ميداني (وهمي)']);

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name: string) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'i18n' ? [] : sources(path);
    return /\.(ts|tsx)$/.test(name) && !/\.(test|spec)\./.test(name) ? [path] : [];
  });
}

/** Fails when someone adds an Arabic string to the UI without an English translation */
describe('English dictionary coverage', () => {
  it('has an entry for every Arabic string literal in src/', () => {
    const missing = new Set<string>();
    for (const file of sources(join(process.cwd(), 'src'))) {
      const code = readFileSync(file, 'utf8');
      for (const m of code.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g)) {
        const text = (m[1] ?? m[2]).replace(/\\(["'])/g, '$1');
        if (ARABIC.test(text) && !(text in en) && !IGNORED.has(text)) missing.add(`${file.split('src/')[1]}: ${text}`);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('keeps the same placeholders in both languages', () => {
    const bad = Object.entries(en).filter(([ar, text]) => (ar.match(/\{\d+\}/g) ?? []).sort().join() !== (text.match(/\{\d+\}/g) ?? []).sort().join());
    expect(bad.map(([k]) => k)).toEqual([]);
  });
});
