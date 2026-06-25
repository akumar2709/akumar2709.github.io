function stampFooter() {
  const y = document.getElementById("year");
  const lu = document.getElementById("last-updated");
  const now = new Date();
  if (y) y.textContent = String(now.getFullYear());
  if (lu) lu.textContent = `Last updated: ${now.toLocaleDateString()}`;
}

window.addEventListener("DOMContentLoaded", () => {
  stampFooter();
});
