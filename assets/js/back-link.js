// Replaces the former inline onclick so the CSP can drop script-src 'unsafe-inline'.
// The anchor keeps href="/" as the no-JS fallback; with history we go back instead.
const backLink = document.querySelector(".article__back-link");

if (backLink) {
  backLink.addEventListener("click", event => {
    if (history.length > 1) {
      event.preventDefault();
      history.back();
    }
  });
}
