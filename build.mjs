// Builds index.html from the per-section files in partials/.
//
//   partials/_layout.html   page skeleton; each section is pulled in with
//                           a line like  <!--#include hero.html-->
//   partials/*.html         one file per section / component (edit these)
//
// Usage:  node build.mjs        (run this after editing any partial, before committing)
//
// The generated index.html is what GitHub Pages serves, so it stays committed.
// styles.css and script.js are shared and loaded as before.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const partials = path.join(root, 'partials');

const read = (f) => {
  const p = path.join(partials, f);
  if (!fs.existsSync(p)) throw new Error(`missing partial: partials/${f}`);
  return fs.readFileSync(p, 'utf8');
};

const layout = read('_layout.html');
const used = [];
// Replace each "<!--#include file.html-->" line (and its newline) with that file's contents.
const out = layout.replace(/^[ \t]*<!--#include\s+(.+?)\s*-->\n/gm, (_m, file) => {
  used.push(file);
  return read(file);
});

const remaining = out.match(/<!--#include/);
if (remaining) throw new Error('unresolved include marker left in output');

fs.writeFileSync(path.join(root, 'index.html'), out);
console.log(`built index.html from ${used.length} partials`);
