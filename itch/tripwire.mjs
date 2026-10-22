// Interwoven site-lock tripwires.
// The prelude (src/sitelock.js) is a clean, separate check — but a thief can delete that one
// block and keep the game. These tripwires are injected INSIDE game functions, so after
// obfuscation they're scattered through the game's own code and renamed. Deleting the prelude
// leaves them firing; to defeat the lock a thief has to find and remove every one.
//
// Each tripwire independently re-checks the host (no shared function to stub out) and, if the
// page isn't on itch.io / localhost / the app, throws — stopping the game. The throw-only
// form carries no notice text or URL, so a deobfuscator can't find the checks by searching for
// strings; the friendly "play the real version" notice is shown by the prelude (src/sitelock.js),
// which handles the common case of a thief copying the whole file unchanged.
//
// The host strings themselves are assembled from char codes at runtime, so 'itch.io' etc. don't
// appear literally in the file even after deobfuscation.
export function tripwire() {
  // ['itch.io','itch.zone','hwcdn.net','localhost','127.0.0.1'] built from char codes.
  const enc = ['itch.io', 'itch.zone', 'hwcdn.net', 'localhost', '127.0.0.1']
    .map(s => '[' + [...s].map(c => c.charCodeAt(0)).join(',') + ']').join(',');
  // One line, slots in after a `function f(){` opening brace. `_mm$` names are rare enough to stay unique.
  return `if(!((function(){try{var _mm$p=location.protocol;if(_mm$p==='file:'||_mm$p==='capacitor:'||_mm$p==='ionic:')return true;var _mm$h=(location.hostname||'').toLowerCase(),_mm$A=[${enc}].map(function(a){return String.fromCharCode.apply(null,a);});for(var _mm$i=0;_mm$i<_mm$A.length;_mm$i++){var _mm$d=_mm$A[_mm$i];if(_mm$h===_mm$d||_mm$h.slice(-(_mm$d.length+1))==='.'+_mm$d)return true;}return false;}catch(_mm$e){return true;}})()))throw new RangeError();`;
}

// Splice a tripwire in right after each `function <name>(...) {` opening. Each anchor must
// occur exactly once in the source, or the build fails loudly rather than shipping unprotected.
export function weave(js, anchors) {
  const trip = '\n' + tripwire() + '\n';
  for (const anchor of anchors) {
    const i = js.indexOf(anchor);
    if (i < 0) throw new Error('tripwire anchor not found: ' + anchor);
    if (js.indexOf(anchor, i + anchor.length) >= 0) throw new Error('tripwire anchor not unique: ' + anchor);
    js = js.slice(0, i + anchor.length) + trip + js.slice(i + anchor.length);
  }
  return js;
}
