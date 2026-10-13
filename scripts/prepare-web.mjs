// Turns game/moonmoss.html (the same file that goes to itch.io) into www/index.html for the iOS app.
// Changes made for iOS:
//  - fonts are bundled inside the app instead of loaded from Google Fonts, so the game works offline
//  - a viewport tag so the game is sized for the phone screen and can't be pinch-zoomed
//  - no text selection, long-press callouts or tap highlights anywhere on the page
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'game', 'moonmoss.html');
const out = join(root, 'www');
if (!existsSync(src)) { console.error('Missing game/moonmoss.html'); process.exit(1); }

const fonts = [
  ['im-fell-english-sc', 'im-fell-english-sc-latin-400-normal.woff2', "'IM Fell English SC'", 400, 'normal'],
  ['im-fell-english', 'im-fell-english-latin-400-normal.woff2', "'IM Fell English'", 400, 'normal'],
  ['im-fell-english', 'im-fell-english-latin-400-italic.woff2', "'IM Fell English'", 400, 'italic'],
  ['nunito', 'nunito-latin-600-normal.woff2', 'Nunito', 600, 'normal'],
  ['nunito', 'nunito-latin-800-normal.woff2', 'Nunito', 800, 'normal'],
];

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'fonts'), { recursive: true });
let faces = '';
for (const [pkg, file, family, weight, style] of fonts) {
  copyFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file), join(out, 'fonts', file));
  faces += `  @font-face{font-family:${family};font-style:${style};font-weight:${weight};font-display:block;src:url(fonts/${file}) format('woff2')}\n`;
}

let html = readFileSync(src, 'utf8');
const before = html.length;
html = html.replace(/^\s*<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*\n?/gm, '');
if (html.length === before) console.warn('Note: no Google Fonts links found to remove.');
if (html.includes('fonts.googleapis.com')) { console.error('Google Fonts link still present; check the <link> tags.'); process.exit(1); }

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="format-detection" content="telephone=no">
<style>
${faces}  html,body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
</style>
`;
if (!html.includes('<script>')) { console.error('Unexpected file: no <script> found.'); process.exit(1); }
writeFileSync(join(out, 'index.html'), head + html.trim() + '\n</html>\n');
console.log('Wrote www/index.html with', fonts.length, 'bundled fonts.');
