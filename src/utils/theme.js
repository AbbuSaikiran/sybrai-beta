// ============================================
// SYBRAI — Theme Manager
// Dark/light toggle with OS preference detection
// ============================================

export function initTheme() {
  const saved = localStorage.getItem('sybrai-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

export function toggleTheme() {
  const html = document.documentElement;
  html.classList.add('theme-transitioning');

  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  html.setAttribute('data-theme', next);
  localStorage.setItem('sybrai-theme', next);

  setTimeout(() => html.classList.remove('theme-transitioning'), 350);
  return next;
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
