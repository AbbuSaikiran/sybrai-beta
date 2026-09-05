// ============================================
// SYBRAI — Main Entry Point
// Initializes router, registers screens, sets up navigation
// ============================================

import { registerRoute, initRouter, setOnRouteChange, getCurrentRoute } from './router.js';
import { initTheme } from './utils/theme.js';
import { renderSplash } from './screens/Splash.js';
import { renderHome } from './screens/Home.js';
import { renderAnalysis } from './screens/Analysis.js';
import { renderRecords } from './screens/Records.js';
import { renderLearning } from './screens/Learning.js';
import { renderCopilot } from './screens/Copilot.js';
import { renderProfile } from './screens/Profile.js';
import { renderNotifications } from './screens/Notifications.js';

// ---- Initialize Theme ----
initTheme();

// ---- Tab Configuration ----
const tabs = [
  { id: 'home', label: 'Home', icon: 'home', route: '/home' },
  { id: 'analysis', label: 'Analysis', icon: 'bar-chart-2', route: '/analysis' },
  { id: 'chat', label: 'AI Chat', icon: 'message-square', route: '/chat' },
  { id: 'learning', label: 'Learning', icon: 'book-open', route: '/learning' },
  { id: 'records', label: 'Records', icon: 'file-text', route: '/records' },
];

// ---- Build Bottom Tab Bar ----
function buildTabBar() {
  const tabBar = document.getElementById('bottom-tab-bar');
  if (!tabBar) return;

  tabBar.innerHTML = tabs.map(tab => `
    <button class="tab-item" data-route="${tab.route}" aria-label="${tab.label}">
      <i data-lucide="${tab.icon}" class="tab-item__icon"></i>
      <span class="tab-item__label">${tab.label}</span>
    </button>
  `).join('');

  tabBar.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', () => {
      window.location.hash = item.dataset.route;
    });
  });
}

// ---- Update Active Tab ----
function updateActiveTab(route) {
  const tabBar = document.getElementById('bottom-tab-bar');
  if (!tabBar) return;

  tabBar.querySelectorAll('.tab-item').forEach(item => {
    const isActive = item.dataset.route === route;
    item.classList.toggle('active', isActive);
  });
}

// ---- Show/Hide Tab Bar ----
function updateTabBarVisibility(route) {
  const tabBar = document.getElementById('bottom-tab-bar');
  const statusBar = document.querySelector('.status-bar');
  if (!tabBar) return;

  const hideOnRoutes = ['/', '/splash'];
  const shouldHide = hideOnRoutes.includes(route);

  tabBar.style.display = shouldHide ? 'none' : 'flex';
  if (statusBar) {
    statusBar.style.display = route === '/' ? 'none' : 'flex';
  }
}

// ---- Register All Routes ----
registerRoute('/', renderSplash);
registerRoute('/home', renderHome);
registerRoute('/analysis', renderAnalysis);
registerRoute('/chat', renderCopilot);
registerRoute('/copilot', renderCopilot);
registerRoute('/learning', renderLearning);
registerRoute('/records', renderRecords);
registerRoute('/profile', renderProfile);
registerRoute('/notifications', renderNotifications);

// ---- Route Change Handler ----
setOnRouteChange((route) => {
  const routeAliases = {
    '/copilot': '/chat',
    '/ai': '/chat',
  };
  const normalizedRoute = routeAliases[route] || route;
  updateTabBarVisibility(route);
  updateActiveTab(normalizedRoute);

  // Re-initialize Lucide icons after route change
  setTimeout(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  }, 50);
});

// ---- Initialize ----
buildTabBar();
initRouter();

// Initial Lucide icons render
window.addEventListener('load', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Also try immediately in case DOMContentLoaded already fired
setTimeout(() => {
  if (window.lucide) {
    lucide.createIcons();
  }
}, 100);
