// ============================================
// SYBRAI — Analysis Screen (with sub-tabs)
// ============================================

import { analysisData, sessions, consoleLines, debugSections, learningResources } from '../data/mockData.js';

let activeTab = 'analysis';

export function renderAnalysis() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--analysis';

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <button class="top-app-bar__icon-btn" aria-label="Menu">
          <i data-lucide="menu"></i>
        </button>
        <h1 class="top-app-bar__title">Analysis</h1>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" aria-label="Filter">
          <i data-lucide="sliders-horizontal"></i>
        </button>
      </div>
    </div>

    <div class="horizontal-tab-strip" id="analysis-tabs">
      <button class="tab-pill active" data-tab="analysis">
        <i data-lucide="bar-chart-2" class="tab-pill__icon"></i>
        Analysis
      </button>
      <button class="tab-pill" data-tab="console">
        <i data-lucide="terminal" class="tab-pill__icon"></i>
        Console
      </button>
      <button class="tab-pill" data-tab="debugging">
        <i data-lucide="bug" class="tab-pill__icon"></i>
        Debugging
      </button>
      <button class="tab-pill" data-tab="learning">
        <i data-lucide="book-open" class="tab-pill__icon"></i>
        Learning
      </button>
      <button class="tab-pill" data-tab="records">
        <i data-lucide="folder" class="tab-pill__icon"></i>
        Records
      </button>
    </div>

    <div class="analysis-content" id="analysis-content">
      ${renderAnalysisTab()}
    </div>
  `;

  setTimeout(() => setupAnalysisTabs(), 50);
  return screen;
}

function setupAnalysisTabs() {
  const tabs = document.querySelectorAll('#analysis-tabs .tab-pill');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      const content = document.getElementById('analysis-content');
      if (content) {
        content.innerHTML = getTabContent(activeTab);
        if (window.lucide) lucide.createIcons();
        if (activeTab === 'debugging') setupDebugSections();
        if (activeTab === 'analysis') animateGauge();
      }
    });
  });
  animateGauge();
}

function getTabContent(tab) {
  switch(tab) {
    case 'analysis': return renderAnalysisTab();
    case 'console': return renderConsoleTab();
    case 'debugging': return renderDebuggingTab();
    case 'learning': return renderLearningTab();
    case 'records': return renderRecordsTab();
    default: return renderAnalysisTab();
  }
}

function renderAnalysisTab() {
  const { score, maxScore, label, stats } = analysisData;
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (score / maxScore) * circumference;
  const gaugeColor = score >= 80 ? 'var(--color-accent-green)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

  return `
    <div class="risk-gauge">
      <div class="risk-gauge__circle">
        <svg class="risk-gauge__svg" viewBox="0 0 160 160">
          <circle class="risk-gauge__track" cx="80" cy="80" r="65" />
          <circle class="risk-gauge__fill" id="gauge-fill" cx="80" cy="80" r="65"
            stroke="${gaugeColor}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}" />
        </svg>
        <div class="risk-gauge__value">
          <span class="risk-gauge__score" id="gauge-score">0</span>
          <span class="risk-gauge__max"> /${maxScore}</span>
        </div>
      </div>
      <div class="risk-gauge__label">${label}</div>
    </div>

    <div class="stat-cards">
      <div class="stat-card stat-card--info">
        <span class="stat-card__value">${stats.found}</span>
        <span class="stat-card__label">Issues Found</span>
      </div>
      <div class="stat-card stat-card--success">
        <span class="stat-card__value">${stats.fixed}</span>
        <span class="stat-card__label">Fixed</span>
      </div>
      <div class="stat-card stat-card--warning">
        <span class="stat-card__value">${stats.warnings}</span>
        <span class="stat-card__label">Warnings</span>
      </div>
    </div>

    <div class="section-heading" style="margin-top:var(--space-lg)">Recent Sessions</div>
    <div class="session-list">
      ${sessions.slice(0, 3).map(s => `
        <div class="session-item" role="button" tabindex="0">
          <div class="session-item__dot session-item__dot--${s.dot}"></div>
          <div class="session-item__content">
            <div class="session-item__title">${s.title}</div>
            <div class="session-item__time">${s.time}</div>
          </div>
          <span class="session-item__badge session-item__badge--${s.status}">
            ${s.status === 'fixed' ? '✓ Fixed' : s.status === 'warning' ? '⚠ Warning' : '✗ Error'}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

function animateGauge() {
  const fill = document.getElementById('gauge-fill');
  const scoreEl = document.getElementById('gauge-score');
  if (!fill || !scoreEl) return;

  const { score, maxScore } = analysisData;
  const circumference = 2 * Math.PI * 65;
  const target = circumference - (score / maxScore) * circumference;

  setTimeout(() => {
    fill.style.strokeDashoffset = target;
    // Animate counter
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      scoreEl.textContent = current;
    }, 20);
  }, 300);
}

function renderConsoleTab() {
  return `
    <div class="console-output">
      ${consoleLines.map(line => `
        <div class="console-line console-line--${line.type}">${line.text}</div>
      `).join('')}
    </div>
  `;
}

function renderDebuggingTab() {
  return `
    ${debugSections.map((section, i) => `
      <div class="debug-section" id="debug-${i}">
        <div class="debug-section__header" data-index="${i}">
          <div class="debug-section__title">
            <i data-lucide="${section.icon}" style="width:18px;height:18px;color:${section.status === 'pass' ? 'var(--color-accent-green)' : 'var(--color-danger)'}"></i>
            ${section.title}
          </div>
          <span class="debug-section__status debug-section__status--${section.status}">
            ${section.status === 'pass' ? 'PASSED' : 'FAILED'}
          </span>
        </div>
        <div class="debug-section__body">${section.details}</div>
      </div>
    `).join('')}
  `;
}

function setupDebugSections() {
  document.querySelectorAll('.debug-section__header').forEach(header => {
    header.addEventListener('click', () => {
      const idx = header.dataset.index;
      document.getElementById(`debug-${idx}`).classList.toggle('open');
    });
  });
}

function renderLearningTab() {
  return `
    <div class="learning-cards">
      ${learningResources.map(res => `
        <div class="learning-card" role="button" tabindex="0">
          <div class="learning-card__icon">
            <i data-lucide="${res.icon}"></i>
          </div>
          <div class="learning-card__content">
            <div class="learning-card__title">${res.title}</div>
            <div class="learning-card__desc">${res.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRecordsTab() {
  return `
    <div class="filter-chips">
      <button class="filter-chip active">All</button>
      <button class="filter-chip">Fixed</button>
      <button class="filter-chip">Warnings</button>
      <button class="filter-chip">Errors</button>
    </div>
    <div class="session-list">
      ${sessions.map(s => `
        <div class="session-item" role="button" tabindex="0">
          <div class="session-item__dot session-item__dot--${s.dot}"></div>
          <div class="session-item__content">
            <div class="session-item__title">${s.title}</div>
            <div class="session-item__time">${s.time}</div>
          </div>
          <span class="session-item__badge session-item__badge--${s.status}">
            ${s.status === 'fixed' ? '✓ Fixed' : s.status === 'warning' ? '⚠ Warning' : '✗ Error'}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}
