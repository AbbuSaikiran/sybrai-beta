// ============================================
// SYBRAI — Hash-Based SPA Router
// ============================================

const routes = {};
let currentScreen = null;
let onRouteChange = null;

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function setOnRouteChange(fn) {
  onRouteChange = fn;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/';
}

export function initRouter() {
  const handleRoute = () => {
    const path = getCurrentRoute();
    const container = document.getElementById('main-content');
    if (!container) return;

    // Find matching route
    const renderFn = routes[path];
    if (renderFn) {
      container.innerHTML = '';
      const screen = renderFn();
      if (typeof screen === 'string') {
        container.innerHTML = screen;
      } else if (screen instanceof HTMLElement) {
        container.appendChild(screen);
      }

      // Activate screen animation
      requestAnimationFrame(() => {
        const screenEl = container.querySelector('.screen');
        if (screenEl) {
          screenEl.classList.add('active');
        }
      });

      currentScreen = path;
      if (onRouteChange) onRouteChange(path);
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
