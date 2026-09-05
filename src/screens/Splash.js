// ============================================
// SYBRAI — Splash Screen
// ============================================

import { navigate } from '../router.js';

export function renderSplash() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--splash';
  screen.innerHTML = `
    <div class="splash-logo">
      <svg class="splash-logo__svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#C7D2FE"/>
          </linearGradient>
        </defs>
        <path d="M60 10L95 30V70L60 110L25 70V30L60 10Z" stroke="url(#logoGrad)" stroke-width="3" fill="none"/>
        <path d="M45 55L55 75L80 40" stroke="url(#logoGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M60 10L60 25M95 30L82 38M95 70L82 62M60 110L60 95M25 70L38 62M25 30L38 38" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      </svg>
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
