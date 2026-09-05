// ============================================
// SYBRAI — Mock Data
// Demo data for all screens
// ============================================

export const userProfile = {
  name: 'John Developer',
  email: 'john.dev@email.com',
  initials: 'JD',
  badge: 'Pro User',
  avatar: null,
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
  score: 92,
  maxScore: 100,
  label: 'Great! Your app is healthy.',
  stats: {
    found: 3,
    fixed: 2,
    warnings: 1,
  },
};

export const consoleLines = [
  { type: 'info', text: '[10:30:01] SYBRAI Engine v1.0.0 initialized' },
  { type: 'dim', text: '[10:30:01] Loading project configuration...' },
  { type: 'default', text: '[10:30:02] Scanning source files... 142 files found' },
  { type: 'default', text: '[10:30:03] Running static analysis...' },
  { type: 'warning', text: '[10:30:04] ⚠ Warning: Unused import in AuthService.js:12' },
  { type: 'error', text: '[10:30:04] ✗ Error: Null reference in MainActivity.java:45' },
  { type: 'error', text: '[10:30:04] ✗ Error: Missing error handler in ApiClient.kt:89' },
  { type: 'warning', text: '[10:30:05] ⚠ Warning: Deprecated API usage in UserModel.kt:23' },
  { type: 'info', text: '[10:30:05] Analysis complete. 2 errors, 2 warnings.' },
  { type: 'default', text: '[10:30:06] Generating fix suggestions...' },
  { type: 'info', text: '[10:30:07] ✓ Fix applied: MainActivity.java:45' },
  { type: 'info', text: '[10:30:07] ✓ Fix applied: ApiClient.kt:89' },
  { type: 'default', text: '[10:30:08] Re-running analysis...' },
  { type: 'info', text: '[10:30:09] ✓ All critical issues resolved.' },
];

export const debugSections = [
  {
    title: 'Null Reference Check',
    status: 'pass',
    icon: 'check-circle',
    details: 'All object references validated. No null pointer risks detected after fix.',
  },
  {
    title: 'API Error Handling',
    status: 'pass',
    icon: 'check-circle',
    details: 'Try-catch blocks added to all API calls. Error responses properly handled.',
  },
  {
    title: 'Memory Management',
    status: 'fail',
    icon: 'alert-circle',
    details: 'Potential memory leak detected in ImageCache. Objects not being released on Activity destroy.',
  },
  {
    title: 'Thread Safety',
    status: 'pass',
    icon: 'check-circle',
    details: 'All shared resources properly synchronized. No race conditions detected.',
  },
];

export const learningResources = [
  {
    title: 'Understanding Null Pointer Exceptions',
    desc: 'Learn how to prevent and handle null references in your code.',
    icon: 'book-open',
  },
  {
    title: 'Best Practices: Error Handling',
    desc: 'Comprehensive guide to building robust error handling patterns.',
    icon: 'shield',
  },
  {
    title: 'Memory Leak Prevention',
    desc: 'Tips and techniques for efficient memory management.',
    icon: 'cpu',
  },
  {
    title: 'API Design Patterns',
    desc: 'Modern approaches to building reliable API integrations.',
    icon: 'globe',
  },
  {
    title: 'Debugging Like a Pro',
    desc: 'Advanced debugging techniques and tools for faster resolution.',
    icon: 'bug',
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
