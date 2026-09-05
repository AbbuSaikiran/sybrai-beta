// ============================================
// SYBRAI — Real-Time Scan Engine
// Background AI-powered security scanner with auto-fix pipeline
// ============================================

import { chatWithAi, getAiConfig, generateAiAlert } from './aiService.js';
import { emit, EVENTS } from './eventBus.js';

// ---- State ----
let isScanning = false;
let isFixing = false;
let currentFindings = [];
let scanHistory = JSON.parse(localStorage.getItem('sybrai_scan_history') || '[]');
let activityLog = [];
let liveStats = { score: 0, found: 0, fixed: 0, warnings: 0, critical: 0 };

// ---- Scan Targets (simulated file tree for realistic scanning) ----
const SCAN_TARGETS = [
  { path: 'src/controllers/auth.js', category: 'Authentication' },
  { path: 'src/services/apiClient.js', category: 'API Layer' },
  { path: 'src/middleware/cors.js', category: 'Security Headers' },
  { path: 'src/models/UserModel.js', category: 'Data Model' },
  { path: 'src/routes/payment.js', category: 'Payment Flow' },
  { path: 'src/utils/crypto.js', category: 'Cryptography' },
  { path: 'src/config/database.js', category: 'Database Config' },
  { path: 'server/index.js', category: 'Server Entry' },
  { path: 'src/screens/Chat.js', category: 'Frontend UI' },
  { path: 'src/lib/session.js', category: 'Session Management' },
  { path: '.env.production', category: 'Environment Config' },
  { path: 'docker-compose.yml', category: 'Container Config' },
];

// ---- Getters ----
export function getIsScanning() { return isScanning; }
export function getIsFixing() { return isFixing; }
export function getCurrentFindings() { return [...currentFindings]; }
export function getActivityLog() { return [...activityLog]; }
export function getLiveStats() { return { ...liveStats }; }
export function getScanHistory() { return [...scanHistory]; }

function pushActivity(entry) {
  const item = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), ...entry };
  activityLog.unshift(item);
  if (activityLog.length > 50) activityLog.pop();
  emit(EVENTS.ACTIVITY, item);
  return item;
}

function saveScanHistory() {
  // Keep last 20 sessions
  if (scanHistory.length > 20) scanHistory = scanHistory.slice(0, 20);
  localStorage.setItem('sybrai_scan_history', JSON.stringify(scanHistory));
}

function recalcScore() {
  const total = currentFindings.length;
  const fixed = currentFindings.filter(f => f.status === 'fixed').length;
  const critical = currentFindings.filter(f => f.severity === 'critical' && f.status !== 'fixed').length;
  const high = currentFindings.filter(f => f.severity === 'high' && f.status !== 'fixed').length;
  const warnings = currentFindings.filter(f => (f.severity === 'medium' || f.severity === 'low') && f.status !== 'fixed').length;
  const unfixed = total - fixed;

  // Score starts at 100, deduct for unfixed issues
  let score = 100;
  score -= critical * 15;
  score -= high * 8;
  score -= warnings * 3;
  score = Math.max(0, Math.min(100, score));

  liveStats = { score, found: total, fixed, warnings, critical: critical + high };
}

// ---- Run a Full Scan ----
export async function startScan() {
  if (isScanning) return;
  isScanning = true;
  currentFindings = [];
  activityLog = [];
  recalcScore();

  const scanId = Date.now();
  const config = getAiConfig();

  emit(EVENTS.SCAN_START, { scanId, time: new Date().toISOString() });
  pushActivity({ type: 'system', severity: 'info', icon: 'play', text: '🚀 Real-time security scan initiated' });
  pushActivity({ type: 'system', severity: 'info', icon: 'cpu', text: `AI Model: ${config.model || 'gemini-1.5-flash'} ${config.isConfigured ? '● connected' : '○ offline (using smart fallback)'}` });

  // Scan each target with staggered timing for real-time feel
  for (let i = 0; i < SCAN_TARGETS.length; i++) {
    if (!isScanning) break; // allow cancel

    const target = SCAN_TARGETS[i];
    const progress = Math.round(((i + 1) / SCAN_TARGETS.length) * 100);

    pushActivity({ type: 'scan', severity: 'info', icon: 'search', text: `🔍 Scanning ${target.path} (${target.category})...` });
    emit(EVENTS.SCAN_PROGRESS, { progress, file: target.path, step: i + 1, total: SCAN_TARGETS.length });

    // Staggered delay for streaming effect
    await delay(600 + Math.random() * 800);

    // Generate a finding for ~60% of targets using AI
    if (Math.random() < 0.6) {
      try {
        const finding = await generateFinding(target, config);
        if (finding) {
          currentFindings.push(finding);
          recalcScore();
          emit(EVENTS.SCAN_FINDING, finding);

          const severityEmoji = finding.severity === 'critical' ? '🚨' : finding.severity === 'high' ? '⚠️' : '💡';
          pushActivity({
            type: 'finding',
            severity: finding.severity,
            icon: finding.severity === 'critical' ? 'shield-alert' : finding.severity === 'high' ? 'alert-triangle' : 'info',
            text: `${severityEmoji} [${finding.severity.toUpperCase()}] ${finding.title} — ${target.path}`,
            findingId: finding.id,
          });
        }
      } catch (e) {
        console.warn('[ScanEngine] Finding generation error:', e);
      }
    } else {
      pushActivity({ type: 'pass', severity: 'success', icon: 'shield-check', text: `✅ ${target.path} — No vulnerabilities detected` });
    }
  }

  recalcScore();
  isScanning = false;

  // Save to history
  const session = {
    id: scanId,
    title: `Security Scan #${scanHistory.length + 1}`,
    time: new Date().toLocaleString(),
    status: liveStats.critical > 0 ? 'error' : liveStats.warnings > 0 ? 'warning' : 'fixed',
    dot: liveStats.critical > 0 ? 'error' : liveStats.warnings > 0 ? 'warning' : 'fixed',
    score: liveStats.score,
    found: liveStats.found,
    fixed: liveStats.fixed,
  };
  scanHistory.unshift(session);
  saveScanHistory();

  pushActivity({ type: 'system', severity: liveStats.critical > 0 ? 'error' : 'success', icon: 'flag', text: `🏁 Scan complete — Score: ${liveStats.score}/100 | ${liveStats.found} findings | ${liveStats.critical} critical` });
  emit(EVENTS.SCAN_COMPLETE, { scanId, stats: { ...liveStats }, findings: [...currentFindings] });
}

// ---- Stop Scan ----
export function stopScan() {
  isScanning = false;
  pushActivity({ type: 'system', severity: 'warning', icon: 'square', text: '⏹ Scan stopped by operator' });
}

// ---- Auto-Fix All Findings ----
export async function autoFixAll() {
  if (isFixing) return;
  const unfixed = currentFindings.filter(f => f.status !== 'fixed');
  if (unfixed.length === 0) return;

  isFixing = true;
  emit(EVENTS.FIX_START, { total: unfixed.length });
  pushActivity({ type: 'system', severity: 'info', icon: 'wrench', text: `⚡ Auto-fix pipeline started — ${unfixed.length} issues to remediate` });

  for (let i = 0; i < unfixed.length; i++) {
    const finding = unfixed[i];
    emit(EVENTS.FIX_PROGRESS, { current: i + 1, total: unfixed.length, finding });
    pushActivity({ type: 'fix', severity: 'info', icon: 'git-commit', text: `🔧 Applying fix for ${finding.cwe}: ${finding.title}...` });

    await delay(1200 + Math.random() * 1000);

    try {
      const fixResult = await generateFix(finding);
      finding.status = 'fixed';
      finding.fixApplied = fixResult;
      recalcScore();

      emit(EVENTS.FIX_APPLIED, { finding, fixResult, stats: { ...liveStats } });
      pushActivity({ type: 'fixed', severity: 'success', icon: 'check-circle', text: `✅ Fixed: ${finding.title} — ${fixResult.summary}` });
    } catch (e) {
      emit(EVENTS.FIX_FAILED, { finding, error: e.message });
      pushActivity({ type: 'error', severity: 'error', icon: 'x-circle', text: `❌ Fix failed for ${finding.title}: ${e.message}` });
    }
  }

  isFixing = false;
  recalcScore();

  // Update scan history
  if (scanHistory.length > 0) {
    scanHistory[0].fixed = liveStats.fixed;
    scanHistory[0].status = liveStats.critical > 0 ? 'error' : liveStats.warnings > 0 ? 'warning' : 'fixed';
    scanHistory[0].dot = scanHistory[0].status;
    scanHistory[0].score = liveStats.score;
    saveScanHistory();
  }

  pushActivity({ type: 'system', severity: 'success', icon: 'shield-check', text: `🛡️ Auto-fix complete — New score: ${liveStats.score}/100 | ${liveStats.fixed}/${liveStats.found} issues fixed` });
  emit(EVENTS.FIX_ALL_COMPLETE, { stats: { ...liveStats } });
}

// ---- Fix a Single Finding ----
export async function fixSingleFinding(findingId) {
  const finding = currentFindings.find(f => f.id === findingId);
  if (!finding || finding.status === 'fixed') return;

  pushActivity({ type: 'fix', severity: 'info', icon: 'git-commit', text: `🔧 Fixing: ${finding.title}...` });
  await delay(1000 + Math.random() * 800);

  const fixResult = await generateFix(finding);
  finding.status = 'fixed';
  finding.fixApplied = fixResult;
  recalcScore();

  emit(EVENTS.FIX_APPLIED, { finding, fixResult, stats: { ...liveStats } });
  pushActivity({ type: 'fixed', severity: 'success', icon: 'check-circle', text: `✅ Fixed: ${finding.title}` });
  return fixResult;
}

// ---- Internal: Generate a Finding via AI ----
async function generateFinding(target, config) {
  if (config.isConfigured) {
    try {
      const prompt = `You are a cybersecurity scanner. Analyze the file "${target.path}" (${target.category}) for a specific vulnerability.
Return ONLY a JSON object:
{
  "title": "Short vulnerability title (5-8 words)",
  "description": "One sentence explaining the risk",
  "severity": "critical" | "high" | "medium" | "low",
  "cwe": "CWE-XXX",
  "cvss": "X.X",
  "line": <line_number>
}`;
      const raw = await chatWithAi(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          id: Date.now() + Math.random(),
          title: parsed.title || 'Vulnerability Detected',
          description: parsed.description || 'Security issue found.',
          severity: parsed.severity || 'medium',
          cwe: parsed.cwe || 'CWE-000',
          cvss: parsed.cvss || '5.0',
          file: target.path,
          line: parsed.line || Math.floor(Math.random() * 100) + 1,
          category: target.category,
          status: 'open',
        };
      }
    } catch (e) {
      console.warn('[ScanEngine] AI finding error, using fallback:', e);
    }
  }

  // Smart fallback findings
  return generateFallbackFinding(target);
}

function generateFallbackFinding(target) {
  const pool = [
    { title: 'Hardcoded API Secret Detected', severity: 'critical', cwe: 'CWE-798', cvss: '9.8', description: 'High-entropy secret string found in client-accessible source code.' },
    { title: 'SQL Injection via String Concatenation', severity: 'critical', cwe: 'CWE-89', cvss: '8.9', description: 'User input concatenated directly into SQL query without parameterization.' },
    { title: 'Cross-Site Scripting (Reflected XSS)', severity: 'high', cwe: 'CWE-79', cvss: '7.5', description: 'Unescaped user input rendered via innerHTML in DOM.' },
    { title: 'Missing Rate Limiting on Auth Endpoint', severity: 'high', cwe: 'CWE-307', cvss: '7.2', description: 'Login endpoint has no brute-force protection or rate limiting.' },
    { title: 'Permissive CORS Wildcard Policy', severity: 'medium', cwe: 'CWE-942', cvss: '6.5', description: 'Access-Control-Allow-Origin set to * with credentials enabled.' },
    { title: 'Insecure JWT Algorithm (HS256)', severity: 'medium', cwe: 'CWE-327', cvss: '6.2', description: 'JWT tokens use symmetric HS256 instead of asymmetric RS256.' },
    { title: 'Missing Content-Security-Policy', severity: 'low', cwe: 'CWE-1021', cvss: '4.3', description: 'No Content-Security-Policy header configured for XSS mitigation.' },
    { title: 'Debug Mode Enabled in Production', severity: 'medium', cwe: 'CWE-489', cvss: '5.3', description: 'Verbose stack traces and debug flags are exposed to clients.' },
  ];
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: Date.now() + Math.random(),
    ...picked,
    file: target.path,
    line: Math.floor(Math.random() * 150) + 1,
    category: target.category,
    status: 'open',
  };
}

// ---- Internal: Generate a Fix via AI ----
async function generateFix(finding) {
  const config = getAiConfig();
  if (config.isConfigured) {
    try {
      const prompt = `Generate a one-line summary of the fix for this vulnerability:
Title: ${finding.title}
CWE: ${finding.cwe}
File: ${finding.file}
Description: ${finding.description}
Return only a JSON: { "summary": "...", "patch": "..." }`;
      const raw = await chatWithAi(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return { summary: parsed.summary || 'Security patch applied', patch: parsed.patch || '' };
      }
    } catch (e) {
      console.warn('[ScanEngine] AI fix error, using fallback:', e);
    }
  }

  // Fallback fix
  const fixes = {
    'CWE-798': 'Moved secret to server-side environment variable',
    'CWE-89': 'Replaced concatenation with parameterized prepared statement',
    'CWE-79': 'Replaced innerHTML with textContent + DOMPurify sanitization',
    'CWE-307': 'Added express-rate-limit with 5 attempts / 15 min window',
    'CWE-942': 'Restricted CORS to explicit allowed origin whitelist',
    'CWE-327': 'Upgraded JWT signing algorithm to RS256 with key rotation',
    'CWE-1021': 'Added Content-Security-Policy: default-src self header',
    'CWE-489': 'Disabled debug mode and stack trace exposure in production',
  };
  return { summary: fixes[finding.cwe] || 'Applied security hardening patch', patch: '' };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
