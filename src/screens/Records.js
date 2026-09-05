// ============================================
// SYBRAI — Records Screen
// ============================================

import { sessions } from '../data/mockData.js';

export function renderRecords() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--records';

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <button class="top-app-bar__icon-btn" aria-label="Menu">
          <i data-lucide="menu"></i>
        </button>
        <h1 class="top-app-bar__title">Records</h1>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" aria-label="Search">
          <i data-lucide="search"></i>
        </button>
      </div>
    </div>

    <div class="records-content">
      <div class="filter-chips">
        <button class="filter-chip active" data-filter="all">All</button>
        <button class="filter-chip" data-filter="fixed">Fixed</button>
        <button class="filter-chip" data-filter="warning">Warnings</button>
        <button class="filter-chip" data-filter="error">Errors</button>
      </div>

      <div class="session-list" id="records-list">
        ${renderRecordsList(sessions)}
      </div>
    </div>
  `;

  setTimeout(() => setupRecordsFilter(), 50);
  return screen;
}

function renderRecordsList(items) {
  if (items.length === 0) {
    return `
      <div class="empty-state">
        <i data-lucide="folder-open" class="empty-state__icon"></i>
        <div class="empty-state__title">No records found</div>
        <div class="empty-state__desc">Records matching your filter will appear here.</div>
      </div>
    `;
  }
  return items.map(s => `
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
  `).join('');
}

function setupRecordsFilter() {
  const chips = document.querySelectorAll('.filter-chip');
  const list = document.getElementById('records-list');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);
      list.innerHTML = renderRecordsList(filtered);
      if (window.lucide) lucide.createIcons();
    });
  });
}
