// Builds the itch.io release of Moonmoss from game/moonmoss.html:
//  1. wraps it in a full HTML page (game/moonmoss.html has no <html>/<head> tags; the iOS build adds its own)
//  2. adds the site lock (itch/sitelock.js) as the first script, so the game only runs on itch.io and locally
//  3. obfuscates every script and adds a hidden Mini Moth signature (itch/protect.mjs)
// Output: itch/moonmoss.html — upload this file to itch.io, never game/moonmoss.html.
//   cd itch && npm install && node build.mjs
// Lives outside game/ on purpose, so changing it doesn't start an iOS build.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { protect } from './protect.mjs';
import { weave } from './tripwire.mjs';

const here = dirname(fileURLToPath(import.meta.url));
let game = readFileSync(join(here, '..', 'game', 'moonmoss.html'), 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
// Weave host-check tripwires into the game loop and run start, so the lock survives deletion of
// the prelude. loop()'s own try/catch swallows errors, so the tripwire sits before it (right
// after the opening brace); startRun() is the entry into gameplay.
game = weave(game, ['function loop(now) {', 'function startRun() {']);
const lock = readFileSync(join(here, 'sitelock.js'), 'utf8');
if (!game.includes('<script>')) throw new Error('game/moonmoss.html has no <script>');
const body = game.indexOf('<div');
if (body < 0) throw new Error('could not find where the page body starts');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="mm-build" content="locked+obfuscated">
<script>
${lock}</script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${game.slice(0, body).trim()}
</head>
<body>
${game.slice(body).trim()}

</body>
</html>
`;
const out = protect(html, { game: 'Moonmoss', slug: 'moonmoss' });
writeFileSync(join(here, 'moonmoss.html'), out);
console.log('built itch/moonmoss.html', (out.length / 1024).toFixed(0) + ' KB (locked + obfuscated)');
