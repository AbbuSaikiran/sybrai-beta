// ============================================
// SYBRAI — Profile & Settings Screen
// ============================================

import { userProfile } from '../data/mockData.js';
import { toggleTheme, getTheme } from '../utils/theme.js';
import { showToast } from '../utils/toast.js';

export function renderProfile() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--profile';
  const isDark = getTheme() === 'dark';

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <h1 class="top-app-bar__title">Profile</h1>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" aria-label="Settings">
          <i data-lucide="settings"></i>
        </button>
      </div>
    </div>

    <div class="profile-header">
      <div class="profile-avatar">${userProfile.initials}</div>
      <div class="profile-info">
        <div class="profile-info__name">${userProfile.name}</div>
        <div class="profile-info__email">${userProfile.email}</div>
        <span class="profile-badge">
          <i data-lucide="crown" style="width:12px;height:12px"></i>
          ${userProfile.badge}
        </span>
      </div>
    </div>

    <div class="profile-content">
      <div class="settings-list">
        <div class="settings-item" role="button" tabindex="0">
          <i data-lucide="user" class="settings-item__icon"></i>
          <span class="settings-item__label">Account Settings</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>
        <div class="settings-item" role="button" tabindex="0" id="theme-setting">
          <i data-lucide="palette" class="settings-item__icon"></i>
          <span class="settings-item__label">App Preferences</span>
          <div class="theme-toggle" id="theme-toggle" role="switch" aria-label="Toggle dark mode" aria-checked="${isDark}">
            <div class="theme-toggle__thumb">
              <i data-lucide="${isDark ? 'moon' : 'sun'}" style="width:12px;height:12px"></i>
            </div>
          </div>
        </div>
        <div class="settings-item" role="button" tabindex="0">
          <i data-lucide="mic" class="settings-item__icon"></i>
          <span class="settings-item__label">Voice Settings</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>
        <div class="settings-item" role="button" tabindex="0" onclick="window.location.hash='/notifications'">
          <i data-lucide="bell" class="settings-item__icon"></i>
          <span class="settings-item__label">Notifications</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>
        <div class="settings-item" role="button" tabindex="0">
          <i data-lucide="shield" class="settings-item__icon"></i>
          <span class="settings-item__label">Privacy & Security</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>
        <div class="settings-item" role="button" tabindex="0">
          <i data-lucide="help-circle" class="settings-item__icon"></i>
          <span class="settings-item__label">Help & Support</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>
        <div class="settings-item" role="button" tabindex="0">
          <i data-lucide="info" class="settings-item__icon"></i>
          <span class="settings-item__label">About SYBRAI</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>
      </div>

      <div style="padding: var(--space-lg) 0 var(--space-sm);">
        <button class="btn btn--destructive btn--full" id="logout-btn">Logout</button>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); padding: var(--space-sm) 0 var(--space-xl); opacity: 0.75;">
        <img src="/logo.png" alt="SYBRAI" style="width: 28px; height: 28px; object-fit: contain;" />
        <span style="font-size: var(--type-caption-size); color: var(--color-text-tertiary);">SYBRAI v1.0.0</span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const newTheme = toggleTheme();
        showToast(`Switched to ${newTheme} mode`, 'success', 2000);
        // Re-render the toggle icon
        const thumb = themeToggle.querySelector('.theme-toggle__thumb');
        if (thumb) {
          thumb.innerHTML = `<i data-lucide="${newTheme === 'dark' ? 'moon' : 'sun'}" style="width:12px;height:12px"></i>`;
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        showToast('Logged out successfully', 'success');
        setTimeout(() => { window.location.hash = '/'; }, 1500);
      });
    }
  }, 50);

  return screen;
}
