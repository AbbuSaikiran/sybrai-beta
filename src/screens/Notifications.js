// ============================================
// SYBRAI — Mobile Notification Center
// Real-time AI Alerts & Device Push Notifications
// ============================================

import {
  getNotifications,
  saveNotifications,
  addNotification,
  markAllAsRead,
  clearAllNotifications,
  getNotificationPermission,
  requestNotificationPermission,
  sendDeviceNotification,
  subscribeNotifications,
} from '../utils/notificationService.js';
import { generateAiAlert, getAiConfig } from '../utils/aiService.js';
import { showToast } from '../utils/toast.js';

let activeFilter = 'all';

export function renderNotifications() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--notifications';

  let notifications = getNotifications();
  const permission = getNotificationPermission();
  const aiConfig = getAiConfig();

  function buildHtml() {
    notifications = getNotifications();
    const unreadCount = notifications.filter(n => n.unread).length;

    let filtered = notifications;
    if (activeFilter === 'unread') filtered = notifications.filter(n => n.unread);
    else if (activeFilter === 'warning') filtered = notifications.filter(n => n.type === 'warning');
    else if (activeFilter === 'error') filtered = notifications.filter(n => n.type === 'error' || n.type === 'critical');

    return `
      <div class="top-app-bar">
        <div class="top-app-bar__leading">
          <button class="top-app-bar__icon-btn" aria-label="Back" onclick="history.back()">
            <i data-lucide="arrow-left"></i>
          </button>
          <h1 class="top-app-bar__title">Notifications</h1>
        </div>
        <div class="top-app-bar__trailing">
          <button class="top-app-bar__icon-btn" id="mark-read-btn" title="Mark all read" aria-label="Mark all as read" ${unreadCount === 0 ? 'style="opacity:0.4"' : ''}>
            <i data-lucide="check-check"></i>
          </button>
          <button class="top-app-bar__icon-btn" id="clear-all-btn" title="Clear all" aria-label="Clear all notifications">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>

      <div class="notifications-content" style="padding-bottom: 90px;">
        <!-- Mobile Device Push Permission Banner -->
        <div class="notification-permission-card ${permission === 'granted' ? 'granted' : ''}" id="perm-banner">
          <div class="notification-permission-card__icon">
            <i data-lucide="${permission === 'granted' ? 'bell-ring' : 'bell-off'}"></i>
          </div>
          <div class="notification-permission-card__content">
            <div class="notification-permission-card__title">
              ${permission === 'granted' ? 'Mobile Push Notifications Active' : 'Enable Mobile Push Alerts'}
            </div>
            <div class="notification-permission-card__desc">
              ${permission === 'granted'
                ? `Receiving live AI alerts via ${aiConfig.model || 'Gemini'} on your device`
                : 'Get instant heads-up alerts & vibrations when AI detects critical bugs on mobile'}
            </div>
          </div>
          ${permission !== 'granted' ? `
            <button class="btn btn--primary btn--sm" id="enable-perm-btn">
              Enable
            </button>
          ` : `
            <span class="badge badge--success" style="font-size: 11px;">Active</span>
          `}
        </div>

        <!-- AI Actions Toolbar -->
        <div class="notification-actions-toolbar">
          <button class="btn btn--secondary btn--full btn--ai-scan" id="ai-scan-btn">
            <i data-lucide="sparkles"></i>
            <span>AI Scan & Trigger Mobile Alert</span>
          </button>
        </div>

        <!-- Filter Chips -->
        <div class="filter-chips-row">
          <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            All (${notifications.length})
          </button>
          <button class="filter-chip ${activeFilter === 'unread' ? 'active' : ''}" data-filter="unread">
            Unread (${unreadCount})
          </button>
          <button class="filter-chip ${activeFilter === 'warning' ? 'active' : ''}" data-filter="warning">
            Warnings
          </button>
          <button class="filter-chip ${activeFilter === 'error' ? 'active' : ''}" data-filter="error">
            Critical
          </button>
        </div>

        <!-- Notification List -->
        <div class="notifications-list" id="notif-list">
          ${filtered.length === 0 ? `
            <div class="notifications-empty">
              <div class="notifications-empty__icon">
                <i data-lucide="bell" style="width:40px;height:40px;"></i>
              </div>
              <div class="notifications-empty__title">All caught up!</div>
              <div class="notifications-empty__desc">No notifications matching this filter. Tap "AI Scan" above to generate a new live alert.</div>
            </div>
          ` : filtered.map(n => {
            const iconColor = n.type === 'success' ? 'var(--color-accent-green)' :
                              n.type === 'error' || n.type === 'critical' ? 'var(--color-destructive, #EF4444)' :
                              n.type === 'warning' ? 'var(--color-warning)' :
                              'var(--color-primary)';
            return `
              <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="notification-item__icon" style="color:${iconColor}; background: ${n.unread ? 'rgba(37, 99, 235, 0.08)' : 'var(--color-bg-subtle)'};">
                  <i data-lucide="${n.icon || 'alert-triangle'}"></i>
                </div>
                <div class="notification-item__content">
                  <div class="notification-item__header">
                    <span class="notification-item__title">${n.title}</span>
                    ${n.isAiGenerated ? '<span class="ai-badge"><i data-lucide="sparkles"></i> AI</span>' : ''}
                  </div>
                  <div class="notification-item__desc">${n.desc}</div>
                  ${n.file ? `<div class="notification-item__meta"><i data-lucide="file-code"></i> <code>${n.file}</code></div>` : ''}
                  <div class="notification-item__footer">
                    <span class="notification-item__time">${n.time}</span>
                    ${n.fixSuggestion ? `
                      <button class="notification-item__quick-fix" data-fix="${encodeURIComponent(n.fixSuggestion)}">
                        <i data-lucide="wrench"></i> View Fix
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  screen.innerHTML = buildHtml();

  // Attach handlers
  function bindEvents() {
    // Enable push permission
    const enableBtn = screen.querySelector('#enable-perm-btn');
    if (enableBtn) {
      enableBtn.addEventListener('click', async () => {
        const result = await requestNotificationPermission();
        if (result === 'granted') {
          showToast('Mobile notifications enabled! 🔔', 'success', 2500);
          await sendDeviceNotification({
            title: 'SYBRAI Notifications Active',
            body: 'You will now receive AI bug alerts directly on your device.',
          });
        } else if (result === 'denied') {
          showToast('Notifications blocked in browser settings', 'error', 3000);
        }
        screen.innerHTML = buildHtml();
        bindEvents();
        if (window.lucide) lucide.createIcons();
      });
    }

    // AI Scan & Trigger Alert Button
    const aiScanBtn = screen.querySelector('#ai-scan-btn');
    if (aiScanBtn) {
      aiScanBtn.addEventListener('click', async () => {
        aiScanBtn.disabled = true;
        aiScanBtn.innerHTML = `<div class="spinner-sm"></div> <span>Scanning with ${aiConfig.model || 'AI'}...</span>`;

        try {
          const alertData = await generateAiAlert();
          await addNotification(alertData, true);

          showToast(`New ${alertData.type.toUpperCase()} alert triggered!`, 'warning', 2500);
        } catch (err) {
          showToast('Failed to generate alert: ' + err.message, 'error', 3000);
        } finally {
          screen.innerHTML = buildHtml();
          bindEvents();
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    // Mark all as read
    const markBtn = screen.querySelector('#mark-read-btn');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        markAllAsRead();
        showToast('All marked as read', 'success', 1500);
        screen.innerHTML = buildHtml();
        bindEvents();
        if (window.lucide) lucide.createIcons();
      });
    }

    // Clear all
    const clearBtn = screen.querySelector('#clear-all-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all notifications?')) {
          clearAllNotifications();
          showToast('Notifications cleared', 'default', 1500);
          screen.innerHTML = buildHtml();
          bindEvents();
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    // Filter Chips
    screen.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        screen.innerHTML = buildHtml();
        bindEvents();
        if (window.lucide) lucide.createIcons();
      });
    });

    // View Fix quick action
    screen.querySelectorAll('.notification-item__quick-fix').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fix = decodeURIComponent(btn.dataset.fix);
        showFixModal(fix);
      });
    });

    // Item click: toggle unread
    screen.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = Number(item.dataset.id);
        const list = getNotifications();
        const found = list.find(n => n.id === id);
        if (found && found.unread) {
          found.unread = false;
          saveNotifications(list);
          item.classList.remove('unread');
        }
      });
    });
  }

  function showFixModal(fixContent) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-backdrop active" id="fix-modal-backdrop">
        <div class="modal-sheet" role="dialog" aria-labelledby="modal-fix-title">
          <div class="modal-sheet__handle"></div>
          <div class="modal-sheet__header">
            <h2 class="modal-sheet__title" id="modal-fix-title">
              <i data-lucide="sparkles" style="color:var(--color-primary)"></i> AI Recommended Fix
            </h2>
            <button class="modal-sheet__close" id="modal-close-btn" aria-label="Close">
              <i data-lucide="x"></i>
            </button>
          </div>
          <div class="modal-sheet__body">
            <div class="fix-solution-box">
              <code>${fixContent}</code>
            </div>
            <p style="font-size: var(--type-caption-size); color: var(--color-text-secondary); margin-top: var(--space-sm);">
              This fix was generated by the active SYBRAI AI Model (${aiConfig.model || 'Gemini'}).
            </p>
          </div>
          <div class="modal-sheet__footer">
            <button class="btn btn--primary btn--full" id="apply-fix-btn">
              <i data-lucide="check"></i> Apply Fix & Close
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    const closeModal = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#fix-modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'fix-modal-backdrop') closeModal();
    });
    modalContainer.querySelector('#apply-fix-btn')?.addEventListener('click', () => {
      showToast('Fix applied successfully! 🎉', 'success', 2000);
      closeModal();
    });
  }

  setTimeout(() => {
    bindEvents();
    if (window.lucide) lucide.createIcons();
  }, 30);

  return screen;
}
