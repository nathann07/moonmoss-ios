// Anti-theft step for the built game: adds a hidden Mini Moth signature and obfuscates every
// inline <script>, so a copied build is hard to read or edit. The readable code stays in game/moonmoss.html.
import JavaScriptObfuscator from 'javascript-obfuscator';

const OPTIONS = {
  compact: true,
  controlFlowFlattening: false,   // off: keeps the game loop fast
  deadCodeInjection: false,
  selfDefending: false,           // off: can break on some browsers
  renameGlobals: false,           // keeps top-level names the page relies on
  identifierNamesGenerator: 'hexadecimal',
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: false,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  target: 'browser',
};

export function signature(game, slug) {
  return `;(function(){try{Object.defineProperty(window,'__mm_sig',{value:'${game} (c) 2026 Mini Moth Games / Nate. Original build: billjones.itch.io/${slug}. MM-${game.toUpperCase()}-7Q4K',enumerable:false});` +
    `console.log('%c${game} by Mini Moth Games','color:#7fb2ff');}catch(e){}})();\n`;
}

// Obfuscates each inline <script> in html. The script at index `signIndex` gets the signature first.
export function protect(html, { game, slug, signIndex = 1 }) {
  let i = 0;
  const out = html.replace(/<script>([\s\S]*?)<\/script>/g, (whole, code) => {
    if (i === signIndex) code = signature(game, slug) + code;
    const js = JavaScriptObfuscator.obfuscate(code, { ...OPTIONS, seed: 1235 + i }).getObfuscatedCode();
    i++;
    if (js.includes('</script')) throw new Error('script terminator in obfuscated output');
    return '<script>' + js + '</script>';
  });
  if (i <= signIndex) throw new Error(`expected at least ${signIndex + 1} scripts, found ${i}`);
  return out;
}
