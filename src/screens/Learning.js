// ============================================
// SYBRAI — Learning Screen (Redesigned to Mockup)
// Tutorials, Interactive Guides, Paths, and Best Practices
// ============================================

import { userProfile } from '../data/mockData.js';
import { showToast } from '../utils/toast.js';

const tutorialsData = [
  {
    id: 'tut-1',
    category: 'Tutorials',
    type: 'video',
    level: 'Beginner',
    duration: '5 min',
    timeCode: '5:24',
    title: 'How to Fix Null Pointer Exception',
    shortDesc: 'Learn why it happens and how to fix it with real examples.',
    thumbTheme: 'navy',
    thumbIcon: 'code-2',
    thumbText: 'Find & Fix Null Pointer Exception',
    content: `
      <h3>Understanding Null Pointer Exceptions (NPE)</h3>
      <p>Null pointer exceptions occur when an application attempts to use an object reference that has not been initialized or points to <code>null</code>.</p>
      <h4>Common Causes:</h4>
      <ul>
        <li>Invoking methods on a null object instance.</li>
        <li>Accessing or modifying fields of an uninstantiated object.</li>
        <li>Missing null guards before evaluating nested JSON responses.</li>
      </ul>
      <h4>Safe Code Example:</h4>
      <pre style="background:var(--color-surface-hover); padding:10px; border-radius:8px; font-family:var(--font-mono); font-size:12px;">
// Unsafe
const name = response.user.profile.name;

// Safe (Optional Chaining & Nullish Coalescing)
const name = response?.user?.profile?.name ?? 'Guest User';
      </pre>
    `
  },
  {
    id: 'tut-2',
    category: 'Examples',
    type: 'video',
    level: 'Intermediate',
    duration: '7 min',
    timeCode: '7:18',
    title: 'Handling API Errors in Android',
    shortDesc: 'Best practices to manage network failures.',
    thumbTheme: 'purple',
    thumbIcon: 'cloud',
    thumbText: 'Handle API Errors Gracefully',
    content: `
      <h3>Resilient Network Handling</h3>
      <p>Modern applications must handle socket timeouts, DNS failures, and HTTP 5xx responses without crashing the user interface.</p>
      <h4>Key Strategies:</h4>
      <ul>
        <li>Exponential backoff with jitter for retries.</li>
        <li>Offline caching using room or local persistent cache.</li>
        <li>User-friendly empty state banners instead of generic error toasts.</li>
      </ul>
    `
  },
  {
    id: 'tut-3',
    category: 'Best Practices',
    type: 'article',
    level: 'Intermediate',
    duration: '6 min',
    timeCode: '6:45',
    title: 'Tips to Improve App Performance',
    shortDesc: 'Make your app faster and smoother.',
    thumbTheme: 'emerald',
    thumbIcon: 'gauge',
    thumbText: 'Improve App Performance',
    content: `
      <h3>App Optimization Best Practices</h3>
      <p>Performance directly influences user retention and battery consumption.</p>
      <h4>Key Optimizations:</h4>
      <ul>
        <li>Debounce rapid input changes and scroll listeners.</li>
        <li>Virtualize long DOM lists to minimize layout recalculations.</li>
        <li>Lazy-load heavy modules and defer non-critical analytics.</li>
      </ul>
    `
  },
  {
    id: 'tut-4',
    category: 'Guides',
    type: 'video',
    level: 'Advanced',
    duration: '8 min',
    timeCode: '8:12',
    title: 'Secure Coding Practices',
    shortDesc: 'Learn how to write safe and secure code.',
    thumbTheme: 'darkblue',
    thumbIcon: 'lock',
    thumbText: 'Write Secure Code',
    content: `
      <h3>Defensive Programming & Security</h3>
      <p>Protecting user data from injection attacks, memory leaks, and insecure local storage.</p>
      <h4>Security Checklist:</h4>
      <ul>
        <li>Sanitize and validate all user inputs against regex whitelists.</li>
        <li>Store API tokens in secure HTTP-only cookies or encrypted keystores.</li>
        <li>Implement Strict Content Security Policy (CSP) headers.</li>
      </ul>
    `
  }
];

let activeCategory = 'All';

export function renderLearning() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--learning';

  screen.innerHTML = `
    <!-- Top Branding Row -->
    <div class="learning-brand-row">
      <div class="profile-brand-left">
        <img src="/logo.png" alt="SYBRAI Logo" class="profile-brand-logo" />
        <div>
          <div class="profile-brand-title">SYBRAI</div>
          <div class="profile-brand-sub">AI BUG FIXER & ANALYZER</div>
        </div>
      </div>
      <div class="learning-brand-actions">
        <button class="top-app-bar__icon-btn" id="learning-search-btn" aria-label="Search" title="Search Tutorials">
          <i data-lucide="search"></i>
        </button>
        <button class="profile-notif-btn" onclick="window.location.hash='/notifications'" aria-label="Notifications" title="Notifications">
          <i data-lucide="bell"></i>
          <span class="profile-notif-dot"></span>
        </button>
        <img src="${userProfile.avatar || '/avatar.jpg'}" alt="${userProfile.name}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:2px solid var(--color-primary); cursor:pointer;" onclick="window.location.hash='/profile'" title="${userProfile.name}" />
      </div>
    </div>

    <!-- Title & Watermark Row -->
    <div class="learning-title-row">
      <h1 class="learning-heading">Learning</h1>
      <div class="learning-subheading-bold">Learn. Practice. Build Better.</div>
      <div class="learning-subheading-desc">Explore tutorials, examples and best practices to become a better developer.</div>
      <div class="learning-watermark">
        <div class="learning-watermark-cap">
          <i data-lucide="graduation-cap" style="width:22px;height:22px;"></i>
        </div>
        <div class="learning-watermark-text">KNOWLEDGE<br>BUILDS<br>BETTER APPS</div>
      </div>
    </div>

    <!-- Filter Pills Strip -->
    <div class="learning-filter-strip" id="learning-filters">
      <button class="learning-filter-pill active" data-cat="All">All</button>
      <button class="learning-filter-pill" data-cat="Tutorials">Tutorials</button>
      <button class="learning-filter-pill" data-cat="Examples">Examples</button>
      <button class="learning-filter-pill" data-cat="Best Practices">Best Practices</button>
      <button class="learning-filter-pill" data-cat="Guides">Guides</button>
      <button class="learning-filter-pill" data-cat="Videos">Videos</button>
    </div>

    <!-- Hero Banner (Learn with SYBRAI) -->
    <div class="learning-hero-banner">
      <div class="learning-hero-content">
        <h2 class="learning-hero-title">Learn with SYBRAI</h2>
        <p class="learning-hero-desc">Step-by-step guides, real examples and AI-powered insights.</p>
        <button class="learning-hero-btn" id="hero-continue-btn">
          <span>Continue Learning</span>
          <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
        </button>
      </div>
      <div class="learning-hero-img-wrap">
        <img src="/learning-banner.jpg" alt="Developer Learning" class="learning-hero-img" onerror="this.style.display='none'" />
      </div>
    </div>

    <!-- Learning Paths Section -->
    <div class="learning-section">
      <div class="learning-section-header">
        <h3 class="learning-section-title">Learning Paths</h3>
        <button class="learning-section-link" id="paths-see-all">
          <span>See all</span>
          <i data-lucide="arrow-right" style="width:12px;height:12px;"></i>
        </button>
      </div>
      <div class="learning-section-sub">Choose a path and level up your skills.</div>

      <div class="learning-paths-grid">
        <!-- Path 1 -->
        <div class="learning-path-card" data-path="Bug Fixing Basics">
          <div class="learning-path-icon-wrap learning-path-icon-wrap--blue">
            <i data-lucide="code-2"></i>
          </div>
          <div class="learning-path-name">Bug Fixing<br>Basics</div>
          <div class="learning-path-bottom">
            <span>10 Lessons</span>
            <div class="learning-path-arrow-circle">
              <i data-lucide="arrow-right" style="width:10px;height:10px;"></i>
            </div>
          </div>
        </div>

        <!-- Path 2 -->
        <div class="learning-path-card" data-path="Secure Coding">
          <div class="learning-path-icon-wrap learning-path-icon-wrap--green">
            <i data-lucide="shield-check"></i>
          </div>
          <div class="learning-path-name">Secure<br>Coding</div>
          <div class="learning-path-bottom">
            <span>8 Lessons</span>
            <div class="learning-path-arrow-circle">
              <i data-lucide="arrow-right" style="width:10px;height:10px;"></i>
            </div>
          </div>
        </div>

        <!-- Path 3 -->
        <div class="learning-path-card" data-path="Debugging Like a Pro">
          <div class="learning-path-icon-wrap learning-path-icon-wrap--pink">
            <i data-lucide="database"></i>
          </div>
          <div class="learning-path-name">Debugging<br>Like a Pro</div>
          <div class="learning-path-bottom">
            <span>12 Lessons</span>
            <div class="learning-path-arrow-circle">
              <i data-lucide="arrow-right" style="width:10px;height:10px;"></i>
            </div>
          </div>
        </div>

        <!-- Path 4 -->
        <div class="learning-path-card" data-path="Performance Optimization">
          <div class="learning-path-icon-wrap learning-path-icon-wrap--amber">
            <i data-lucide="settings"></i>
          </div>
          <div class="learning-path-name">Performance<br>Optimization</div>
          <div class="learning-path-bottom">
            <span>8 Lessons</span>
            <div class="learning-path-arrow-circle">
              <i data-lucide="arrow-right" style="width:10px;height:10px;"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Tutorials Section -->
    <div class="learning-section">
      <div class="learning-section-header">
        <h3 class="learning-section-title">Featured Tutorials</h3>
        <button class="learning-section-link" id="tutorials-see-all">
          <span>See all</span>
          <i data-lucide="arrow-right" style="width:12px;height:12px;"></i>
        </button>
      </div>
      <div class="learning-section-sub">Handpicked tutorials to help your learn faster.</div>

      <div class="learning-tutorials-list" id="tutorials-container">
        ${renderTutorialCards(tutorialsData)}
      </div>
    </div>

    <!-- Keep Learning Bottom Card -->
    <div class="learning-keep-banner">
      <div class="learning-keep-left">
        <div class="learning-keep-icon">
          <i data-lucide="book-open"></i>
        </div>
        <div>
          <div class="learning-keep-title">Keep Learning</div>
          <div class="learning-keep-desc">Build better apps with knowledge.</div>
        </div>
      </div>
      <button class="learning-keep-btn" id="explore-all-btn">
        <span>Explore All Resources</span>
        <i data-lucide="arrow-right" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-left:4px;"></i>
      </button>
    </div>
  `;

  // Attach interactivity
  setTimeout(() => setupLearningEvents(screen), 50);

  return screen;
}

function renderTutorialCards(items) {
  return items.map(item => `
    <div class="learning-tutorial-card" data-id="${item.id}">
      <div class="learning-tutorial-thumb learning-tutorial-thumb--${item.thumbTheme}">
        <div class="learning-thumb-title">${item.thumbText}</div>
        <i data-lucide="${item.thumbIcon}" style="width:16px;height:16px;opacity:0.9;"></i>
        <span class="learning-thumb-badge">${item.timeCode}</span>
      </div>
      <div class="learning-tutorial-content">
        <div class="learning-tutorial-title">${item.title}</div>
        <div class="learning-tutorial-desc">${item.shortDesc}</div>
        <div class="learning-tutorial-meta">
          <i data-lucide="${item.type === 'video' ? 'bar-chart' : 'file-text'}" style="width:12px;height:12px;"></i>
          <span>${item.level}</span>
          <span>•</span>
          <span>${item.duration}</span>
          <span>•</span>
          <span>${item.type === 'video' ? 'Video' : 'Article'}</span>
        </div>
      </div>
      <button class="learning-play-btn" aria-label="Open Tutorial" title="Open Tutorial">
        <i data-lucide="play" style="width:14px;height:14px;margin-left:2px;"></i>
      </button>
    </div>
  `).join('');
}

function setupLearningEvents(screen) {
  if (window.lucide) lucide.createIcons();

  // Filter pills click
  const pills = screen.querySelectorAll('.learning-filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.cat;

      let filtered = tutorialsData;
      if (activeCategory === 'Videos') {
        filtered = tutorialsData.filter(t => t.type === 'video');
      } else if (activeCategory !== 'All') {
        filtered = tutorialsData.filter(t => t.category === activeCategory || t.level === activeCategory);
        if (filtered.length === 0) filtered = tutorialsData;
      }

      const container = screen.querySelector('#tutorials-container');
      if (container) {
        container.innerHTML = renderTutorialCards(filtered);
        if (window.lucide) lucide.createIcons();
        attachCardListeners(screen);
      }
    });
  });

  attachCardListeners(screen);

  // Search button
  const searchBtn = screen.querySelector('#learning-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearchModal);
  }

  // Hero Continue Button
  const heroBtn = screen.querySelector('#hero-continue-btn');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      openTutorialModal(tutorialsData[0]);
    });
  }

  // Explore All button
  const exploreBtn = screen.querySelector('#explore-all-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      showToast('Loading full SYBRAI documentation catalog... 📚', 'info', 1500);
      setTimeout(() => {
        window.location.hash = '/copilot';
      }, 1000);
    });
  }

  // Path cards
  screen.querySelectorAll('.learning-path-card').forEach(card => {
    card.addEventListener('click', () => {
      const pathName = card.dataset.path;
      openPathModal(pathName);
    });
  });
}

function attachCardListeners(screen) {
  screen.querySelectorAll('.learning-tutorial-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const tut = tutorialsData.find(t => t.id === id);
      if (tut) openTutorialModal(tut);
    });
  });
}

// Interactive Tutorial Modal
function openTutorialModal(tut) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="tut-modal-backdrop">
      <div class="modal-sheet" role="dialog" style="max-height:85vh; overflow-y:auto;">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge badge--primary" style="font-size:10px;">${tut.level}</span>
            <span style="font-size:12px; color:var(--color-text-secondary);">${tut.duration}</span>
          </div>
          <button class="modal-sheet__close" id="modal-tut-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body" style="padding-top:8px;">
          <h2 style="font-size:18px; font-weight:800; color:var(--color-text-primary); margin-bottom:6px;">${tut.title}</h2>
          <p style="font-size:13px; color:var(--color-text-secondary); margin-bottom:14px;">${tut.shortDesc}</p>

          <div style="background:linear-gradient(135deg,#0F172A,#1E293B); color:white; border-radius:14px; padding:16px; text-align:center; margin-bottom:16px; position:relative;">
            <i data-lucide="play-circle" style="width:40px; height:40px; color:#38BDF8; margin-bottom:6px;"></i>
            <div style="font-size:13px; font-weight:700;">Interactive Lesson Player</div>
            <div style="font-size:11px; color:#94A3B8;">Duration: ${tut.timeCode} • Code Sandbox Ready</div>
          </div>

          <div style="font-size:13px; color:var(--color-text-primary); line-height:1.6; margin-bottom:18px;">
            ${tut.content}
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn btn--primary" id="tut-ask-ai-btn" style="flex:1; padding:12px; font-weight:600;">
              <i data-lucide="sparkles"></i> Ask AI to Explain
            </button>
            <button class="btn btn--secondary" id="tut-done-btn" style="padding:12px 18px;">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-tut-close')?.addEventListener('click', close);
  modalContainer.querySelector('#tut-done-btn')?.addEventListener('click', close);
  modalContainer.querySelector('#tut-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'tut-modal-backdrop') close();
  });

  modalContainer.querySelector('#tut-ask-ai-btn')?.addEventListener('click', () => {
    close();
    window.location.hash = '/copilot';
  });
}

// Learning Path Roadmap Modal
function openPathModal(pathName) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="path-modal-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="map-pin" style="color:var(--color-primary)"></i> ${pathName}
          </h2>
          <button class="modal-sheet__close" id="modal-path-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <p style="font-size:12.5px; color:var(--color-text-secondary); margin-bottom:14px;">
            Complete all modules to earn your certified SYBRAI Developer badge.
          </p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
            <div style="padding:12px; background:var(--color-surface-hover); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
              <div>
                <div style="font-size:13px; font-weight:700;">1. Diagnostic Foundations</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">Stack traces, memory dumps & telemetry</div>
              </div>
              <span class="badge badge--success">Completed</span>
            </div>
            <div style="padding:12px; background:var(--color-surface-hover); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
              <div>
                <div style="font-size:13px; font-weight:700;">2. Autonomous Auto-Fix Engine</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">Pattern analysis & patch verification</div>
              </div>
              <span class="badge badge--primary">In Progress</span>
            </div>
            <div style="padding:12px; background:var(--color-surface-hover); border-radius:12px; display:flex; align-items:center; justify-content:space-between; opacity:0.7;">
              <div>
                <div style="font-size:13px; font-weight:700;">3. Defense-in-Depth Architecture</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">Hardening client runtimes & APIs</div>
              </div>
              <span class="badge">Locked</span>
            </div>
          </div>
          <button class="btn btn--primary btn--full" id="start-path-btn" style="padding:12px; font-weight:600;">
            Continue Lesson 2
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-path-close')?.addEventListener('click', close);
  modalContainer.querySelector('#start-path-btn')?.addEventListener('click', () => {
    showToast(`Resuming ${pathName}! 🚀`, 'success', 1500);
    close();
  });
  modalContainer.querySelector('#path-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'path-modal-backdrop') close();
  });
}

// Search Modal
function openSearchModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="search-modal-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="search" style="color:var(--color-primary)"></i> Search Tutorials & Guides
          </h2>
          <button class="modal-sheet__close" id="modal-search-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <input type="text" id="live-tut-search" placeholder="Type keywords (e.g. NullPointer, API, Memory)..." autofocus style="width:100%; padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); font-size:13.5px; margin-bottom:14px;" />
          <div id="search-results-list" style="max-height:300px; overflow-y:auto;">
            ${renderTutorialCards(tutorialsData)}
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-search-close')?.addEventListener('click', close);
  modalContainer.querySelector('#search-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'search-modal-backdrop') close();
  });

  const searchInput = modalContainer.querySelector('#live-tut-search');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const results = tutorialsData.filter(t => t.title.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q));
    const container = modalContainer.querySelector('#search-results-list');
    if (container) {
      container.innerHTML = results.length > 0 ? renderTutorialCards(results) : '<p style="text-align:center; color:var(--color-text-secondary); padding:20px;">No tutorials found.</p>';
      if (window.lucide) lucide.createIcons();
      container.querySelectorAll('.learning-tutorial-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          const tut = tutorialsData.find(t => t.id === id);
          if (tut) {
            close();
            openTutorialModal(tut);
          }
        });
      });
    }
  });
}
