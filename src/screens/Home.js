// ============================================
// SYBRAI — Home Page (Redesigned Dashboard)
// Matches premium AI Bug Fixer & Analyzer layout
// ============================================

import { showToast } from '../utils/toast.js';
import { showMobileInstallModal } from '../utils/mobileModal.js';
import { on, off, EVENTS } from '../utils/eventBus.js';
import { userProfile } from '../data/mockData.js';
import { chatWithAi, getAiConfig } from '../utils/aiService.js';
import {
  startScan, stopScan, autoFixAll, fixSingleFinding,
  getIsScanning, getIsFixing,
  getCurrentFindings, getActivityLog, getLiveStats, getScanHistory,
} from '../utils/scanEngine.js';

let eventCleanups = [];

const DEFAULT_SESSIONS = [
  { id: 's-1', title: 'Login Crash', time: 'Today, 10:30 AM', status: 'fixed', icon: 'file-text' },
  { id: 's-2', title: 'Payment Failure', time: 'Today, 09:15 AM', status: 'fixed', icon: 'code-2' },
  { id: 's-3', title: 'UI Not Responsive', time: 'Yesterday, 06:40 PM', status: 'warning', icon: 'smartphone' },
];

export function renderHome() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--home';

  const live = getLiveStats();
  const stats = {
    score: live.score || 92,
    found: live.score ? live.found : 3,
    fixed: live.score ? live.fixed : 2,
    warnings: live.score ? live.warnings : 1,
  };

  const rawHistory = getScanHistory();
  const sessions = rawHistory && rawHistory.length > 0 && !rawHistory[0].title.startsWith('Security Scan')
    ? rawHistory.slice(0, 3)
    : DEFAULT_SESSIONS;

  const isScanning = getIsScanning();
  const greeting = getGreeting();
  const userName = userProfile.name ? userProfile.name.split(' ')[0] : 'Developer';

  screen.innerHTML = `
    <!-- Top App Bar -->
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <img src="/logo.png" alt="SYBRAI" class="top-app-bar__logo" />
        <div>
          <h1 class="top-app-bar__title" style="font-size:16px;">SYBRAI</h1>
          <div style="font-size:9px; color:var(--color-primary); font-family:var(--font-mono); margin-top:-2px; letter-spacing:0.08em; text-transform:uppercase;">AI Bug Fixer & Analyzer</div>
        </div>
      </div>
      <div class="top-app-bar__trailing" style="display:flex; gap:6px; align-items:center;">
        <button class="top-app-bar__icon-btn" aria-label="Notifications" onclick="window.location.hash='/notifications'" style="position:relative;">
          <i data-lucide="bell"></i>
          <span class="notification-dot"></span>
        </button>
        <img src="${userProfile.avatar || '/avatar.jpg'}" alt="${userProfile.name}" class="home-avatar-img" id="home-avatar" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:2px solid var(--color-primary); cursor:pointer;" onclick="window.location.hash='/profile'" title="${userProfile.name}" />
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="home-scroll-content" id="home-scroll">

      <!-- Greeting Section -->
      <div class="home-greeting">
        <div class="home-greeting__left">
          <h2 class="home-greeting__title">${greeting}, ${userName} 👋</h2>
          <p class="home-greeting__subtitle">What would you like to fix today?</p>
        </div>
        <div class="home-greeting__decoration">
          <span>ANALYZE</span>
          <span>FIX</span>
          <span>LEARN</span>
          <span>IMPROVE</span>
        </div>
      </div>

      <!-- AI Bug Fixer Card -->
      <div class="home-fixer-card">
        <div class="home-fixer-card__header">
          <div class="home-fixer-card__title-row">
            <i data-lucide="sparkles" style="width:18px;height:18px;color:var(--color-primary);"></i>
            <span class="home-fixer-card__title">AI Bug Fixer</span>
          </div>
          <span class="home-fixer-card__badge">
            <i data-lucide="zap" style="width:10px;height:10px;"></i> AI Powered
          </span>
        </div>
        <p class="home-fixer-card__desc">Describe the issue, paste code, or speak</p>

        <div class="home-fixer-card__input-row">
          <button class="home-fixer-card__mic" id="home-mic-btn" aria-label="Voice input" title="Voice Input">
            <i data-lucide="mic" style="width:16px;height:16px;"></i>
          </button>
          <input type="text" class="home-fixer-card__input" id="home-bug-input" placeholder="Type your issue or tap to speak..." />
          <div class="home-fixer-card__wave">
            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
            <div class="wave-bar"></div>
          </div>
        </div>

        <div class="home-fixer-card__tags">
          <button class="home-tag" data-tag="Null pointer">Null pointer</button>
          <button class="home-tag" data-tag="Build error">Build error</button>
          <button class="home-tag" data-tag="App crash">App crash</button>
          <button class="home-tag" data-tag="Performance">Performance</button>
          <button class="home-tag home-tag--more" title="More categories">+</button>
        </div>

        <button class="home-fixer-card__cta" id="home-start-analysis">
          <i data-lucide="sparkles" style="width:16px;height:16px;"></i>
          <span>Start Bug Analysis</span>
          <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
        </button>
      </div>

      <!-- Quick Actions Grid -->
      <div class="home-section">
        <div class="home-section__header">
          <h3 class="home-section__title">Quick Actions</h3>
          <button class="home-section__link" onclick="window.location.hash='/copilot'">See all <i data-lucide="chevron-right" style="width:12px;height:12px;"></i></button>
        </div>
        <div class="home-quick-actions">
          <button class="home-qa-card" id="qa-analyze">
            <div class="home-qa-card__icon home-qa-card__icon--blue">
              <i data-lucide="code-2" style="width:22px;height:22px;"></i>
            </div>
            <span class="home-qa-card__label">Analyze<br>Code</span>
          </button>
          <button class="home-qa-card" id="qa-autofix">
            <div class="home-qa-card__icon home-qa-card__icon--purple">
              <i data-lucide="wrench" style="width:22px;height:22px;"></i>
            </div>
            <span class="home-qa-card__label">Auto<br>Fix</span>
          </button>
          <button class="home-qa-card" id="qa-explain">
            <div class="home-qa-card__icon home-qa-card__icon--teal">
              <i data-lucide="file-text" style="width:22px;height:22px;"></i>
            </div>
            <span class="home-qa-card__label">Explain<br>Error</span>
          </button>
          <button class="home-qa-card" id="qa-scan">
            <div class="home-qa-card__icon home-qa-card__icon--green">
              <i data-lucide="shield-check" style="width:22px;height:22px;"></i>
            </div>
            <span class="home-qa-card__label">Scan<br>Project</span>
          </button>
        </div>
      </div>

      <!-- App Health Overview -->
      <div class="home-section">
        <div class="home-health-card">
          <div class="home-health-card__header">
            <div style="display:flex;align-items:center;gap:6px;">
              <i data-lucide="activity" style="width:16px;height:16px;color:var(--color-primary);"></i>
              <span class="home-health-card__title">App Health Overview</span>
            </div>
            <span class="home-health-card__period">Last 7 days <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></span>
          </div>

          <div class="home-health-card__body">
            <div class="home-health-card__score-area">
              <div class="home-health-card__big-score">
                <span class="home-health-card__big-number" id="health-score">${stats.score}</span>
                <span class="home-health-card__big-max">/ 100</span>
              </div>
              <div class="home-health-card__label" id="health-label">${getHealthLabel(stats.score)}</div>
            </div>
            <div class="home-health-gauge" id="home-health-gauge">
              <svg viewBox="0 0 100 100" class="home-health-gauge__svg">
                <defs>
                  <linearGradient id="homeGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2563EB" />
                    <stop offset="100%" stop-color="#7C3AED" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" stroke-width="9" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#homeGaugeGrad)" stroke-width="9"
                  stroke-linecap="round"
                  stroke-dasharray="251.2"
                  stroke-dashoffset="${251.2 - ((stats.score || 92) / 100) * 251.2}"
                  id="health-gauge-fill"
                  style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);" />
              </svg>
              <div class="home-health-gauge__percent" id="health-gauge-percent">${stats.score}%</div>
            </div>
          </div>

          <div class="home-health-card__stats">
            <div class="home-health-stat">
              <div>
                <div class="home-health-stat__value" id="stat-found">${stats.found}</div>
                <div class="home-health-stat__label">Issues Found</div>
              </div>
              <div class="home-health-stat__icon-badge home-health-stat__icon-badge--red">
                <i data-lucide="bug" style="width:14px;height:14px;"></i>
              </div>
            </div>
            <div class="home-health-stat">
              <div>
                <div class="home-health-stat__value" id="stat-fixed">${stats.fixed}</div>
                <div class="home-health-stat__label">Fixed</div>
              </div>
              <div class="home-health-stat__icon-badge home-health-stat__icon-badge--green">
                <i data-lucide="check" style="width:14px;height:14px;"></i>
              </div>
            </div>
            <div class="home-health-stat">
              <div>
                <div class="home-health-stat__value" id="stat-warnings">${stats.warnings}</div>
                <div class="home-health-stat__label">Warnings</div>
              </div>
              <div class="home-health-stat__icon-badge home-health-stat__icon-badge--amber">
                <i data-lucide="alert-triangle" style="width:14px;height:14px;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Sessions -->
      <div class="home-section">
        <div class="home-section__header">
          <h3 class="home-section__title">Recent Sessions</h3>
          <button class="home-section__link" onclick="window.location.hash='/records'">See all <i data-lucide="chevron-right" style="width:12px;height:12px;"></i></button>
        </div>
        <div class="home-sessions-list" id="home-sessions">
          ${renderSessions(sessions)}
        </div>
      </div>

      <!-- Ask SYBRAI Anything -->
      <div class="home-ask-bar">
        <div class="home-ask-bar__top">
          <div class="home-ask-bar__avatar">
            <i data-lucide="bot" style="width:20px;height:20px;color:var(--color-primary);"></i>
          </div>
          <div class="home-ask-bar__text">
            <div class="home-ask-bar__title">Ask SYBRAI anything</div>
            <div class="home-ask-bar__desc">Get instant help, explanations, or best practices.</div>
          </div>
          <button class="home-ask-bar__send" id="home-ask-send" aria-label="Ask AI" onclick="window.location.hash='/copilot'">
            <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
          </button>
        </div>
        <div class="home-ask-bar__suggestions">
          <button class="home-ask-chip" data-q="Why is my app crashing?">Why is my app crashing?</button>
          <button class="home-ask-chip" data-q="How to optimize this code?">How to optimize this code?</button>
          <button class="home-ask-chip" data-q="Explain this error">Explain this error</button>
        </div>
      </div>

      <!-- Bottom spacer for tab bar -->
      <div style="height:20px;"></div>
    </div>
  `;

  setTimeout(() => setupHomeInteractivity(screen), 50);
  return screen;
}

// ---- Render Sessions ----
function renderSessions(sessions) {
  if (!sessions || sessions.length === 0) {
    sessions = DEFAULT_SESSIONS;
  }
  return sessions.map(s => `
    <div class="home-session-item" onclick="window.location.hash='/records'">
      <div class="home-session-item__left">
        <div class="home-session-item__icon">
          <i data-lucide="${s.icon || 'file-text'}" style="width:16px;height:16px;"></i>
        </div>
        <div>
          <div class="home-session-item__title">${s.title}</div>
          <div class="home-session-item__time">${s.time}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="home-session-item__status home-session-item__status--${s.status}">
          • ${s.status === 'fixed' ? 'Fixed' : s.status === 'warning' ? 'Warning' : 'Error'}
        </span>
        <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--color-text-tertiary);flex-shrink:0;"></i>
      </div>
    </div>
  `).join('');
}

// ---- Interactivity ----
function setupHomeInteractivity(screen) {
  eventCleanups.forEach(fn => fn());
  eventCleanups = [];

  const bugInput = document.getElementById('home-bug-input');
  const startBtn = document.getElementById('home-start-analysis');
  const micBtn = document.getElementById('home-mic-btn');

  // Start Bug Analysis
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      const text = bugInput?.value?.trim();
      if (text) {
        window.location.hash = '/copilot';
        sessionStorage.setItem('sybrai_pending_query', text);
        showToast('Opening AI Copilot...', 'info', 1500);
      } else {
        startBtn.innerHTML = '<div class="rt-spinner"></div> <span>Scanning...</span>';
        startBtn.disabled = true;
        await startScan();
        refreshHealthStats();
        startBtn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> <span>Start Bug Analysis</span> <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>';
        startBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Tag buttons fill input
  document.querySelectorAll('.home-tag[data-tag]').forEach(tag => {
    tag.addEventListener('click', () => {
      if (bugInput) bugInput.value = tag.dataset.tag + ' ';
      bugInput?.focus();
    });
  });

  // Mic button
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        micBtn.classList.add('active');
        showToast('Listening... Speak your issue 🎙️', 'info', 2000);
        recognition.onresult = (e) => {
          const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
          if (bugInput) bugInput.value = transcript;
        };
        recognition.onend = () => micBtn.classList.remove('active');
        recognition.onerror = () => { micBtn.classList.remove('active'); showToast('Voice not available', 'warning', 1500); };
        recognition.start();
      } else {
        showToast('Speech recognition not supported', 'warning', 2000);
      }
    });
  }

  // Quick Actions
  document.getElementById('qa-analyze')?.addEventListener('click', () => {
    window.location.hash = '/analysis';
  });
  document.getElementById('qa-autofix')?.addEventListener('click', () => {
    window.location.hash = '/copilot';
  });
  document.getElementById('qa-explain')?.addEventListener('click', () => {
    window.location.hash = '/learning';
  });
  document.getElementById('qa-scan')?.addEventListener('click', () => {
    window.location.hash = '/analysis';
  });

  // Ask chips
  document.querySelectorAll('.home-ask-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      window.location.hash = '/copilot';
      sessionStorage.setItem('sybrai_pending_query', q);
    });
  });

  if (window.lucide) lucide.createIcons();
}

function refreshHealthStats() {
  const stats = getLiveStats();
  const scoreEl = document.getElementById('health-score');
  const labelEl = document.getElementById('health-label');
  const gaugePercent = document.getElementById('health-gauge-percent');
  const gaugeFill = document.getElementById('health-gauge-fill');
  const foundEl = document.getElementById('stat-found');
  const fixedEl = document.getElementById('stat-fixed');
  const warnEl = document.getElementById('stat-warnings');
  const sessionsEl = document.getElementById('home-sessions');

  if (scoreEl) scoreEl.textContent = stats.score;
  if (labelEl) labelEl.textContent = getHealthLabel(stats.score);
  if (gaugePercent) gaugePercent.textContent = `${stats.score}%`;
  if (gaugeFill) {
    const circ = 251.2;
    gaugeFill.setAttribute('stroke-dashoffset', circ - (stats.score / 100) * circ);
  }
  if (foundEl) foundEl.textContent = stats.found;
  if (fixedEl) fixedEl.textContent = stats.fixed;
  if (warnEl) warnEl.textContent = stats.warnings;

  if (sessionsEl) {
    sessionsEl.innerHTML = renderSessions(getScanHistory().slice(0, 3));
    if (window.lucide) lucide.createIcons();
  }
}

// ---- Helpers ----
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGaugeColor(score) {
  if (score >= 80) return '#6366F1';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function getHealthLabel(score) {
  if (score === 0) return 'Run a scan to check health';
  if (score >= 90) return 'Great! Your app is healthy.';
  if (score >= 75) return 'Good. Minor issues detected.';
  if (score >= 60) return 'Fair. Several issues need attention.';
  return 'Critical. Immediate fixes required.';
}
