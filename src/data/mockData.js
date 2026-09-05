// ============================================
// SYBRAI — Mock Data
// Demo data for all screens
// ============================================

export const userProfile = {
  name: 'Abbu Saikiran',
  email: 'info@sybrai.com',
  initials: 'AS',
  badge: 'Pro User',
  tagline: 'Building secure apps with AI 🚀',
  avatar: '/avatar.jpg',
  stats: {
    analyses: 24,
    issuesFixed: 18,
    projects: 5,
    avgScore: 92
  }
};

export const chatConversation = [
  {
    id: 1,
    type: 'ai',
    text: 'Hello! I\'m SYBRAI. How can I help you today? 👋\n\nI can analyze bugs, fix issues, and help you learn from past debugging sessions.',
    time: '10:30 AM',
  },
  {
    id: 2,
    type: 'user',
    text: 'My app crashes when I click the login button.',
    time: '10:31 AM',
  },
  {
    id: 3,
    type: 'ai',
    text: 'I found 3 possible issues:\n\n1. Null pointer exception in `MainActivity.java`\n2. API response handling error in `AuthService.js`\n3. Incorrect data parsing in `UserModel.kt`\n\nShall I fix them automatically?',
    time: '10:31 AM',
    actions: ['Show Details', 'Auto Fix'],
  },
];

export const copilotConversation = [
  {
    id: 1,
    type: 'ai',
    text: 'Hello! I\'m SYBRAI. How can I help you today? 🤖',
    time: '2:00 PM',
  },
  {
    id: 2,
    type: 'user',
    text: 'Why is my app crashing on the splash screen?',
    time: '2:01 PM',
  },
  {
    id: 3,
    type: 'ai',
    text: 'It looks like a null pointer exception in `MainActivity`. The `onCreate` method is referencing a view that hasn\'t been inflated yet.\n\nWould you like me to fix it?',
    time: '2:01 PM',
  },
  {
    id: 4,
    type: 'user',
    text: 'Yes, please fix it.',
    time: '2:02 PM',
  },
  {
    id: 5,
    type: 'ai',
    text: 'Issue fixed successfully! 🎉\n\nYou can check the result in the Analysis section. The fix moved the view reference after `setContentView()` call.',
    time: '2:02 PM',
  },
];

export const sessions = [
  {
    id: 1,
    title: 'Login Crash',
    time: 'Today, 10:30 AM',
    status: 'fixed',
    dot: 'fixed',
  },
  {
    id: 2,
    title: 'Payment Failure',
    time: 'Today, 09:15 AM',
    status: 'fixed',
    dot: 'fixed',
  },
  {
    id: 3,
    title: 'UI Not Responsive',
    time: 'Yesterday, 05:40 PM',
    status: 'warning',
    dot: 'warning',
  },
  {
    id: 4,
    title: 'Database Connection Error',
    time: 'Yesterday, 02:20 PM',
    status: 'fixed',
    dot: 'fixed',
  },
  {
    id: 5,
    title: 'Memory Leak Detected',
    time: 'Sep 2, 11:00 AM',
    status: 'error',
    dot: 'error',
  },
  {
    id: 6,
    title: 'API Timeout',
    time: 'Sep 2, 08:30 AM',
    status: 'fixed',
    dot: 'fixed',
  },
  {
    id: 7,
    title: 'Image Loading Issue',
    time: 'Sep 1, 04:15 PM',
    status: 'warning',
    dot: 'warning',
  },
  {
    id: 8,
    title: 'Authentication Token Expired',
    time: 'Sep 1, 10:00 AM',
    status: 'fixed',
    dot: 'fixed',
  },
];

export const analysisData = {
  score: 88,
  maxScore: 100,
  label: 'Security Posture: Protected (OWASP Top 10 Aligned)',
  stats: {
    found: 3,
    fixed: 14,
    warnings: 2,
  },
};

export const consoleLines = [
  { type: 'info', text: '[09:30:01] [SOC-MONITOR] Autonomous Threat Agent initialized' },
  { type: 'dim', text: '[09:30:02] [AGENT-HANDOFF] Triage -> VulnerabilityAuditorAgent' },
  { type: 'default', text: '[09:30:04] [OWASP-SCAN] Auditing 142 source files for secrets & CVEs...' },
  { type: 'error', text: '[09:30:05] [ALERT] CWE-798: High-entropy API key detected in client bundle' },
  { type: 'warning', text: '[09:30:06] [WARN] CWE-942: Permissive Access-Control-Allow-Origin: *' },
  { type: 'info', text: '[09:30:07] [GUARDRAIL] Human approval enforced before token revocation' },
  { type: 'default', text: '[09:30:08] [HOTPATCH] Applying parameterized query patch to auth route' },
  { type: 'info', text: '[09:30:09] [DEFENSE-PASS] Content-Security-Policy (CSP) active' },
  { type: 'info', text: '[09:30:10] [STATUS] 14 vulnerabilities mitigated, 0 critical active exploits' },
];

export const debugSections = [
  {
    title: 'OWASP A01: Broken Access Control',
    status: 'pass',
    icon: 'shield-check',
    details: 'Tenant ID validation enforced on all user route handlers. IDOR/BOLA attacks blocked.',
  },
  {
    title: 'OWASP A02: Cryptographic Failures & Secrets',
    status: 'fail',
    icon: 'key-round',
    details: 'CWE-798: Secret key found in apiClient.js. Immediate server-side env isolation required.',
  },
  {
    title: 'OWASP A03: Injection (SQLi & Command)',
    status: 'pass',
    icon: 'database',
    details: 'CWE-89: All database queries utilize parameterized prepared statements. Raw concatenation forbidden.',
  },
  {
    title: 'OWASP A05: Security Misconfiguration',
    status: 'pass',
    icon: 'sliders',
    details: 'CORS whitelist configured. Strict-Transport-Security (HSTS) and X-Frame-Options active.',
  },
  {
    title: 'OWASP A07: Authentication & Session Integrity',
    status: 'pass',
    icon: 'lock',
    details: 'JWT tokens use RS256 with 15-minute expiration and secure HttpOnly cookie flags.',
  },
];

export const learningResources = [
  {
    title: 'Defending against SQL Injection (CWE-89)',
    desc: 'Deep dive into prepared statements and ORM security best practices.',
    icon: 'database',
  },
  {
    title: 'Zero-Trust Secrets Management (CWE-798)',
    desc: 'How to prevent API keys and private tokens from leaking into client bundles.',
    icon: 'shield',
  },
  {
    title: 'Cross-Site Scripting (XSS) Prevention',
    desc: 'Context-aware output encoding and strict Content Security Policy (CSP).',
    icon: 'code',
  },
  {
    title: 'JWT Authentication & Session Hardening',
    desc: 'Mitigating session hijacking, algorithm confusion, and replay attacks.',
    icon: 'lock',
  },
  {
    title: 'OWASP Mobile Top 10 Security Checklist',
    desc: 'Essential security guidelines for Android & iOS mobile applications.',
    icon: 'smartphone',
  },
];

export const notifications = [
  {
    id: 1,
    title: 'Bug Fixed Successfully',
    desc: 'The null pointer exception in MainActivity has been resolved.',
    time: '2 min ago',
    icon: 'check-circle',
    unread: true,
    type: 'success',
  },
  {
    id: 2,
    title: 'New Warning Detected',
    desc: 'Potential memory leak found in ImageCache module.',
    time: '15 min ago',
    icon: 'alert-triangle',
    unread: true,
    type: 'warning',
  },
  {
    id: 3,
    title: 'Analysis Complete',
    desc: 'Full project scan completed. Score: 92/100.',
    time: '1 hour ago',
    icon: 'bar-chart-2',
    unread: false,
    type: 'info',
  },
  {
    id: 4,
    title: 'Payment Failure Fixed',
    desc: 'API error handling added to payment flow.',
    time: '3 hours ago',
    icon: 'check-circle',
    unread: false,
    type: 'success',
  },
  {
    id: 5,
    title: 'Welcome to SYBRAI',
    desc: 'Get started by describing your first bug.',
    time: 'Yesterday',
    icon: 'zap',
    unread: false,
    type: 'info',
  },
];
