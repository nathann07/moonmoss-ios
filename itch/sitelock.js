// Mini Moth Games site lock
// Added to itch/moonmoss.html by itch/build.mjs as the first script, before the game.
// The game only runs on itch.io (and locally / inside the iOS app wrapper).
// Anywhere else it shows a notice linking players to the real page.
(function () {
  var GAME_URL = "https://billjones.itch.io/moonmoss"; // set per game: moonmoss / saltmeadow

  var ALLOWED_HOSTS = [
    "itch.io",        // billjones.itch.io
    "itch.zone",      // itch's HTML game host (html-classic.itch.zone etc.)
    "hwcdn.net",      // older itch game CDN
    "localhost",      // local testing + Capacitor iOS wrapper
    "127.0.0.1"
  ];
  var ALLOWED_FRAME_PARENTS = ["itch.io", "itch.zone"];

  function matches(host, list) {
    host = (host || "").toLowerCase();
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (host === d || host.slice(-(d.length + 1)) === "." + d) return true;
    }
    return false;
  }

  function hostOf(url) {
    try { return new URL(url).hostname; } catch (e) { return ""; }
  }

  var proto = location.protocol;
  // file:// and the iOS app (capacitor://, ionic://) are always fine
  var localOk = proto === "file:" || proto === "capacitor:" || proto === "ionic:";
  var hostOk = localOk || matches(location.hostname, ALLOWED_HOSTS);

  // If the game is embedded in someone else's site, check who is framing it
  var frameOk = true;
  if (!localOk && window.top !== window.self) {
    var parentHost = "";
    if (location.ancestorOrigins && location.ancestorOrigins.length) {
      parentHost = hostOf(location.ancestorOrigins[location.ancestorOrigins.length - 1]);
    } else if (document.referrer) {
      parentHost = hostOf(document.referrer);
    }
    if (parentHost && !matches(parentHost, ALLOWED_FRAME_PARENTS)) frameOk = false;
  }

  if (hostOk && frameOk) return;

  // Locked: stop the page and show where to play the real game
  window.__MINI_MOTH_LOCKED__ = true;
  function block() {
    document.documentElement.innerHTML =
      '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;' +
      'background:#0d1220;color:#e8ecf5;font-family:system-ui,sans-serif;text-align:center;padding:24px">' +
      '<div><p style="font-size:20px;margin:0 0 12px">This game was made by Mini Moth Games.</p>' +
      '<p style="margin:0 0 20px;opacity:.8">This copy is not authorized. Play the official version here:</p>' +
      '<a href="' + GAME_URL + '" target="_blank" rel="noopener" style="color:#7fb2ff">' + GAME_URL + '</a></div></body>';
  }
  if (document.readyState === "loading") {
    document.write("<!--"); // swallow the rest of the page so game scripts never load
    document.addEventListener("DOMContentLoaded", block);
  } else {
    block();
  }
  throw new Error("Mini Moth site lock");
})();
