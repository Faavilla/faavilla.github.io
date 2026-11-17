// Replaces the former inline onclick so the CSP can drop script-src 'unsafe-inline'.
// The anchor keeps href="/" as the no-JS fallback; with history we go back instead.
const backLink = document.querySelector(".article__back-link");

if (backLink) {
  // On a fresh load, note whether a page is behind (history.length also counts forward ones)
  const recordHadBack = () => {
    history.replaceState({ ...history.state, hadBack: history.length > 1 }, "");
  };

  if (performance.getEntriesByType("navigation")[0]?.type === "navigate") {
    // A prerendered page has a one-entry history until shown, so wait for activation
    if (document.prerendering) {
      document.addEventListener("prerenderingchange", recordHadBack, { once: true });
    } else {
      recordHadBack();
    }
  }

  backLink.addEventListener("click", event => {
    // Modified clicks (new tab or window, download) stay with the browser
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    // First entry of the tab, where back() would do nothing: follow href="/"
    if (history.state?.hadBack === false) {
      return;
    }

    if (history.length > 1) {
      event.preventDefault();
      history.back();
    }
  });
}
