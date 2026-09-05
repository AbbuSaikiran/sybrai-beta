// ============================================
// SYBRAI — Splash Screen
// ============================================

import { navigate } from '../router.js';

export function renderSplash() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--splash';
  screen.innerHTML = `
    <div class="splash-logo">
      <img src="/logo.png" alt="SYBRAI Logo" class="splash-logo__img" />
    </div>
    <div class="splash-brand">
      <div class="splash-brand__name">SYBRAI</div>
      <div class="splash-brand__sub">AI Bug Fixer & Analyzer</div>
    </div>
    <div class="splash-tagline">Describe. Analyze. Fix. Learn. Improve.</div>
    <div class="splash-progress">
      <div class="splash-progress__bar"></div>
    </div>
    <div class="splash-init">Initializing...</div>
  `;

  // Auto-navigate to home after splash animation
  setTimeout(() => {
    navigate('/home');
  }, 3200);

  return screen;
}
