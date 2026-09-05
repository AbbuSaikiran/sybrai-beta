// ============================================
// SYBRAI — Profile Screen
// ============================================

import { userProfile } from '../data/mockData.js';
import { toggleTheme, getTheme } from '../utils/theme.js';
import { showToast } from '../utils/toast.js';
import { getAiConfig, saveAiConfig } from '../utils/aiService.js';

export function renderProfile() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--profile';

  const isDark = getTheme() === 'dark';
  const aiConfig = getAiConfig();

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
        <!-- AI Model & API Key Configuration -->
        <div class="settings-item" role="button" tabindex="0" id="ai-model-setting">
          <i data-lucide="sparkles" class="settings-item__icon" style="color:var(--color-primary)"></i>
          <div style="flex:1">
            <span class="settings-item__label">AI Model & API Key</span>
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 1px;">
              ${aiConfig.model} (${aiConfig.isConfigured ? 'Key active' : 'Key missing'})
            </div>
          </div>
          <span class="badge ${aiConfig.isConfigured ? 'badge--success' : 'badge--warning'}" style="font-size:10px; margin-right:4px;">
            ${aiConfig.isConfigured ? 'Connected' : 'Offline'}
          </span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>

        <div class="settings-item" role="button" tabindex="0">
          <i data-lucide="user" class="settings-item__icon"></i>
          <span class="settings-item__label">Account Settings</span>
          <i data-lucide="chevron-right" class="settings-item__chevron"></i>
        </div>

        <div class="settings-item" role="button" tabindex="0" id="theme-setting">
          <i data-lucide="palette" class="settings-item__icon"></i>
          <span class="settings-item__label">Dark Mode</span>
          <div class="theme-toggle" id="theme-toggle" role="switch" aria-label="Toggle dark mode" aria-checked="${isDark}">
            <div class="theme-toggle__thumb">
              <i data-lucide="${isDark ? 'moon' : 'sun'}" style="width:12px;height:12px"></i>
            </div>
          </div>
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
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const newTheme = toggleTheme();
        showToast(`Switched to ${newTheme} mode`, 'success', 2000);
        const thumb = themeToggle.querySelector('.theme-toggle__thumb');
        if (thumb) {
          thumb.innerHTML = `<i data-lucide="${newTheme === 'dark' ? 'moon' : 'sun'}" style="width:12px;height:12px"></i>`;
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    // AI Model Config Modal
    const aiSettingBtn = document.getElementById('ai-model-setting');
    if (aiSettingBtn) {
      aiSettingBtn.addEventListener('click', () => openAiConfigModal());
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        showToast('Logged out successfully', 'success');
        setTimeout(() => { window.location.hash = '/'; }, 1500);
      });
    }

    if (window.lucide) lucide.createIcons();
  }, 50);

  return screen;
}

function openAiConfigModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const current = getAiConfig();

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="ai-modal-backdrop">
      <div class="modal-sheet" role="dialog" aria-labelledby="modal-ai-title">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title" id="modal-ai-title">
            <i data-lucide="sparkles" style="color:var(--color-primary)"></i> AI Model Settings
          </h2>
          <button class="modal-sheet__close" id="modal-ai-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: var(--space-md);">
            Reads from your project's <code>.env</code> file or configure directly on mobile below.
          </p>

          <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">Provider</label>
          <select id="cfg-provider" class="form-select" style="width:100%; padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); margin-bottom: var(--space-md);">
            <option value="gemini" ${current.provider === 'gemini' ? 'selected' : ''}>Google Gemini (Recommended)</option>
            <option value="openai" ${current.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
          </select>

          <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">AI Model</label>
          <select id="cfg-model" class="form-select" style="width:100%; padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); margin-bottom: var(--space-md);">
            <option value="gpt-5.6-luna" ${current.model === 'gpt-5.6-luna' ? 'selected' : ''}>gpt-5.6-luna (OpenAI Luna)</option>
            <option value="gpt-4o-mini" ${current.model === 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o-mini (OpenAI)</option>
            <option value="gemini-1.5-flash" ${current.model === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Google)</option>
            <option value="gemini-2.0-flash" ${current.model === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Next-Gen)</option>
            <option value="gemini-1.5-pro" ${current.model === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Deep reasoning)</option>
          </select>

          <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">API Key</label>
          <input type="password" id="cfg-key" value="${current.apiKey}" placeholder="AIzaSy... or sk-..." style="width:100%; padding:10px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); font-family:var(--font-mono); font-size:12px; margin-bottom: var(--space-sm);" />
          <div style="font-size: 11px; color: var(--color-text-tertiary); margin-bottom: var(--space-lg);">
            Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--color-primary);">Google AI Studio</a>. Stored securely in your device's storage.
          </div>

          <button class="btn btn--primary btn--full" id="save-ai-cfg-btn">
            <i data-lucide="check"></i> Save & Connect AI
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-ai-close')?.addEventListener('click', close);
  modalContainer.querySelector('#ai-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'ai-modal-backdrop') close();
  });

  modalContainer.querySelector('#save-ai-cfg-btn')?.addEventListener('click', () => {
    const provider = modalContainer.querySelector('#cfg-provider').value;
    const model = modalContainer.querySelector('#cfg-model').value;
    const apiKey = modalContainer.querySelector('#cfg-key').value;

    saveAiConfig({ provider, model, apiKey });
    showToast('AI Settings saved successfully! ✨', 'success', 2000);
    close();
    // Re-render profile
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(renderProfile());
    }
  });
}
