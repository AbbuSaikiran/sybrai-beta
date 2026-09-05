// ============================================
// SYBRAI — Profile Screen (Redesigned to Mockup)
// Name: Abbu Saikiran | Email: info@sybrai.com
// ============================================

import { userProfile } from '../data/mockData.js';
import { toggleTheme, getTheme } from '../utils/theme.js';
import { showToast } from '../utils/toast.js';
import { getAiConfig, saveAiConfig } from '../utils/aiService.js';

// Local storage helper for persisting user profile edits
function getSavedProfile() {
  try {
    const saved = localStorage.getItem('sybrai_user_profile');
    if (saved) {
      return { ...userProfile, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return { ...userProfile };
}

function saveLocalProfile(profileData) {
  try {
    localStorage.setItem('sybrai_user_profile', JSON.stringify(profileData));
  } catch (e) {}
}

export function renderProfile() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--profile';

  const profile = getSavedProfile();
  const isDark = getTheme() === 'dark';
  const aiConfig = getAiConfig();

  screen.innerHTML = `
    <!-- Top Branding Row -->
    <div class="profile-brand-row">
      <div class="profile-brand-left">
        <img src="/logo.png" alt="SYBRAI Logo" class="profile-brand-logo" />
        <div>
          <div class="profile-brand-title">SYBRAI</div>
          <div class="profile-brand-sub">AI BUG FIXER & ANALYZER</div>
        </div>
      </div>
      <button class="profile-notif-btn" id="profile-notif-btn" aria-label="Notifications" title="Notifications">
        <i data-lucide="bell"></i>
        <span class="profile-notif-dot"></span>
      </button>
    </div>

    <!-- Title & Watermark Row -->
    <div class="profile-title-row">
      <h1 class="profile-heading">Profile</h1>
      <div class="profile-subheading">Manage your account and preferences</div>
      <div class="profile-watermark">
        SECURE<br>CODE<br>BETTER<br>TOMORROW
      </div>
    </div>

    <!-- User Profile Card -->
    <div class="profile-user-card">
      <div class="profile-avatar-wrapper">
        <img src="${profile.avatar || '/avatar.jpg'}" alt="${profile.name}" class="profile-avatar-img" id="profile-avatar-display" onerror="this.src='/logo.png'" />
        <button class="profile-avatar-camera" id="profile-avatar-cam-btn" title="Change Avatar" aria-label="Change Avatar">
          <i data-lucide="camera"></i>
        </button>
      </div>
      <div class="profile-user-details">
        <div class="profile-user-header">
          <h2 class="profile-user-name" id="profile-display-name">${profile.name}</h2>
          <button class="profile-edit-btn" id="profile-edit-btn">
            <i data-lucide="edit-3"></i>
            <span>Edit Profile</span>
          </button>
        </div>
        <div class="profile-user-email" id="profile-display-email">${profile.email}</div>
        <div>
          <span class="profile-user-badge">
            <i data-lucide="crown"></i>
            <span>${profile.badge || 'Pro User'}</span>
          </span>
        </div>
        <div class="profile-user-tagline" id="profile-display-tagline">
          ${profile.tagline || 'Building secure apps with AI 🚀'}
        </div>
      </div>
    </div>

    <!-- Stats Row Card -->
    <div class="profile-stats-card">
      <div class="profile-stat-col">
        <span class="profile-stat-val profile-stat-val--blue">${profile.stats?.analyses || 24}</span>
        <span class="profile-stat-lbl">Analyses</span>
      </div>
      <div class="profile-stat-col">
        <span class="profile-stat-val profile-stat-val--green">${profile.stats?.issuesFixed || 18}</span>
        <span class="profile-stat-lbl">Issues Fixed</span>
      </div>
      <div class="profile-stat-col">
        <span class="profile-stat-val profile-stat-val--purple">${profile.stats?.projects || 5}</span>
        <span class="profile-stat-lbl">Projects</span>
      </div>
      <div class="profile-stat-col">
        <span class="profile-stat-val profile-stat-val--cyan">${profile.stats?.avgScore || 92}</span>
        <span class="profile-stat-lbl">Avg. Score</span>
      </div>
    </div>

    <!-- Menu Group Card -->
    <div class="profile-menu-card">
      <!-- 1. Account Settings -->
      <div class="profile-menu-item" id="item-account-settings" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--indigo">
          <i data-lucide="user"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">Account Settings</div>
          <div class="profile-menu-sub">Update your personal information</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>

      <!-- 2. App Preferences (Theme & AI Model) -->
      <div class="profile-menu-item" id="item-app-preferences" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--purple">
          <i data-lucide="settings"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">
            <span>App Preferences</span>
            <span class="badge ${aiConfig.isConfigured ? 'badge--success' : 'badge--warning'}" style="font-size:9px; padding: 1px 6px;">
              ${aiConfig.model.split('-')[0]}
            </span>
          </div>
          <div class="profile-menu-sub">Theme, AI model, language and app behavior</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>

      <!-- 3. Voice Settings -->
      <div class="profile-menu-item" id="item-voice-settings" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--sky">
          <i data-lucide="mic"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">Voice Settings</div>
          <div class="profile-menu-sub">Configure voice input and output</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>

      <!-- 4. Notifications -->
      <div class="profile-menu-item" id="item-notifications" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--amber">
          <i data-lucide="bell"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">Notifications</div>
          <div class="profile-menu-sub">Manage your alerts and updates</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>

      <!-- 5. Privacy & Security -->
      <div class="profile-menu-item" id="item-privacy-security" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--emerald">
          <i data-lucide="shield-check"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">Privacy & Security</div>
          <div class="profile-menu-sub">Control your data and security options</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>

      <!-- 6. Help & Support -->
      <div class="profile-menu-item" id="item-help-support" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--rose">
          <i data-lucide="help-circle"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">Help & Support</div>
          <div class="profile-menu-sub">Get help or contact our team</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>

      <!-- 7. About SYBRAI -->
      <div class="profile-menu-item" id="item-about-sybrai" role="button" tabindex="0">
        <div class="profile-menu-icon-wrap profile-menu-icon-wrap--cyan">
          <i data-lucide="info"></i>
        </div>
        <div class="profile-menu-content">
          <div class="profile-menu-title">About SYBRAI</div>
          <div class="profile-menu-sub">Version 1.0.0 • Learn more</div>
        </div>
        <div class="profile-menu-chevron">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>
    </div>

    <!-- Red Logout Button -->
    <button class="profile-logout-btn" id="profile-logout-btn">
      <i data-lucide="log-out"></i>
      <span>Logout</span>
    </button>
  `;

  // Attach Event Handlers
  setTimeout(() => {
    // Notification button
    const notifBtn = screen.querySelector('#profile-notif-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        window.location.hash = '/notifications';
      });
    }

    // Edit Profile Modal
    const editBtn = screen.querySelector('#profile-edit-btn');
    const avatarCamBtn = screen.querySelector('#profile-avatar-cam-btn');
    const accountSettingsItem = screen.querySelector('#item-account-settings');

    if (editBtn) editBtn.addEventListener('click', openEditProfileModal);
    if (avatarCamBtn) avatarCamBtn.addEventListener('click', openEditProfileModal);
    if (accountSettingsItem) accountSettingsItem.addEventListener('click', openEditProfileModal);

    // App Preferences (Theme + AI Config)
    const appPrefsItem = screen.querySelector('#item-app-preferences');
    if (appPrefsItem) {
      appPrefsItem.addEventListener('click', openAppPreferencesModal);
    }

    // Voice Settings
    const voiceSettingsItem = screen.querySelector('#item-voice-settings');
    if (voiceSettingsItem) {
      voiceSettingsItem.addEventListener('click', openVoiceSettingsModal);
    }

    // Notifications item
    const notifItem = screen.querySelector('#item-notifications');
    if (notifItem) {
      notifItem.addEventListener('click', () => {
        window.location.hash = '/notifications';
      });
    }

    // Privacy & Security
    const privacyItem = screen.querySelector('#item-privacy-security');
    if (privacyItem) {
      privacyItem.addEventListener('click', openPrivacyModal);
    }

    // Help & Support
    const helpItem = screen.querySelector('#item-help-support');
    if (helpItem) {
      helpItem.addEventListener('click', openHelpModal);
    }

    // About SYBRAI
    const aboutItem = screen.querySelector('#item-about-sybrai');
    if (aboutItem) {
      aboutItem.addEventListener('click', openAboutModal);
    }

    // Logout
    const logoutBtn = screen.querySelector('#profile-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        showToast('Logging out of SYBRAI...', 'info', 1000);
        setTimeout(() => {
          showToast('Logged out successfully', 'success');
          window.location.hash = '/';
        }, 1200);
      });
    }

    if (window.lucide) lucide.createIcons();
  }, 30);

  return screen;
}

// ---------------------------------------------------------------------
// MODALS
// ---------------------------------------------------------------------

// 1. Edit Profile Modal
function openEditProfileModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const profile = getSavedProfile();

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="profile-edit-backdrop">
      <div class="modal-sheet" role="dialog" aria-labelledby="modal-edit-title">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title" id="modal-edit-title">
            <i data-lucide="user-check" style="color:var(--color-primary)"></i> Edit Profile
          </h2>
          <button class="modal-sheet__close" id="modal-edit-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <div style="display:flex; justify-content:center; margin-bottom:16px;">
            <div style="position:relative;">
              <img src="${profile.avatar || '/avatar.jpg'}" id="preview-avatar" style="width:84px; height:84px; border-radius:50%; object-fit:cover; border:3px solid var(--color-primary);" />
              <button id="change-avatar-choice" style="position:absolute; bottom:0; right:0; background:var(--color-primary); color:white; border:2px solid var(--color-surface); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Change Photo">
                <i data-lucide="camera" style="width:14px;height:14px;"></i>
              </button>
            </div>
          </div>

          <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px; color:var(--color-text-secondary);">Full Name</label>
          <input type="text" id="edit-name" value="${profile.name}" style="width:100%; padding:10px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-primary); font-size:14px; margin-bottom:12px;" />

          <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px; color:var(--color-text-secondary);">Email Address</label>
          <input type="email" id="edit-email" value="${profile.email}" style="width:100%; padding:10px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-primary); font-size:14px; margin-bottom:12px;" />

          <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px; color:var(--color-text-secondary);">Bio / Tagline</label>
          <input type="text" id="edit-tagline" value="${profile.tagline || ''}" placeholder="e.g. Building secure apps with AI 🚀" style="width:100%; padding:10px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-primary); font-size:14px; margin-bottom:16px;" />

          <button class="btn btn--primary btn--full" id="save-profile-btn" style="padding:12px; font-weight:600;">
            <i data-lucide="check"></i> Save Changes
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-edit-close')?.addEventListener('click', close);
  modalContainer.querySelector('#profile-edit-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'profile-edit-backdrop') close();
  });

  modalContainer.querySelector('#save-profile-btn')?.addEventListener('click', () => {
    const updated = {
      ...profile,
      name: modalContainer.querySelector('#edit-name').value.trim() || profile.name,
      email: modalContainer.querySelector('#edit-email').value.trim() || profile.email,
      tagline: modalContainer.querySelector('#edit-tagline').value.trim() || profile.tagline,
    };
    saveLocalProfile(updated);
    showToast('Profile updated successfully! 🎉', 'success', 2000);
    close();

    // Re-render
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(renderProfile());
    }
  });
}

// 2. App Preferences Modal (Theme & AI Model Settings)
function openAppPreferencesModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const currentTheme = getTheme();
  const isDark = currentTheme === 'dark';
  const aiConfig = getAiConfig();

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="prefs-backdrop">
      <div class="modal-sheet" role="dialog" aria-labelledby="modal-prefs-title">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title" id="modal-prefs-title">
            <i data-lucide="settings" style="color:var(--color-primary)"></i> App Preferences
          </h2>
          <button class="modal-sheet__close" id="modal-prefs-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <!-- Theme Setting -->
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <i data-lucide="${isDark ? 'moon' : 'sun'}" style="color:var(--color-primary)"></i>
              <div>
                <div style="font-weight:600; font-size:14px;">Dark Theme</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">Currently ${isDark ? 'Dark' : 'Light'} Mode</div>
              </div>
            </div>
            <div class="theme-toggle" id="modal-theme-toggle" role="switch" style="cursor:pointer;">
              <div class="theme-toggle__thumb">
                <i data-lucide="${isDark ? 'moon' : 'sun'}" style="width:12px;height:12px"></i>
              </div>
            </div>
          </div>

          <!-- AI Model Configuration -->
          <h3 style="font-size:13px; font-weight:700; color:var(--color-text-primary); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="sparkles" style="color:var(--color-primary); width:16px; height:16px;"></i>
            AI Model & Security Engine
          </h3>
          <p style="font-size: 11.5px; color: var(--color-text-secondary); margin-bottom: 12px;">
            Configure the AI provider and model used for bug detection and autonomous code repairs.
          </p>

          <label style="font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px; color:var(--color-text-secondary);">Provider</label>
          <select id="cfg-provider" class="form-select" style="width:100%; padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-primary); margin-bottom: 12px;">
            <option value="gemini" ${aiConfig.provider === 'gemini' ? 'selected' : ''}>Google Gemini (Recommended)</option>
            <option value="openai" ${aiConfig.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
          </select>

          <label style="font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px; color:var(--color-text-secondary);">AI Model</label>
          <select id="cfg-model" class="form-select" style="width:100%; padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-primary); margin-bottom: 12px;">
            <option value="gemini-2.0-flash" ${aiConfig.model === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Ultra Fast & Accurate)</option>
            <option value="gemini-1.5-flash" ${aiConfig.model === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Standard)</option>
            <option value="gemini-1.5-pro" ${aiConfig.model === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Deep Reasoning)</option>
            <option value="gpt-5.6-luna" ${aiConfig.model === 'gpt-5.6-luna' ? 'selected' : ''}>gpt-5.6-luna (OpenAI Luna)</option>
            <option value="gpt-4o-mini" ${aiConfig.model === 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o-mini (OpenAI)</option>
          </select>

          <label style="font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px; color:var(--color-text-secondary);">API Key (Optional)</label>
          <input type="password" id="cfg-key" value="${aiConfig.apiKey}" placeholder="AIzaSy... or sk-..." style="width:100%; padding:9px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text-primary); font-family:var(--font-mono); font-size:12px; margin-bottom: 14px;" />

          <button class="btn btn--primary btn--full" id="save-ai-cfg-btn" style="padding:11px; font-weight:600;">
            <i data-lucide="check"></i> Save Preferences
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-prefs-close')?.addEventListener('click', close);
  modalContainer.querySelector('#prefs-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'prefs-backdrop') close();
  });

  // Toggle Theme inside modal
  const modalToggle = modalContainer.querySelector('#modal-theme-toggle');
  if (modalToggle) {
    modalToggle.addEventListener('click', () => {
      const newTheme = toggleTheme();
      showToast(`Switched to ${newTheme} mode`, 'success', 1500);
      close();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(renderProfile());
      }
    });
  }

  // Save AI Config
  modalContainer.querySelector('#save-ai-cfg-btn')?.addEventListener('click', () => {
    const provider = modalContainer.querySelector('#cfg-provider').value;
    const model = modalContainer.querySelector('#cfg-model').value;
    const apiKey = modalContainer.querySelector('#cfg-key').value;

    saveAiConfig({ provider, model, apiKey });
    showToast('Preferences saved successfully! ✨', 'success', 2000);
    close();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(renderProfile());
    }
  });
}

// 3. Voice Settings Modal
function openVoiceSettingsModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="voice-backdrop">
      <div class="modal-sheet" role="dialog" aria-labelledby="modal-voice-title">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title" id="modal-voice-title">
            <i data-lucide="mic" style="color:var(--color-primary)"></i> Voice Settings
          </h2>
          <button class="modal-sheet__close" id="modal-voice-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:12px;">
            <div>
              <div style="font-weight:600; font-size:13.5px;">Auto Speech Readout</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Speak out AI fix suggestions automatically</div>
            </div>
            <input type="checkbox" checked style="width:18px; height:18px; accent-color:var(--color-primary); cursor:pointer;" />
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:12px;">
            <div>
              <div style="font-weight:600; font-size:13.5px;">Voice Recognition Language</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">English (US & India)</div>
            </div>
            <i data-lucide="check" style="color:var(--color-success); width:16px; height:16px;"></i>
          </div>

          <div style="padding:12px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:16px;">
            <div style="font-weight:600; font-size:13px; margin-bottom:6px;">Speech Rate & Pitch</div>
            <input type="range" min="0.8" max="1.5" step="0.1" value="1.0" style="width:100%; accent-color:var(--color-primary);" />
            <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--color-text-tertiary); margin-top:4px;">
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>

          <button class="btn btn--primary btn--full" id="close-voice-btn" style="padding:11px; font-weight:600;">
            <i data-lucide="check"></i> Done
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-voice-close')?.addEventListener('click', close);
  modalContainer.querySelector('#close-voice-btn')?.addEventListener('click', close);
  modalContainer.querySelector('#voice-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'voice-backdrop') close();
  });
}

// 4. Privacy & Security Modal
function openPrivacyModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="privacy-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="shield-check" style="color:var(--color-success)"></i> Privacy & Security
          </h2>
          <button class="modal-sheet__close" id="modal-privacy-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <div style="padding:12px; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); border-radius:var(--radius-md); margin-bottom:14px;">
            <div style="font-weight:700; font-size:13px; color:var(--color-success); display:flex; align-items:center; gap:6px;">
              <i data-lucide="lock" style="width:14px; height:14px;"></i> Local-First Secure Execution
            </div>
            <p style="font-size:11.5px; color:var(--color-text-secondary); margin-top:4px; line-height:1.4;">
              Your source code and scans are processed securely on your client. API keys are stored encrypted in device storage.
            </p>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:10px;">
            <div>
              <div style="font-weight:600; font-size:13px;">Anonymous Telemetry</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Help improve bug pattern detection</div>
            </div>
            <input type="checkbox" checked style="width:18px; height:18px; accent-color:var(--color-primary);" />
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:16px;">
            <div>
              <div style="font-weight:600; font-size:13px;">Auto-Sanitize Code Logs</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Redacts secrets and passwords from scans</div>
            </div>
            <input type="checkbox" checked style="width:18px; height:18px; accent-color:var(--color-primary);" />
          </div>

          <button class="btn btn--primary btn--full" id="close-privacy-btn" style="padding:11px; font-weight:600;">
            <i data-lucide="check"></i> Confirm Settings
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-privacy-close')?.addEventListener('click', close);
  modalContainer.querySelector('#close-privacy-btn')?.addEventListener('click', close);
  modalContainer.querySelector('#privacy-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'privacy-backdrop') close();
  });
}

// 5. Help & Support Modal
function openHelpModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="help-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="help-circle" style="color:var(--color-primary)"></i> Help & Support
          </h2>
          <button class="modal-sheet__close" id="modal-help-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <div style="padding:14px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:12px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.open('mailto:info@sybrai.com')">
            <i data-lucide="mail" style="color:var(--color-primary)"></i>
            <div>
              <div style="font-weight:600; font-size:13.5px;">Contact Support</div>
              <div style="font-size:11.5px; color:var(--color-text-secondary);">info@sybrai.com</div>
            </div>
          </div>

          <div style="padding:14px; background:var(--color-surface-hover); border-radius:var(--radius-md); margin-bottom:12px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.hash='/copilot'">
            <i data-lucide="bot" style="color:var(--color-primary)"></i>
            <div>
              <div style="font-weight:600; font-size:13.5px;">Ask SYBRAI Assistant</div>
              <div style="font-size:11.5px; color:var(--color-text-secondary);">Interactive cybersecurity agent guidance</div>
            </div>
          </div>

          <button class="btn btn--secondary btn--full" id="close-help-btn" style="padding:11px; margin-top:8px;">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-help-close')?.addEventListener('click', close);
  modalContainer.querySelector('#close-help-btn')?.addEventListener('click', close);
  modalContainer.querySelector('#help-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'help-backdrop') close();
  });
}

// 6. About SYBRAI Modal
function openAboutModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="about-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="info" style="color:var(--color-primary)"></i> About SYBRAI
          </h2>
          <button class="modal-sheet__close" id="modal-about-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body" style="text-align:center; padding:10px 10px 20px;">
          <img src="/logo.png" alt="SYBRAI" style="width:52px; height:52px; margin:0 auto 10px; display:block;" />
          <h3 style="font-size:18px; font-weight:800; color:var(--color-text-primary); margin:0;">SYBRAI</h3>
          <p style="font-size:11.5px; color:var(--color-primary); font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin:2px 0 12px;">AI Bug Fixer & Analyzer</p>
          <div style="font-size:12px; color:var(--color-text-secondary); max-width:280px; margin:0 auto 16px; line-height:1.5;">
            Autonomous cybersecurity & software debugging engine created by <strong>Abbu Saikiran</strong>.
          </div>
          <div style="padding:10px; background:var(--color-surface-hover); border-radius:var(--radius-md); font-size:11.5px; color:var(--color-text-tertiary); margin-bottom:16px;">
            Version 1.0.0 (Build 2026.09) • info@sybrai.com
          </div>
          <button class="btn btn--primary btn--full" id="close-about-btn" style="padding:11px; font-weight:600;">
            Awesome
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-about-close')?.addEventListener('click', close);
  modalContainer.querySelector('#close-about-btn')?.addEventListener('click', close);
  modalContainer.querySelector('#about-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'about-backdrop') close();
  });
}
