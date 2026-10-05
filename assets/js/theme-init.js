// Inlined into <head> by head.html and allowed via a CSP sha256 hash, so it still runs
// before first paint (no dark-mode flash) without script-src 'unsafe-inline'.
// Mirrors the initial-theme logic in color-mode-btn.js; keep the two in sync.
(function () {
  try {
    const stored = localStorage.getItem("theme");
    const dark = stored === "dark"
      || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.querySelector("meta[name=theme-color]").setAttribute("content", "#211f1b");
    }
  } catch (err) { }
})();
