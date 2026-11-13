const toggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
function displayTheme() {
  if (!toggle) return;
  const dark = document.documentElement.dataset.theme === 'dark';
  toggle.textContent = dark ? '☼' : '☾';
  toggle.setAttribute('aria-pressed', String(dark));
}
displayTheme();
toggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('shiori-theme', next); } catch { /* Theme still works for this page. */ }
  displayTheme();
});
