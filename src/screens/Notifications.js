// ============================================
// SYBRAI — Notifications Screen
// ============================================

import { notifications } from '../data/mockData.js';
import { showToast } from '../utils/toast.js';

export function renderNotifications() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--notifications';

  const unreadCount = notifications.filter(n => n.unread).length;

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <button class="top-app-bar__icon-btn" aria-label="Back" onclick="history.back()">
          <i data-lucide="arrow-left"></i>
        </button>
        <h1 class="top-app-bar__title">Notifications</h1>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" id="mark-read-btn" aria-label="Mark all as read" ${unreadCount === 0 ? 'style="opacity:0.4"' : ''}>
          <i data-lucide="check-check"></i>
        </button>
      </div>
    </div>

    <div class="notifications-content">
      ${unreadCount > 0 ? `
        <div class="notifications-header">
          <span class="type-caption text-secondary">${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}</span>
        </div>
      ` : ''}

      ${notifications.map(n => {
        const iconColor = n.type === 'success' ? 'var(--color-accent-green)' :
                          n.type === 'warning' ? 'var(--color-warning)' :
                          'var(--color-primary)';
        return `
          <div class="notification-item ${n.unread ? 'unread' : ''}">
            <div class="notification-item__icon" style="color:${iconColor}">
              <i data-lucide="${n.icon}"></i>
            </div>
            <div class="notification-item__content">
              <div class="notification-item__title">${n.title}</div>
              <div class="notification-item__desc">${n.desc}</div>
              <div class="notification-item__time">${n.time}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  setTimeout(() => {
    const markBtn = document.getElementById('mark-read-btn');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        document.querySelectorAll('.notification-item.unread').forEach(el => {
          el.classList.remove('unread');
        });
        showToast('All notifications marked as read', 'success', 2000);
      });
    }
  }, 50);

  return screen;
}
