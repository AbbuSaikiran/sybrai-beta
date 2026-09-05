// ============================================
// SYBRAI — AI Chat / Copilot Screen
// Intelligent Coding Assistant (Ask. Analyze. Fix. Learn.)
// User-Friendly, Dynamic Query-Assisted Bug Fixer
// ============================================

import { userProfile } from '../data/mockData.js';
import { showToast } from '../utils/toast.js';
import { chatWithAi, getAiConfig, saveAiConfig } from '../utils/aiService.js';
import { startLiveTranscription, stopLiveTranscription, isCurrentlyTranscribing } from '../utils/audioService.js';

// Pre-packaged rich diagnostic scenarios for quick access and recent chats
const PRESET_SCENARIOS = {
  'null-pointer': {
    userText: 'Why is my app crashing on the splash screen?',
    aiText: 'I analyzed your crash log. It looks like a NullPointerException in MainActivity. This usually happens when a variable or UI element is referenced before initialization.',
    issueData: {
      type: 'NullPointerException',
      badgeClass: 'danger',
      log: `java.lang.NullPointerException: Attempt to invoke virtual method 'void android.widget.TextView.setText(java.lang.CharSequence)' on a null object reference\n  at com.example.app.MainActivity.onCreate(MainActivity.java:5)\n  at android.app.Activity.performCreate(Activity.java:8000)\n  at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3601)`
    },
    fixData: {
      isApplied: false,
      safeBadge: 'Safe Fix',
      file: 'MainActivity.java',
      beforeCode: `1  TextView tv;\n2  @Override\n3  protected void onCreate(Bundle savedInstanceState) {\n4    super.onCreate(savedInstanceState);\n5    tv.setText("Welcome");\n6  }`,
      afterCode: `1  TextView tv;\n2  @Override\n3  protected void onCreate(Bundle savedInstanceState) {\n4    super.onCreate(savedInstanceState);\n5    tv = findViewById(R.id.textView);\n6    if (tv != null) {\n7      tv.setText("Welcome");\n8    }\n9  }`
    },
    followUps: [
      'How does this fix work?',
      'Prevent this in future',
      'Check for similar issues'
    ]
  },
  'api-failure': {
    userText: 'My API calls are failing with 500 Internal Server Error under load.',
    aiText: 'I detected unhandled connection timeouts and cascading 500 errors in your HTTP client. The application lacks exponential backoff retries and request throttling.',
    issueData: {
      type: 'HTTP 500 / Network Failure',
      badgeClass: 'danger',
      log: `AxiosError: Request failed with status code 500\n  at createError (axios/lib/core/createError.js:16)\n  at settle (axios/lib/core/settle.js:17)\n  at XMLHttpRequest.handleLoad (axios/lib/adapters/xhr.js:82)`
    },
    fixData: {
      isApplied: false,
      safeBadge: 'Safe Fix',
      file: 'apiClient.js',
      beforeCode: `1  export async function fetchData(url) {\n2    const res = await axios.get(url);\n3    return res.data;\n4  }`,
      afterCode: `1  export async function fetchData(url, retries = 3, delay = 800) {\n2    for (let attempt = 1; attempt <= retries; attempt++) {\n3      try {\n4        const res = await axios.get(url, { timeout: 5000 });\n5        return res.data;\n6      } catch (err) {\n7        if (attempt === retries) throw err;\n8        await new Promise(r => setTimeout(r, delay * attempt));\n9      }\n10   }\n11 }`
    },
    followUps: [
      'Add offline caching?',
      'How to handle token expiration?',
      'Simulate failure in test'
    ]
  },
  'performance': {
    userText: 'UI is freezing and dropping frames when scrolling large lists.',
    aiText: 'I traced heavy synchronous computation and unbounded image allocations executing directly on the Android UI thread (Choreographer skipped frames).',
    issueData: {
      type: 'Main Thread Blocked',
      badgeClass: 'warning',
      log: `I/Choreographer: Skipped 56 frames! The application may be doing too much work on its main thread.\nW/Looper: Slow Looper: dispatch took 934ms to [Handler (android.view.ViewRootImpl$ViewRootHandler)]`
    },
    fixData: {
      isApplied: false,
      safeBadge: 'Recommended Fix',
      file: 'ItemAdapter.java',
      beforeCode: `1  @Override\n2  public void onBindViewHolder(ViewHolder h, int pos) {\n3    Bitmap bmp = BitmapFactory.decodeFile(items.get(pos).path);\n4    h.imageView.setImageBitmap(bmp);\n5  }`,
      afterCode: `1  @Override\n2  public void onBindViewHolder(ViewHolder h, int pos) {\n3    // Use asynchronous image loader with memory caching\n4    Glide.with(h.itemView.getContext())\n5         .load(items.get(pos).path)\n6         .thumbnail(0.25f)\n7         .into(h.imageView);\n8  }`
    },
    followUps: [
      'Benchmark frame rate',
      'Enable RecyclerView prefetching',
      'Check memory footprint'
    ]
  },
  'security': {
    userText: 'Check my login and authentication queries for security vulnerabilities.',
    aiText: 'I performed an automated security scan and flagged a Critical SQL Injection vulnerability (CWE-89) in your authentication controller. User input is directly concatenated.',
    issueData: {
      type: 'CWE-89 SQL Injection',
      badgeClass: 'danger',
      log: `Vulnerability: CWE-89 (Improper Neutralization of Special Elements used in an SQL Command)\nCVSS Score: 9.8 [CRITICAL]\nLocation: server/controllers/auth.js:24\nPattern: "SELECT * FROM users WHERE email = '" + req.body.email + "'"`
    },
    fixData: {
      isApplied: false,
      safeBadge: 'Verified Patch',
      file: 'authController.js',
      beforeCode: `1  // VULNERABLE: Direct string concatenation\n2  const sql = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND pass = '" + req.body.password + "'";\n3  const user = await db.query(sql);`,
      afterCode: `1  // SECURE: Parameterized query & bcrypt password hash\n2  const sql = "SELECT * FROM users WHERE email = $1 LIMIT 1";\n3  const { rows } = await db.query(sql, [req.body.email]);\n4  if (!rows[0] || !await bcrypt.compare(req.body.password, rows[0].passwordHash)) {\n5    throw new UnauthorizedError("Invalid credentials");\n6  }`
    },
    followUps: [
      'Run full OWASP scan',
      'Rotate database credentials',
      'Enable rate limiting on login'
    ]
  },
  'database-error': {
    userText: 'Getting database locked / Room SQLite constraint exception.',
    aiText: 'I analyzed your Room / SQLite database interactions. Multiple threads are trying to write concurrently on a single database connection without a transaction lock.',
    issueData: {
      type: 'SQLiteDatabaseLockedException',
      badgeClass: 'danger',
      log: `android.database.sqlite.SQLiteDatabaseLockedException: database is locked (code 5)\n  at android.database.sqlite.SQLiteConnection.nativeExecute(Native Method)\n  at androidx.room.RoomDatabase.beginTransaction(RoomDatabase.java:410)`
    },
    fixData: {
      isApplied: false,
      safeBadge: 'Safe Fix',
      file: 'AppDatabase.kt',
      beforeCode: `1  fun insertLogs(logs: List<LogItem>) {\n2    logs.forEach { dao.insert(it) }\n3  }`,
      afterCode: `1  suspend fun insertLogs(logs: List<LogItem>) = withContext(Dispatchers.IO) {\n2    database.withTransaction {\n3      dao.insertAll(logs)\n4    }\n5  }`
    },
    followUps: [
      'Enable WAL mode',
      'Add migration strategy',
      'Optimize query indices'
    ]
  }
};

// Initial state — Clean starter state waiting for user query
let conversation = [];

let activeTabDiff = 'both'; // 'both' | 'before' | 'after'
let isDrawerOpen = false;

export function renderCopilot() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--copilot';

  screen.innerHTML = `
    <!-- Slide-Over Navigation Drawer (Mobile Friendly) -->
    <div class="copilot-drawer-backdrop" id="copilot-drawer-backdrop"></div>
    <aside class="copilot-drawer" id="copilot-drawer" aria-label="SYBRAI AI Navigation">
      <div class="copilot-drawer-header">
        <div class="profile-brand-left">
          <img src="/logo.png" alt="SYBRAI Logo" class="profile-brand-logo" style="width:26px;height:26px;" />
          <div>
            <div class="profile-brand-title" style="font-size:14px;">SYBRAI AI</div>
            <div class="profile-brand-sub" style="font-size:9px;">ASSISTANT & COPILOT</div>
          </div>
        </div>
        <button class="copilot-drawer-close" id="copilot-drawer-close" aria-label="Close Drawer">
          <i data-lucide="x"></i>
        </button>
      </div>

      <div class="copilot-drawer-content">
        <button class="copilot-new-chat-btn" id="drawer-new-chat-btn">
          <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
          <span>New Chat</span>
        </button>

        <div class="copilot-side-section-title">Capabilities</div>
        <div class="copilot-side-menu">
          <div class="copilot-side-item active" data-scenario="null-pointer" data-q="Fix an Error">
            <i data-lucide="wrench" style="width:15px;height:15px;color:#7C3AED;"></i>
            <span>Fix an Error</span>
          </div>
          <div class="copilot-side-item" data-scenario="null-pointer" data-q="Analyze Code">
            <i data-lucide="code-2" style="width:15px;height:15px;color:#2563EB;"></i>
            <span>Analyze Code</span>
          </div>
          <div class="copilot-side-item" data-q="Explain Android lifecycle hooks">
            <i data-lucide="book-open" style="width:15px;height:15px;color:#0284C7;"></i>
            <span>Explain Code</span>
          </div>
          <div class="copilot-side-item" data-scenario="performance" data-q="Optimize performance">
            <i data-lucide="zap" style="width:15px;height:15px;color:#F59E0B;"></i>
            <span>Optimize</span>
          </div>
          <div class="copilot-side-item" data-scenario="security" data-q="Security Check">
            <i data-lucide="shield-check" style="width:15px;height:15px;color:#10B981;"></i>
            <span>Security Check</span>
          </div>
          <div class="copilot-side-item" data-q="Best Practices for Mobile Architecture">
            <i data-lucide="lightbulb" style="width:15px;height:15px;color:#EC4899;"></i>
            <span>Best Practices</span>
          </div>
        </div>

        <!-- Recent Chats -->
        <div class="copilot-side-section-title" style="margin-top:16px;">
          <i data-lucide="clock" style="width:12px;height:12px;"></i>
          <span>Recent Chats</span>
        </div>
        <div class="copilot-recent-list">
          <div class="copilot-recent-item" data-scenario="null-pointer">
            <i data-lucide="message-square" style="width:12px;height:12px;"></i>
            <span>Null pointer error</span>
          </div>
          <div class="copilot-recent-item" data-scenario="api-failure">
            <i data-lucide="message-square" style="width:12px;height:12px;"></i>
            <span>API failure</span>
          </div>
          <div class="copilot-recent-item" data-scenario="performance">
            <i data-lucide="message-square" style="width:12px;height:12px;"></i>
            <span>Improve performance</span>
          </div>
          <div class="copilot-recent-item" data-scenario="performance">
            <i data-lucide="message-square" style="width:12px;height:12px;"></i>
            <span>UI not responsive</span>
          </div>
          <div class="copilot-recent-item" data-scenario="database-error">
            <i data-lucide="message-square" style="width:12px;height:12px;"></i>
            <span>Database error</span>
          </div>
          <a href="javascript:void(0)" class="copilot-view-all-link" id="drawer-view-all-records">
            <span>View all in Records</span>
            <i data-lucide="arrow-right" style="width:10px;height:10px;"></i>
          </a>
        </div>

        <!-- Promo / Tips Card -->
        <div class="copilot-side-promo">
          <div class="copilot-side-promo-title">
            <i data-lucide="sparkles" style="width:13px;height:13px;"></i>
            <span>Learn While You Build</span>
          </div>
          <div class="copilot-side-promo-desc">
            Get instant explanations, unified diffs, and auto-fixes as you code.
          </div>
        </div>
      </div>
    </aside>

    <!-- Top App Bar & Branding (Clean Header with Hamburger & Avatar) -->
    <div class="copilot-brand-row">
      <div class="copilot-brand-left-group">
        <button class="top-app-bar__icon-btn" id="copilot-drawer-toggle" aria-label="Open Navigation Menu" title="Menu">
          <i data-lucide="menu"></i>
        </button>
        <div class="profile-brand-left" style="cursor:pointer;" onclick="window.location.hash='/home'">
          <img src="/logo.png" alt="SYBRAI Logo" class="profile-brand-logo" />
          <div>
            <div class="profile-brand-title">SYBRAI</div>
            <div class="profile-brand-sub">AI BUG FIXER & ANALYZER</div>
          </div>
        </div>
      </div>

      <div class="copilot-brand-actions">
        <button class="top-app-bar__icon-btn" id="copilot-history-btn" aria-label="Chat Records" title="Chat History" onclick="window.location.hash='/records'">
          <i data-lucide="clock"></i>
        </button>
        <button class="top-app-bar__icon-btn" id="copilot-new-btn" aria-label="New Chat" title="Start New Chat">
          <i data-lucide="message-square-plus"></i>
        </button>
        <button class="top-app-bar__icon-btn" id="copilot-settings-btn" aria-label="AI Engine Settings" title="AI Settings">
          <i data-lucide="settings"></i>
        </button>
        <img src="${userProfile.avatar || '/avatar.jpg'}" alt="${userProfile.name}" class="copilot-user-avatar" onclick="window.location.hash='/profile'" title="${userProfile.name}" />
      </div>
    </div>

    <!-- Hero Banner with 3D Robot Mascot (Matches Image 2) -->
    <div class="copilot-hero">
      <div class="copilot-hero-body">
        <div class="copilot-hero-text">
          <h1 class="copilot-hero-title">SYBRAI AI</h1>
          <div class="copilot-hero-subtitle">Ask. Analyze. Fix. Learn. ✨</div>
          <p class="copilot-hero-desc">Your intelligent coding assistant for faster, safer, and better apps.</p>
        </div>
        <div class="copilot-hero-mascot-area">
          <div class="copilot-floating-badge">Turn Bugs into Better Apps ✨</div>
          <div class="copilot-mascot-img-wrap">
            <img src="/robot-mascot.jpg" alt="SYBRAI AI Robot" class="copilot-mascot-img" onerror="this.src='/logo.png'" />
          </div>
          <div class="copilot-hero-features">
            <div class="copilot-hero-feature-item">
              <i data-lucide="bar-chart-2" style="width:12px;height:12px;color:#2563EB;"></i>
              <span>Analyze</span>
            </div>
            <div class="copilot-hero-feature-item">
              <i data-lucide="wrench" style="width:12px;height:12px;color:#7C3AED;"></i>
              <span>Fix Automatically</span>
            </div>
            <div class="copilot-hero-feature-item">
              <i data-lucide="book-open" style="width:12px;height:12px;color:#0284C7;"></i>
              <span>Explain</span>
            </div>
            <div class="copilot-hero-feature-item">
              <i data-lucide="check-circle-2" style="width:12px;height:12px;color:#10B981;"></i>
              <span>Suggest Best Practices</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Horizontal Category Filter Chips (1-Tap Quick Assist) -->
    <div class="copilot-filter-chips-wrap">
      <div class="copilot-filter-chips">
        <button class="copilot-filter-chip active" data-q="all">
          <i data-lucide="sparkles" style="width:12px;height:12px;"></i>
          <span>All</span>
        </button>
        <button class="copilot-filter-chip" data-scenario="null-pointer" data-q="Fix an Error">
          <i data-lucide="wrench" style="width:12px;height:12px;"></i>
          <span>Fix Error</span>
        </button>
        <button class="copilot-filter-chip" data-scenario="api-failure" data-q="Analyze Code">
          <i data-lucide="code-2" style="width:12px;height:12px;"></i>
          <span>Analyze Code</span>
        </button>
        <button class="copilot-filter-chip" data-q="Explain Android lifecycle hooks">
          <i data-lucide="book-open" style="width:12px;height:12px;"></i>
          <span>Explain Code</span>
        </button>
        <button class="copilot-filter-chip" data-scenario="performance" data-q="Optimize performance">
          <i data-lucide="zap" style="width:12px;height:12px;"></i>
          <span>Optimize</span>
        </button>
        <button class="copilot-filter-chip" data-scenario="security" data-q="Security Check">
          <i data-lucide="shield-check" style="width:12px;height:12px;"></i>
          <span>Security</span>
        </button>
        <button class="copilot-filter-chip" data-q="Suggest best practices">
          <i data-lucide="lightbulb" style="width:12px;height:12px;"></i>
          <span>Best Practices</span>
        </button>
      </div>
    </div>

    <!-- Main Chat Conversation Canvas -->
    <div class="copilot-chat-canvas" id="copilot-chat-thread">
      ${renderChatThread()}
    </div>

    <!-- Bottom Fixed Input Bar (Clean, User-Friendly like ChatGPT & Sybrai) -->
    <div class="copilot-input-container">
      <div class="copilot-input-bar">
        <button class="copilot-attach-btn" id="copilot-attach-btn" title="Attach code or crash log" aria-label="Attach code or log">
          <i data-lucide="paperclip" style="width:18px;height:18px;"></i>
        </button>
        <input type="text" class="copilot-text-input" id="copilot-user-input" placeholder="Ask SYBRAI anything..." autocomplete="off" />
        <button class="copilot-mic-btn" id="copilot-mic-toggle" title="Voice Input (Speech-to-Text)" aria-label="Voice input">
          <i data-lucide="mic" style="width:18px;height:18px;"></i>
        </button>
        <button class="copilot-send-btn" id="copilot-submit-btn" title="Send query" aria-label="Send">
          <i data-lucide="send" style="width:16px;height:16px;"></i>
        </button>
      </div>
      <div class="copilot-input-subtext">
        <span>SYBRAI AI can make mistakes. Verify important code fixes.</span>
      </div>
    </div>
  `;

  setTimeout(() => setupCopilotInteractions(screen), 50);
  return screen;
}

function renderChatThread() {
  if (!conversation || conversation.length === 0) {
    // Empty state - Welcoming and user-friendly (Image 1 ChatGPT style)
    return `
      <div class="copilot-empty-state">
        <div class="copilot-empty-mascot-wrap">
          <img src="/robot-mascot.jpg" alt="SYBRAI Robot" class="copilot-empty-mascot" onerror="this.src='/logo.png'" />
        </div>
        <h2 class="copilot-empty-title">How can I help you today?</h2>
        <p class="copilot-empty-sub">Ask a question, paste an error log, or choose a quick start below:</p>

        <div class="copilot-starter-grid">
          <div class="copilot-starter-card" data-scenario="null-pointer">
            <div class="copilot-starter-icon" style="color:#EF4444; background:rgba(239,68,68,0.1);">
              <i data-lucide="alert-octagon" style="width:18px;height:18px;"></i>
            </div>
            <div class="copilot-starter-info">
              <div class="copilot-starter-name">Fix an Error / Crash</div>
              <div class="copilot-starter-sample">"Why is my app crashing on splash screen?"</div>
            </div>
          </div>

          <div class="copilot-starter-card" data-scenario="api-failure">
            <div class="copilot-starter-icon" style="color:#2563EB; background:rgba(37,99,235,0.1);">
              <i data-lucide="cloud-lightning" style="width:18px;height:18px;"></i>
            </div>
            <div class="copilot-starter-info">
              <div class="copilot-starter-name">Analyze API & Network</div>
              <div class="copilot-starter-sample">"Handle HTTP 500 error & retry logic"</div>
            </div>
          </div>

          <div class="copilot-starter-card" data-scenario="performance">
            <div class="copilot-starter-icon" style="color:#F59E0B; background:rgba(245,158,11,0.1);">
              <i data-lucide="zap" style="width:18px;height:18px;"></i>
            </div>
            <div class="copilot-starter-info">
              <div class="copilot-starter-name">Optimize Performance</div>
              <div class="copilot-starter-sample">"Fix UI freezing and skipped frames"</div>
            </div>
          </div>

          <div class="copilot-starter-card" data-scenario="security">
            <div class="copilot-starter-icon" style="color:#10B981; background:rgba(16,185,129,0.1);">
              <i data-lucide="shield-alert" style="width:18px;height:18px;"></i>
            </div>
            <div class="copilot-starter-info">
              <div class="copilot-starter-name">Security Check</div>
              <div class="copilot-starter-sample">"Scan for SQL injection & secret leaks"</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return conversation.map((msg) => {
    if (msg.role === 'user') {
      return `
        <div class="copilot-msg copilot-msg--user" id="${msg.id}">
          <div class="copilot-msg-avatar copilot-msg-avatar--user">
            <i data-lucide="user" style="width:16px;height:16px;"></i>
          </div>
          <div class="copilot-msg-bubble">
            <div>${escapeHtml(msg.text)}</div>
            <div class="copilot-msg-time">
              <span>${msg.time}</span>
              <i data-lucide="check-check" style="width:12px;height:12px;color:#2563EB;"></i>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="copilot-msg copilot-msg--ai" id="${msg.id}">
          <div class="copilot-msg-avatar copilot-msg-avatar--ai">
            <img src="/robot-mascot.jpg" alt="AI" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='/logo.png'" />
          </div>
          <div class="copilot-msg-bubble">
            <div class="copilot-ai-text">${formatAiText(msg.text)}</div>
            <div class="copilot-msg-time">
              <span>${msg.time}</span>
            </div>

            ${msg.hasIssueCard && msg.issueData ? `
              <!-- Detected Issue Card (Matches Image 2) -->
              <div class="copilot-issue-card">
                <div class="copilot-issue-header">
                  <div class="copilot-issue-title">
                    <i data-lucide="code-2" style="width:16px;height:16px;color:#EF4444;"></i>
                    <span>Detected Issue</span>
                  </div>
                  <span class="copilot-badge-${msg.issueData.badgeClass || 'danger'}">
                    <span class="copilot-dot-indicator"></span>
                    <span>${escapeHtml(msg.issueData.type)}</span>
                  </span>
                </div>
                <div class="copilot-log-snippet">${escapeHtml(msg.issueData.log)}</div>
              </div>
            ` : ''}

            ${msg.hasFixCard && msg.fixData ? `
              <!-- Suggested Fix Card (Matches Image 2 with interactive Before/After) -->
              <div class="copilot-fix-card">
                <div class="copilot-fix-header">
                  <div class="copilot-fix-title">
                    <i data-lucide="sparkles" style="width:16px;height:16px;color:#10B981;"></i>
                    <span>Suggested Fix (Auto-Fix Available)</span>
                  </div>
                  <span class="copilot-badge-safe">
                    <i data-lucide="check" style="width:11px;height:11px;"></i>
                    <span>${msg.fixData.isApplied ? 'Applied' : (msg.fixData.safeBadge || 'Safe Fix')}</span>
                  </span>
                </div>

                <!-- Diff Tabs -->
                <div class="copilot-diff-tab-bar" data-msg-id="${msg.id}">
                  <button class="copilot-diff-tab-btn ${activeTabDiff === 'both' ? 'active' : ''}" data-tab="both">Before / After</button>
                  <button class="copilot-diff-tab-btn ${activeTabDiff === 'before' ? 'active' : ''}" data-tab="before">Before</button>
                  <button class="copilot-diff-tab-btn ${activeTabDiff === 'after' ? 'active' : ''}" data-tab="after">After</button>
                </div>

                <!-- Diff Code Grid -->
                <div class="copilot-diff-grid copilot-diff-grid--${activeTabDiff}">
                  <div class="copilot-diff-pane copilot-diff-pane--before" style="${activeTabDiff === 'after' ? 'display:none;' : ''}">
                    <div class="copilot-diff-label">
                      <span>Before (${msg.fixData.file || 'Source'})</span>
                      <button class="copilot-diff-copy-btn" data-copy="${escapeHtml(msg.fixData.beforeCode)}" title="Copy Before code">
                        <i data-lucide="copy" style="width:12px;height:12px;"></i>
                      </button>
                    </div>
                    <pre class="copilot-code-block copilot-code-block--before">${escapeHtml(msg.fixData.beforeCode)}</pre>
                  </div>

                  <div class="copilot-diff-pane copilot-diff-pane--after" style="${activeTabDiff === 'before' ? 'display:none;' : ''}">
                    <div class="copilot-diff-label">
                      <span style="color:#10B981;">After (${msg.fixData.file || 'Patched'})</span>
                      <button class="copilot-diff-copy-btn" data-copy="${escapeHtml(msg.fixData.afterCode)}" title="Copy After code">
                        <i data-lucide="copy" style="width:12px;height:12px;"></i>
                      </button>
                    </div>
                    <pre class="copilot-code-block copilot-code-block--after">${escapeHtml(msg.fixData.afterCode)}</pre>
                  </div>
                </div>

                <!-- Auto Fix CTA Button -->
                <button class="copilot-autofix-cta ${msg.fixData.isApplied ? 'copilot-autofix-cta--applied' : ''}" data-msg-id="${msg.id}">
                  <i data-lucide="${msg.fixData.isApplied ? 'check-circle' : 'sparkles'}" style="width:16px;height:16px;"></i>
                  <span>${msg.fixData.isApplied ? 'Fix Applied Successfully' : 'Auto Fix This Issue'}</span>
                  <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
                </button>

                <!-- Sub-Actions -->
                <div class="copilot-sub-actions">
                  <button class="copilot-sub-btn" data-action="explain" data-msg-id="${msg.id}">
                    <i data-lucide="book-open" style="width:12px;height:12px;"></i>
                    <span>Explain Fix</span>
                  </button>
                  <button class="copilot-sub-btn" data-action="diff" data-msg-id="${msg.id}">
                    <i data-lucide="git-commit" style="width:12px;height:12px;"></i>
                    <span>View Full Diff</span>
                  </button>
                  <button class="copilot-sub-btn" data-action="manual" data-msg-id="${msg.id}">
                    <i data-lucide="settings" style="width:12px;height:12px;"></i>
                    <span>Apply Manually</span>
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- You can also ask suggestion pills (Matches Image 2) -->
            ${msg.followUps && msg.followUps.length > 0 ? `
              <div class="copilot-suggestions-wrap">
                <div class="copilot-suggestions-title">You can also ask</div>
                <div class="copilot-suggestions-pills">
                  ${msg.followUps.map(chip => `
                    <button class="copilot-suggest-chip" data-q="${escapeHtml(chip)}">${escapeHtml(chip)}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
  }).join('');
}

function setupCopilotInteractions(screen) {
  if (window.lucide) lucide.createIcons();

  const thread = screen.querySelector('#copilot-chat-thread');
  const inputEl = screen.querySelector('#copilot-user-input');
  const sendBtn = screen.querySelector('#copilot-submit-btn');
  const micBtn = screen.querySelector('#copilot-mic-toggle');
  const attachBtn = screen.querySelector('#copilot-attach-btn');
  const drawer = screen.querySelector('#copilot-drawer');
  const drawerBackdrop = screen.querySelector('#copilot-drawer-backdrop');
  const drawerToggle = screen.querySelector('#copilot-drawer-toggle');
  const drawerClose = screen.querySelector('#copilot-drawer-close');

  // --- Drawer Open / Close ---
  const openDrawer = () => {
    isDrawerOpen = true;
    drawer?.classList.add('open');
    drawerBackdrop?.classList.add('open');
  };
  const closeDrawer = () => {
    isDrawerOpen = false;
    drawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('open');
  };

  drawerToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  // --- Send Message & Dynamic Assistant Engine ---
  const handleSend = async (customText = null, presetKey = null) => {
    const text = customText || inputEl?.value?.trim();
    if (!text) return;
    if (inputEl) inputEl.value = '';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    conversation.push({
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      time: timeStr
    });

    renderAndUpdateThread();

    // 2. Determine response type dynamically according to user query
    showToast('SYBRAI AI analyzing query...', 'info', 1200);

    // Check if matching preset scenario or keyword analysis
    const lower = text.toLowerCase();
    let responsePayload = null;

    if (presetKey && PRESET_SCENARIOS[presetKey]) {
      responsePayload = PRESET_SCENARIOS[presetKey];
    } else if (lower.includes('crash') || lower.includes('nullpointer') || lower.includes('splash') || lower.includes('null object')) {
      responsePayload = PRESET_SCENARIOS['null-pointer'];
    } else if (lower.includes('api') || lower.includes('500') || lower.includes('network') || lower.includes('timeout') || lower.includes('fetch')) {
      responsePayload = PRESET_SCENARIOS['api-failure'];
    } else if (lower.includes('perform') || lower.includes('lag') || lower.includes('freez') || lower.includes('frame') || lower.includes('slow')) {
      responsePayload = PRESET_SCENARIOS['performance'];
    } else if (lower.includes('secur') || lower.includes('sqli') || lower.includes('injection') || lower.includes('vulnerab') || lower.includes('secret')) {
      responsePayload = PRESET_SCENARIOS['security'];
    } else if (lower.includes('database') || lower.includes('sqlite') || lower.includes('room') || lower.includes('lock')) {
      responsePayload = PRESET_SCENARIOS['database-error'];
    }

    // Try AI service (Gemini or OpenAI if configured)
    let aiText = '';
    const aiConfig = getAiConfig();

    if (aiConfig.isConfigured) {
      try {
        aiText = await chatWithAi(text);
      } catch (err) {
        console.warn('AI service error:', err);
      }
    }

    setTimeout(() => {
      const respTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (responsePayload) {
        // Render rich intelligent card response tailored to query
        conversation.push({
          id: `msg-${Date.now() + 1}`,
          role: 'ai',
          text: aiText || responsePayload.aiText,
          time: respTime,
          hasIssueCard: true,
          hasFixCard: true,
          issueData: responsePayload.issueData,
          fixData: { ...responsePayload.fixData },
          followUps: responsePayload.followUps
        });
      } else {
        // General query response with explanation card & tips
        conversation.push({
          id: `msg-${Date.now() + 1}`,
          role: 'ai',
          text: aiText || generateGeneralCodingAnswer(text),
          time: respTime,
          hasIssueCard: false,
          hasFixCard: false,
          followUps: [
            'How does this fix work?',
            'Show code implementation',
            'Suggest best practices'
          ]
        });
      }

      renderAndUpdateThread();
    }, 600);
  };

  const renderAndUpdateThread = () => {
    if (thread) {
      thread.innerHTML = renderChatThread();
      if (window.lucide) lucide.createIcons();
      attachMessageEvents(screen);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  sendBtn?.addEventListener('click', () => handleSend());
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // --- Voice Input (Speech Recognition) ---
  micBtn?.addEventListener('click', () => {
    if (isCurrentlyTranscribing()) {
      stopLiveTranscription();
      micBtn.classList.remove('active');
      showToast('Voice transcription stopped', 'info', 1000);
    } else {
      startLiveTranscription({
        onTranscriptDelta: (delta, full) => {
          if (inputEl) inputEl.value = full;
        },
        onError: (err) => {
          showToast(err, 'warning');
          micBtn.classList.remove('active');
        }
      });
      micBtn.classList.add('active');
      showToast('Listening... Speak your coding issue 🎙️', 'info', 1500);
    }
  });

  // --- Attachment Button ---
  attachBtn?.addEventListener('click', () => {
    openAttachmentModal();
  });

  // --- New Chat & Clear Session ---
  const startNewChat = () => {
    conversation = [];
    renderAndUpdateThread();
    closeDrawer();
    showToast('Started a fresh AI Chat session ✨', 'success', 1500);
  };

  screen.querySelector('#copilot-new-btn')?.addEventListener('click', startNewChat);
  screen.querySelector('#drawer-new-chat-btn')?.addEventListener('click', startNewChat);

  // --- Settings Button ---
  screen.querySelector('#copilot-settings-btn')?.addEventListener('click', openAiSettingsModal);

  // --- Category Chips Bar ---
  screen.querySelectorAll('.copilot-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      screen.querySelectorAll('.copilot-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const scenario = chip.dataset.scenario;
      const q = chip.dataset.q;
      if (q === 'all') {
        // Keep conversation as-is
        renderAndUpdateThread();
      } else if (scenario) {
        handleSend(PRESET_SCENARIOS[scenario].userText, scenario);
      } else if (q) {
        handleSend(q);
      }
    });
  });

  // --- Drawer Items Click ---
  screen.querySelectorAll('.copilot-side-item, .copilot-recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const scenario = item.dataset.scenario;
      const q = item.dataset.q;
      closeDrawer();
      if (scenario && PRESET_SCENARIOS[scenario]) {
        handleSend(PRESET_SCENARIOS[scenario].userText, scenario);
      } else if (q) {
        handleSend(q);
      }
    });
  });

  screen.querySelector('#drawer-view-all-records')?.addEventListener('click', () => {
    closeDrawer();
    window.location.hash = '/records';
  });

  attachMessageEvents(screen);
}

function attachMessageEvents(screen) {
  // 1. Suggestion Chips ("You can also ask")
  screen.querySelectorAll('.copilot-suggest-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      const input = screen.querySelector('#copilot-user-input');
      if (input) input.value = q;
      screen.querySelector('#copilot-submit-btn')?.click();
    });
  });

  // 2. Starter Cards (Empty State)
  screen.querySelectorAll('.copilot-starter-card').forEach(card => {
    card.addEventListener('click', () => {
      const scenario = card.dataset.scenario;
      if (scenario && PRESET_SCENARIOS[scenario]) {
        const input = screen.querySelector('#copilot-user-input');
        if (input) input.value = PRESET_SCENARIOS[scenario].userText;
        screen.querySelector('#copilot-submit-btn')?.click();
      }
    });
  });

  // 3. Diff Tab Bar (Before / After / Both)
  screen.querySelectorAll('.copilot-diff-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = btn.dataset.tab;
      activeTabDiff = tab;

      const parentBar = btn.closest('.copilot-diff-tab-bar');
      parentBar.querySelectorAll('.copilot-diff-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const fixCard = btn.closest('.copilot-fix-card');
      if (fixCard) {
        const beforePane = fixCard.querySelector('.copilot-diff-pane--before');
        const afterPane = fixCard.querySelector('.copilot-diff-pane--after');
        const grid = fixCard.querySelector('.copilot-diff-grid');

        grid.className = `copilot-diff-grid copilot-diff-grid--${tab}`;
        if (tab === 'both') {
          if (beforePane) beforePane.style.display = 'block';
          if (afterPane) afterPane.style.display = 'block';
        } else if (tab === 'before') {
          if (beforePane) beforePane.style.display = 'block';
          if (afterPane) afterPane.style.display = 'none';
        } else if (tab === 'after') {
          if (beforePane) beforePane.style.display = 'none';
          if (afterPane) afterPane.style.display = 'block';
        }
      }
    });
  });

  // 4. Auto-Fix Button (Primary Action from Image 2)
  screen.querySelectorAll('.copilot-autofix-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const msgId = btn.dataset.msgId;
      const targetMsg = conversation.find(m => m.id === msgId);
      if (targetMsg && targetMsg.fixData) {
        targetMsg.fixData.isApplied = true;
      }

      btn.classList.add('copilot-autofix-cta--applied');
      btn.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;"></i><span>Fix Applied to Codebase!</span><i data-lucide="sparkles" style="width:14px;height:14px;"></i>`;
      showToast('Fix successfully applied to target file! 🎉 Verified safe.', 'success', 2500);

      // Update badge in header
      const fixCard = btn.closest('.copilot-fix-card');
      const badge = fixCard?.querySelector('.copilot-badge-safe');
      if (badge) {
        badge.innerHTML = `<i data-lucide="check" style="width:11px;height:11px;"></i><span>Applied</span>`;
      }

      if (window.lucide) lucide.createIcons();
    });
  });

  // 5. Copy Code Buttons
  screen.querySelectorAll('.copilot-diff-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.copy;
      if (code) {
        navigator.clipboard.writeText(code);
        showToast('Code snippet copied to clipboard! 📋', 'success', 1500);
      }
    });
  });

  // 6. Sub-action buttons (Explain Fix, View Full Diff, Apply Manually)
  screen.querySelectorAll('.copilot-sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const msgId = btn.dataset.msgId;
      const targetMsg = conversation.find(m => m.id === msgId);

      if (action === 'explain') {
        showToast('Opening in-depth architectural explanation 📖', 'info', 1500);
        window.location.hash = '/learning';
      } else if (action === 'diff') {
        openFullDiffModal(targetMsg);
      } else if (action === 'manual') {
        if (targetMsg?.fixData?.afterCode) {
          navigator.clipboard.writeText(targetMsg.fixData.afterCode);
          showToast('Patched code copied! Paste directly into your editor 📋', 'success', 2000);
        }
      }
    });
  });
}

function generateGeneralCodingAnswer(query) {
  return `I reviewed your query: **"${query}"**.\n\n### 💡 Key Recommendations:\n1. **State Isolation**: Ensure reactive dependencies trigger re-renders only when relevant primitives change.\n2. **Defensive Guards**: Add null/undefined validation checks prior to invoking native method calls.\n3. **Asynchronous Execution**: Offload expensive file I/O or network serialization from the UI thread to background workers.\n\nWould you like me to generate a tailored fix patch or create unit tests for this?`;
}

function openFullDiffModal(msg) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const before = msg?.fixData?.beforeCode || '// Original code';
  const after = msg?.fixData?.afterCode || '// Patched code';
  const file = msg?.fixData?.file || 'MainActivity.java';

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="copilot-diff-backdrop">
      <div class="modal-sheet" role="dialog" style="max-height:85vh;">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="git-commit" style="color:var(--color-primary);"></i> Unified Diff: ${file}
          </h2>
          <button class="modal-sheet__close" id="modal-diff-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body" style="padding:16px;">
          <div style="font-size:11px; font-weight:600; color:var(--color-text-secondary); margin-bottom:8px;">
            Showing changes for automated patch verification
          </div>
          <div style="background:#0F172A; border-radius:12px; padding:12px; font-family:var(--font-mono); font-size:11px; color:#F8FAFC; overflow-x:auto;">
            <div style="color:#EF4444; margin-bottom:8px;">--- ${file} (Original)</div>
            <pre style="margin:0; color:#FCA5A5; white-space:pre-wrap;">${escapeHtml(before)}</pre>
            <div style="color:#10B981; margin:12px 0 8px;">+++ ${file} (Fixed & Hardened)</div>
            <pre style="margin:0; color:#86EFAC; white-space:pre-wrap;">${escapeHtml(after)}</pre>
          </div>
          <button class="btn btn--primary btn--full" id="modal-diff-apply-btn" style="margin-top:16px; padding:12px; font-weight:700;">
            <i data-lucide="check-circle"></i> Confirm & Auto-Apply
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-diff-close')?.addEventListener('click', close);
  modalContainer.querySelector('#copilot-diff-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'copilot-diff-backdrop') close();
  });
  modalContainer.querySelector('#modal-diff-apply-btn')?.addEventListener('click', () => {
    if (msg?.fixData) msg.fixData.isApplied = true;
    showToast('Diff patch applied successfully! 🎉', 'success', 2000);
    close();
  });
}

function openAttachmentModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="copilot-attach-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="paperclip" style="color:var(--color-primary);"></i> Attach Code or Crash Log
          </h2>
          <button class="modal-sheet__close" id="modal-att-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn btn--secondary btn--full" id="btn-attach-log" style="justify-content:flex-start; gap:10px; padding:12px;">
              <i data-lucide="file-text" style="color:#EF4444;"></i>
              <div style="text-align:left;">
                <div style="font-weight:700; font-size:13px;">Attach Android Crash Log</div>
                <div style="font-size:10.5px; color:var(--color-text-secondary);">Logcat stack trace with NullPointerException</div>
              </div>
            </button>
            <button class="btn btn--secondary btn--full" id="btn-attach-code" style="justify-content:flex-start; gap:10px; padding:12px;">
              <i data-lucide="code-2" style="color:#2563EB;"></i>
              <div style="text-align:left;">
                <div style="font-weight:700; font-size:13px;">Attach Active File (MainActivity.java)</div>
                <div style="font-size:10.5px; color:var(--color-text-secondary);">Include syntax tree & lifecycle methods</div>
              </div>
            </button>
            <button class="btn btn--secondary btn--full" id="btn-attach-sec" style="justify-content:flex-start; gap:10px; padding:12px;">
              <i data-lucide="shield-alert" style="color:#F59E0B;"></i>
              <div style="text-align:left;">
                <div style="font-weight:700; font-size:13px;">Attach Security Scan Report</div>
                <div style="font-size:10.5px; color:var(--color-text-secondary);">OWASP Top 10 automated vulnerability check</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-att-close')?.addEventListener('click', close);
  modalContainer.querySelector('#copilot-attach-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'copilot-attach-backdrop') close();
  });

  modalContainer.querySelector('#btn-attach-log')?.addEventListener('click', () => {
    const input = document.getElementById('copilot-user-input');
    if (input) input.value = 'I attached MainActivity crash log: java.lang.NullPointerException at onCreate. Please fix.';
    close();
    showToast('Logcat crash trace attached 📎', 'success', 1500);
  });
  modalContainer.querySelector('#btn-attach-code')?.addEventListener('click', () => {
    const input = document.getElementById('copilot-user-input');
    if (input) input.value = 'Analyze MainActivity.java for uninitialized view references.';
    close();
    showToast('MainActivity.java attached 📎', 'success', 1500);
  });
  modalContainer.querySelector('#btn-attach-sec')?.addEventListener('click', () => {
    const input = document.getElementById('copilot-user-input');
    if (input) input.value = 'Conduct a vulnerability and secrets audit on authController.js.';
    close();
    showToast('Security audit payload attached 📎', 'success', 1500);
  });
}

function openAiSettingsModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const current = getAiConfig();

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="copilot-ai-backdrop">
      <div class="modal-sheet" role="dialog">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header">
          <h2 class="modal-sheet__title">
            <i data-lucide="sparkles" style="color:var(--color-primary);"></i> AI Engine Settings
          </h2>
          <button class="modal-sheet__close" id="modal-c-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-sheet__body">
          <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Provider</label>
          <select id="cfg-ai-p" class="form-select" style="width:100%; padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); margin-bottom:12px;">
            <option value="gemini" ${current.provider === 'gemini' ? 'selected' : ''}>Google Gemini (Recommended)</option>
            <option value="openai" ${current.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
          </select>

          <label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Model</label>
          <select id="cfg-ai-m" class="form-select" style="width:100%; padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface); margin-bottom:12px;">
            <option value="gemini-2.0-flash" ${current.model === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Next-Gen Fast)</option>
            <option value="gemini-1.5-pro" ${current.model === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Deep Reasoning)</option>
            <option value="gpt-5.6-luna" ${current.model === 'gpt-5.6-luna' ? 'selected' : ''}>gpt-5.6-luna (OpenAI Luna)</option>
          </select>

          <button class="btn btn--primary btn--full" id="save-c-ai-btn" style="padding:11px; font-weight:600;">
            <i data-lucide="check"></i> Save & Connect
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-c-close')?.addEventListener('click', close);
  modalContainer.querySelector('#copilot-ai-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'copilot-ai-backdrop') close();
  });
  modalContainer.querySelector('#save-c-ai-btn')?.addEventListener('click', () => {
    const provider = modalContainer.querySelector('#cfg-ai-p').value;
    const model = modalContainer.querySelector('#cfg-ai-m').value;
    saveAiConfig({ provider, model });
    showToast('AI Engine configured successfully! ⚡', 'success', 1500);
    close();
  });
}

function formatAiText(str) {
  if (!str) return '';
  // Basic markdown bold & bullet formatting
  let formatted = escapeHtml(str);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
