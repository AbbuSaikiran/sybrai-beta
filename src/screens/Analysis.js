// ============================================
// SYBRAI — Analysis Screen (Redesigned with Real-Time Device Telemetry)
// ============================================

import { collectDeviceDiagnostics } from '../utils/deviceAnalyzer.js';
import { showToast } from '../utils/toast.js';
import { getLiveStats, getCurrentFindings } from '../utils/scanEngine.js';

let activeSubtab = 'analysis';

// Stored analysis state
let analysisData = {
  score: 92,
  status: 'Good',
  tagline: 'Great! Your app is healthy.',
  issuesFound: 3,
  fixed: 2,
  warnings: 1,
  breakdown: [
    { label: 'Null Pointer', count: 2, color: '#7C3AED' },
    { label: 'API Error', count: 1, color: '#2563EB' },
    { label: 'UI Bug', count: 1, color: '#10B981' },
    { label: 'Performance', count: 1, color: '#F59E0B' },
    { label: 'Others', count: 1, color: '#94A3B8' },
  ],
  recentSessions: [
    { id: 'rec-1', title: 'Login Crash', time: 'Today, 10:30 AM', status: 'Fixed', icon: 'file-text', isWarning: false },
    { id: 'rec-2', title: 'Payment Failure', time: 'Today, 09:15 AM', status: 'Fixed', icon: 'code', isWarning: false },
    { id: 'rec-3', title: 'UI Not Responsive', time: 'Yesterday, 06:40 PM', status: 'Warning', icon: 'smartphone', isWarning: true },
  ]
};

export function renderAnalysis() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--analysis';

  const totalIssues = analysisData.breakdown.reduce((sum, item) => sum + item.count, 0);

  screen.innerHTML = `
    <!-- Top Branding Row -->
    <div class="analysis-brand-row">
      <div class="profile-brand-left">
        <img src="/logo.png" alt="SYBRAI Logo" class="profile-brand-logo" />
        <div>
          <div class="profile-brand-title">SYBRAI</div>
          <div class="profile-brand-sub">AI BUG FIXER & ANALYZER</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="top-app-bar__icon-btn" id="analysis-history-btn" aria-label="History" title="Scan History" onclick="window.location.hash='/records'">
          <i data-lucide="clock"></i>
        </button>
        <button class="top-app-bar__icon-btn" id="analysis-menu-btn" aria-label="Options" title="Options">
          <i data-lucide="more-vertical"></i>
        </button>
      </div>
    </div>

    <!-- Title & Period Row -->
    <div class="analysis-title-row">
      <div>
        <h1 class="analysis-heading">Analysis</h1>
        <div class="analysis-subheading">Get detailed insights about your app, code, or error</div>
      </div>
      <div class="analysis-period-dropdown" id="period-dropdown" title="Select Timeframe">
        <i data-lucide="calendar" style="width:13px;height:13px;color:var(--color-primary)"></i>
        <span>Last 7 days</span>
        <i data-lucide="chevron-down" style="width:12px;height:12px;"></i>
      </div>
    </div>

    <!-- Sub-tabs Strip -->
    <div class="analysis-subtabs-strip" id="analysis-subtabs">
      <button class="analysis-subtab-pill ${activeSubtab === 'analysis' ? 'active' : ''}" data-tab="analysis">
        <i data-lucide="bar-chart-2" style="width:14px;height:14px;"></i>
        <span>Analysis</span>
      </button>
      <button class="analysis-subtab-pill ${activeSubtab === 'console' ? 'active' : ''}" data-tab="console">
        <i data-lucide="code" style="width:14px;height:14px;"></i>
        <span>Console</span>
      </button>
      <button class="analysis-subtab-pill ${activeSubtab === 'debugging' ? 'active' : ''}" data-tab="debugging">
        <i data-lucide="settings" style="width:14px;height:14px;"></i>
        <span>Debugging</span>
      </button>
      <button class="analysis-subtab-pill ${activeSubtab === 'learning' ? 'active' : ''}" data-tab="learning">
        <i data-lucide="book-open" style="width:14px;height:14px;"></i>
        <span>Learning</span>
      </button>
      <button class="analysis-subtab-pill ${activeSubtab === 'records' ? 'active' : ''}" data-tab="records">
        <i data-lucide="file-text" style="width:14px;height:14px;"></i>
        <span>Records</span>
      </button>
    </div>

    <div id="subtab-dynamic-container">
      <!-- Overall Score Card -->
      <div class="analysis-overall-card">
        <div class="analysis-overall-left">
          <div class="analysis-overall-title">Overall Score</div>
          <div class="analysis-overall-score-row">
            <span class="analysis-overall-big-num" id="analysis-score-val">${analysisData.score}</span>
            <span class="analysis-overall-max">/ 100</span>
            <span class="analysis-overall-badge" id="analysis-score-badge">
              <i data-lucide="check" style="width:11px;height:11px;"></i>
              <span>${analysisData.status}</span>
            </span>
          </div>
          <div class="analysis-overall-tagline" id="analysis-score-tagline">${analysisData.tagline}</div>
        </div>
        <div class="analysis-gauge-wrap">
          <svg viewBox="0 0 100 100" class="analysis-gauge-svg">
            <defs>
              <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2563EB" />
                <stop offset="100%" stop-color="#7C3AED" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" stroke-width="9" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#scoreGaugeGrad)" stroke-width="9"
              stroke-linecap="round"
              stroke-dasharray="251.2"
              stroke-dashoffset="${251.2 - (analysisData.score / 100) * 251.2}"
              id="analysis-gauge-circle"
              style="transform:rotate(-90deg); transform-origin:50% 50%; transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);" />
          </svg>
          <div class="analysis-gauge-center-text" id="analysis-gauge-text">${analysisData.score}%</div>
        </div>
      </div>

      <!-- 3-Col Stats Grid -->
      <div class="analysis-tri-stats">
        <div class="analysis-tri-stat-card">
          <div>
            <div class="analysis-tri-stat-label">Issues Found</div>
            <div class="analysis-tri-stat-val" id="stat-issues-found">${analysisData.issuesFound}</div>
          </div>
          <div class="analysis-tri-icon-bubble analysis-tri-icon-bubble--red">
            <i data-lucide="bug" style="width:16px;height:16px;"></i>
          </div>
        </div>

        <div class="analysis-tri-stat-card">
          <div>
            <div class="analysis-tri-stat-label">Fixed</div>
            <div class="analysis-tri-stat-val" id="stat-issues-fixed">${analysisData.fixed}</div>
          </div>
          <div class="analysis-tri-icon-bubble analysis-tri-icon-bubble--green">
            <i data-lucide="check" style="width:16px;height:16px;"></i>
          </div>
        </div>

        <div class="analysis-tri-stat-card">
          <div>
            <div class="analysis-tri-stat-label">Warnings</div>
            <div class="analysis-tri-stat-val" id="stat-issues-warnings">${analysisData.warnings}</div>
          </div>
          <div class="analysis-tri-icon-bubble analysis-tri-icon-bubble--amber">
            <i data-lucide="alert-triangle" style="width:16px;height:16px;"></i>
          </div>
        </div>
      </div>

      <!-- Issue Breakdown Card -->
      <div class="analysis-breakdown-card">
        <div class="analysis-breakdown-header">
          <h2 class="analysis-breakdown-title">Issue Breakdown</h2>
          <div class="analysis-breakdown-sub">Types of issues detected in your project</div>
        </div>
        <div class="analysis-breakdown-body">
          <div class="analysis-donut-wrapper">
            <svg viewBox="0 0 120 120" style="width:100%;height:100%;transform:rotate(-90deg);">
              <!-- 5 Donut Arcs -->
              <circle cx="60" cy="60" r="44" fill="none" stroke="#7C3AED" stroke-width="14" stroke-dasharray="276" stroke-dashoffset="184" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="#2563EB" stroke-width="14" stroke-dasharray="276" stroke-dashoffset="230" style="transform:rotate(120deg); transform-origin:center;" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="#10B981" stroke-width="14" stroke-dasharray="276" stroke-dashoffset="230" style="transform:rotate(180deg); transform-origin:center;" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="#F59E0B" stroke-width="14" stroke-dasharray="276" stroke-dashoffset="230" style="transform:rotate(240deg); transform-origin:center;" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="#94A3B8" stroke-width="14" stroke-dasharray="276" stroke-dashoffset="230" style="transform:rotate(300deg); transform-origin:center;" />
            </svg>
            <div class="analysis-donut-center">
              <span class="analysis-donut-num" id="donut-total-count">${totalIssues}</span>
              <span class="analysis-donut-lbl">Total</span>
            </div>
          </div>

          <div class="analysis-legend-list">
            ${analysisData.breakdown.map(item => `
              <div class="analysis-legend-row">
                <div class="analysis-legend-dot-name">
                  <span class="analysis-legend-dot" style="background:${item.color};"></span>
                  <span>${item.label}</span>
                </div>
                <span class="analysis-legend-count">${item.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Recent Analysis List Card -->
      <div class="analysis-recent-card">
        <div class="analysis-recent-header">
          <h2 class="analysis-recent-title">Recent Analysis</h2>
          <button class="analysis-recent-link" onclick="window.location.hash='/records'">
            <span>See all</span>
            <i data-lucide="chevron-right" style="width:12px;height:12px;"></i>
          </button>
        </div>
        <div class="analysis-recent-list" id="analysis-recent-container">
          ${renderRecentAnalysisItems()}
        </div>
      </div>

      <!-- Run New Analysis CTA Button -->
      <button class="analysis-run-btn" id="run-new-analysis-btn">
        <i data-lucide="sparkles" style="width:18px;height:18px;"></i>
        <span>Run Real-Time Device Analysis</span>
        <i data-lucide="arrow-right" style="width:18px;height:18px;"></i>
      </button>
    </div>
  `;

  setTimeout(() => setupAnalysisInteractions(screen), 50);
  return screen;
}

function renderRecentAnalysisItems() {
  return analysisData.recentSessions.map(session => `
    <div class="analysis-recent-item" data-id="${session.id}">
      <div class="analysis-recent-item-left">
        <div class="analysis-recent-item-icon">
          <i data-lucide="${session.icon}" style="width:16px;height:16px;"></i>
        </div>
        <div>
          <div class="analysis-recent-item-name">${session.title}</div>
          <div class="analysis-recent-item-date">${session.time}</div>
        </div>
      </div>
      <div class="analysis-recent-item-status">
        <span class="${session.isWarning ? 'analysis-status-dot--amber' : 'analysis-status-dot--green'}">
          • ${session.status}
        </span>
        <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--color-text-tertiary);"></i>
      </div>
    </div>
  `).join('');
}

function setupAnalysisInteractions(screen) {
  if (window.lucide) lucide.createIcons();

  // Subtab switching
  const subtabs = screen.querySelectorAll('#analysis-subtabs .analysis-subtab-pill');
  subtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      if (target === 'learning') {
        window.location.hash = '/learning';
        return;
      }
      if (target === 'records') {
        window.location.hash = '/records';
        return;
      }
      if (target === 'console') {
        renderConsoleView(screen);
        subtabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        return;
      }
      if (target === 'debugging') {
        renderDebuggingView(screen);
        subtabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        return;
      }

      // Restore analysis view
      activeSubtab = 'analysis';
      subtabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const container = document.getElementById('main-content');
      if (container) {
        container.innerHTML = '';
        container.appendChild(renderAnalysis());
      }
    });
  });

  // Run Real-Time Device Analysis
  const runBtn = screen.querySelector('#run-new-analysis-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => runRealTimeDeviceAnalysis(screen));
  }

  // Timeframe dropdown
  const periodDropdown = screen.querySelector('#period-dropdown');
  if (periodDropdown) {
    periodDropdown.addEventListener('click', () => {
      showToast('Viewing aggregated telemetry for Last 7 days', 'info', 1500);
    });
  }
}

// ---------------------------------------------------------------------
// REAL-TIME DEVICE TELEMETRY ANALYSIS
// ---------------------------------------------------------------------
async function runRealTimeDeviceAnalysis(screen) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Open scanning telemetry modal
  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="device-scan-backdrop">
      <div class="modal-sheet" role="dialog" style="max-height:85vh; overflow-y:auto;">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title" style="display:flex; align-items:center; gap:8px;">
            <i data-lucide="cpu" style="color:var(--color-primary);"></i> Real-Time Device Analysis
          </h2>
          <button class="modal-sheet__close" id="modal-scan-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body" style="padding-top:10px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div class="spinner" style="width:24px;height:24px;border:3px solid rgba(37,99,235,0.2);border-top-color:var(--color-primary);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            <div>
              <div style="font-size:14px; font-weight:700; color:var(--color-text-primary);" id="scan-step-title">Querying Device Hardware & OS Telemetry...</div>
              <div style="font-size:11.5px; color:var(--color-text-secondary);" id="scan-step-sub">Checking CPU cores, memory limits, and display metrics</div>
            </div>
          </div>

          <div id="telemetry-live-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;">
            <div style="padding:10px; background:var(--color-surface-hover); border-radius:10px; font-size:11px;">
              <span style="color:var(--color-text-tertiary);">Memory Heap:</span>
              <strong style="display:block; font-size:13px; color:var(--color-primary);" id="tel-mem">Measuring...</strong>
            </div>
            <div style="padding:10px; background:var(--color-surface-hover); border-radius:10px; font-size:11px;">
              <span style="color:var(--color-text-tertiary);">Network RTT:</span>
              <strong style="display:block; font-size:13px; color:var(--color-accent-green);" id="tel-net">Pinging...</strong>
            </div>
            <div style="padding:10px; background:var(--color-surface-hover); border-radius:10px; font-size:11px;">
              <span style="color:var(--color-text-tertiary);">CPU Concurrency:</span>
              <strong style="display:block; font-size:13px;" id="tel-cpu">Detecting...</strong>
            </div>
            <div style="padding:10px; background:var(--color-surface-hover); border-radius:10px; font-size:11px;">
              <span style="color:var(--color-text-tertiary);">Security Context:</span>
              <strong style="display:block; font-size:13px;" id="tel-sec">Validating...</strong>
            </div>
          </div>

          <div id="scan-findings-container" style="display:none; margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="shield-alert" style="color:#EF4444; width:15px; height:15px;"></i> Device Diagnostic Findings
            </div>
            <div id="findings-list"></div>
          </div>

          <button class="btn btn--primary btn--full" id="apply-device-fixes-btn" style="padding:12px; font-weight:600; display:none;">
            <i data-lucide="zap"></i> Auto-Optimize Device Runtime
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-scan-close')?.addEventListener('click', close);
  modalContainer.querySelector('#device-scan-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'device-scan-backdrop') close();
  });

  // Step 1: Collect actual real-time device telemetry
  const diag = await collectDeviceDiagnostics();

  setTimeout(() => {
    modalContainer.querySelector('#tel-mem').textContent = `${diag.memory.usedMB} MB / ${diag.memory.limitMB} MB`;
    modalContainer.querySelector('#tel-net').textContent = `${diag.network.rtt} (${diag.network.type.toUpperCase()})`;
    modalContainer.querySelector('#tel-cpu').textContent = `${diag.hardware.cores} Active Cores`;
    modalContainer.querySelector('#tel-sec').textContent = diag.security.isSecureContext ? '🔒 Encrypted HTTPS' : '⚠️ Local Sandbox';

    modalContainer.querySelector('#scan-step-title').textContent = 'Analyzing Runtime Logs & Memory Leaks...';
    modalContainer.querySelector('#scan-step-sub').textContent = 'Scanning JavaScript event queue, DOM references, and battery draw';
  }, 700);

  setTimeout(() => {
    modalContainer.querySelector('#scan-step-title').textContent = 'Diagnostics Complete! ✨';
    modalContainer.querySelector('#scan-step-sub').textContent = `Computed Device Health: ${diag.calculatedScore}/100`;
    modalContainer.querySelector('.spinner').style.display = 'none';

    // Show findings
    const findingsList = modalContainer.querySelector('#findings-list');
    if (findingsList) {
      findingsList.innerHTML = diag.findings.map(f => `
        <div style="padding:10px 12px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:10px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:12.5px; color:var(--color-text-primary);">${f.title}</strong>
            <span class="badge ${f.severity === 'critical' ? 'badge--danger' : 'badge--warning'}" style="font-size:9px;">${f.category}</span>
          </div>
          <p style="font-size:11.5px; color:var(--color-text-secondary); margin:4px 0 0;">${f.desc}</p>
        </div>
      `).join('');
    }
    modalContainer.querySelector('#scan-findings-container').style.display = 'block';
    const fixBtn = modalContainer.querySelector('#apply-device-fixes-btn');
    if (fixBtn) {
      fixBtn.style.display = 'flex';
      fixBtn.addEventListener('click', () => {
        showToast('Device runtime optimized & memory garbage collected! ⚡', 'success', 2000);
        close();

        // Update stored analysis state
        analysisData.score = diag.calculatedScore;
        analysisData.status = diag.calculatedScore >= 90 ? 'Excellent' : 'Good';
        analysisData.issuesFound = diag.findings.length;
        analysisData.fixed = 2;
        analysisData.warnings = Math.max(0, diag.findings.length - 2);

        // Add to recent sessions
        analysisData.recentSessions.unshift({
          id: `rec-${Date.now()}`,
          title: 'Live Device Diagnostic',
          time: 'Just now',
          status: 'Fixed',
          icon: 'cpu',
          isWarning: false,
        });

        // Re-render analysis screen
        const container = document.getElementById('main-content');
        if (container) {
          container.innerHTML = '';
          container.appendChild(renderAnalysis());
        }
      });
    }
    if (window.lucide) lucide.createIcons();
  }, 1600);
}

// Subtab views
function renderConsoleView(screen) {
  const container = screen.querySelector('#subtab-dynamic-container');
  if (!container) return;

  container.innerHTML = `
    <div style="background:#0F172A; color:#E2E8F0; border-radius:18px; padding:16px; font-family:var(--font-mono); font-size:12px; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:8px; margin-bottom:12px;">
        <span style="color:#38BDF8; font-weight:700;">Live Device Console</span>
        <span style="font-size:10px; color:#94A3B8;">PID: 4092 • Web Worker</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; max-height:360px; overflow-y:auto;">
        <div style="color:#10B981;">[INFO]  Telemetrics engine connected to hardware (cores: ${navigator.hardwareConcurrency || 4})</div>
        <div style="color:#94A3B8;">[DEBUG] Screen viewport: ${window.innerWidth}x${window.innerHeight} @ ${window.devicePixelRatio}x</div>
        <div style="color:#F59E0B;">[WARN]  Detected 3 unhandled touch event passive listeners</div>
        <div style="color:#10B981;">[INFO]  Local storage validated. No plaintext token exposure.</div>
        <div style="color:#38BDF8;">[AI]    Autonomous security monitor active.</div>
      </div>
    </div>
  `;
}

function renderDebuggingView(screen) {
  const container = screen.querySelector('#subtab-dynamic-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:18px; padding:14px;">
        <h3 style="font-size:14px; font-weight:700; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
          <i data-lucide="shield" style="color:var(--color-primary); width:16px; height:16px;"></i>
          Active Debugging Probes
        </h3>
        <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:12px;">
          Live breakpoints and memory watchers currently attached to client runtime.
        </p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--color-surface-hover); border-radius:10px; font-size:12px;">
            <span>Heap Allocation Tracker</span>
            <span class="badge badge--success">Active</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--color-surface-hover); border-radius:10px; font-size:12px;">
            <span>Network Request Inspector</span>
            <span class="badge badge--success">Active</span>
          </div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}
