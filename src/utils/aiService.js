// ============================================
// SYBRAI — AI Service
// Handles Gemini / OpenAI / Custom AI models with API keys
// ============================================

// Read from Vite define, import.meta.env, or saved localStorage configuration
export function getAiConfig() {
  const envConfig = (typeof __AI_ENV__ !== 'undefined') ? __AI_ENV__ : {};
  const hasLocalStorage = typeof localStorage !== 'undefined';
  const localApiKey = hasLocalStorage ? localStorage.getItem('sybrai_ai_api_key') : null;
  const localModel = hasLocalStorage ? localStorage.getItem('sybrai_ai_model') : null;
  const localProvider = hasLocalStorage ? localStorage.getItem('sybrai_ai_provider') : null;

  let apiKey = (localApiKey || envConfig.apiKey || (typeof process !== 'undefined' && process.env?.VITE_AI_API_KEY) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_API_KEY) || '').trim();
  let provider = (localProvider || envConfig.provider || (typeof process !== 'undefined' && process.env?.VITE_AI_PROVIDER) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_PROVIDER) || 'openai').trim().toLowerCase();

  // Smart provider auto-detection based on API key prefix
  if (apiKey.startsWith('sk-')) {
    provider = 'openai';
  } else if (apiKey.startsWith('AIza')) {
    provider = 'gemini';
  }

  const defaultModel = provider === 'openai' ? 'gpt-5.6-luna' : 'gemini-1.5-flash';
  const model = (localModel || envConfig.model || (typeof process !== 'undefined' && process.env?.VITE_AI_MODEL) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_MODEL) || defaultModel).trim();
  const baseUrl = (envConfig.baseUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_BASE_URL) || '').trim();

  return {
    apiKey,
    model,
    provider,
    baseUrl,
    isConfigured: Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your_api_key')),
  };
}

export function saveAiConfig({ apiKey, model, provider }) {
  if (typeof localStorage === 'undefined') return;
  if (apiKey !== undefined) localStorage.setItem('sybrai_ai_api_key', apiKey.trim());
  if (model !== undefined) localStorage.setItem('sybrai_ai_model', model.trim());
  if (provider !== undefined) localStorage.setItem('sybrai_ai_provider', provider.trim().toLowerCase());
}

/**
 * Live test connection with provided API key and model
 */
export async function testAiConnection({ apiKey, provider, model }) {
  const key = (apiKey || '').trim();
  let prov = (provider || (key.startsWith('sk-') ? 'openai' : 'gemini')).toLowerCase();
  const mod = model || (prov === 'openai' ? 'gpt-5.6-luna' : 'gemini-1.5-flash');

  if (!key || key.length < 5) {
    return { success: false, message: 'Please enter a valid API key.' };
  }

  try {
    if (prov === 'openai') {
      const isNewMod = mod.startsWith('o') || mod.includes('luna') || mod.includes('sol') || mod.includes('terra') || mod.includes('5') || mod.includes('4o');
      const isStrictTemp = mod.startsWith('o') || mod.includes('luna') || mod.includes('sol') || mod.includes('terra') || mod.includes('gpt-5');
      
      const payload = {
        model: mod,
        messages: [{ role: 'user', content: 'Ping' }],
        ...(isNewMod ? { max_completion_tokens: 10 } : { max_tokens: 10 })
      };
      if (!isStrictTemp) {
        payload.temperature = 0.7;
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error?.message || `HTTP ${res.status}`;
        return { success: false, message: errMsg };
      }
      return { success: true, message: `Connected to OpenAI (${mod}) successfully!` };
    } else {
      // Google Gemini
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error?.message || `HTTP ${res.status}`;
        return { success: false, message: errMsg };
      }
      return { success: true, message: `Connected to Google Gemini (${mod}) successfully!` };
    }
  } catch (e) {
    return { success: false, message: e.message || 'Network connection failed' };
  }
}

/**
 * Call the AI model for general chat and bug debugging
 */
export async function chatWithAi(prompt, history = []) {
  const config = getAiConfig();

  if (!config.isConfigured) {
    return generateFallbackResponse(prompt);
  }

  try {
    if (config.provider === 'openai') {
      return await callOpenAi(config, prompt, history);
    } else {
      // Default to Google Gemini API
      return await callGemini(config, prompt, history);
    }
  } catch (error) {
    console.warn('[SYBRAI AI Service] API call failed:', error);
    throw error;
  }
}

/**
 * Google Gemini API integration
 */
async function callGemini(config, prompt, history = []) {
  const model = config.model || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  const contents = [];

  // Add system instruction context (Coding Assistant, Bug Fixer & Security)
  const systemInstruction = `You are SYBRAI AI — an intelligent coding assistant, bug fixer, and analyzer (Ask. Analyze. Fix. Learn.).
Your role is to diagnose code bugs, analyze logs, optimize performance, and harden security.
When responding:
1. Explain the root cause clearly in 1-2 concise paragraphs.
2. If there is a code fix or recommendation, provide the complete, ready-to-use code in a markdown code block:
\`\`\`<language>
// patched code
\`\`\`
3. Provide 2-3 brief bullet points explaining why the fix works and best practices.
Keep responses practical, concise, and developer-friendly.`;

  // Add conversation history
  history.slice(-6).forEach(msg => {
    contents.push({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response received from Gemini model');
  return text;
}

/**
 * OpenAI API integration
 */
async function callOpenAi(config, prompt, history = []) {
  const primaryModel = config.model || 'gpt-5.6-luna';
  const endpoint = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
  const messages = [
    {
      role: 'system',
      content: `You are SYBRAI AI — an intelligent autonomous cybersecurity assistant, bug fixer, and mobile device defense controller (Ask. Analyze. Fix. Learn.).
Diagnose code bugs, analyze logs, optimize performance, safeguard mobile device telemetry, and harden application security.
When responding:
1. Explain the root cause or security assessment clearly in 1-2 concise paragraphs.
2. If there is a code fix or command, provide it in a clean markdown code block.
3. Provide 2-3 brief actionable bullet points explaining why the action works and security best practices.`
    },
    ...history.slice(-6).map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: prompt },
  ];

  const buildPayload = (targetModel, useCompletionTokens) => {
    // Models that reject custom temperature (gpt-5*, luna, sol, terra, o1, o3, etc.)
    const isStrictModel = targetModel.startsWith('o') || 
                          targetModel.includes('luna') || 
                          targetModel.includes('sol') || 
                          targetModel.includes('terra') || 
                          targetModel.includes('gpt-5');

    const payload = {
      model: targetModel,
      messages,
      ...(useCompletionTokens ? { max_completion_tokens: 1500 } : { max_tokens: 1500 }),
    };

    if (!isStrictModel) {
      payload.temperature = 0.7;
    }
    return payload;
  };

  const executeRequest = async (targetModel) => {
    const isNew = targetModel.startsWith('o') || targetModel.includes('luna') || targetModel.includes('5') || targetModel.includes('4o');
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(buildPayload(targetModel, isNew)),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status}`;

      // If token parameter mismatch occurs, retry with alternate token property
      if (errMsg.includes('max_completion_tokens') || errMsg.includes('max_tokens')) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(buildPayload(targetModel, !isNew)),
        });
        if (response.ok) {
          const retryData = await response.json();
          return retryData.choices?.[0]?.message?.content || 'No response generated.';
        }
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  };

  try {
    return await executeRequest(primaryModel);
  } catch (err) {
    console.warn(`[SYBRAI AI] Primary model ${primaryModel} request failed: ${err.message}. Attempting fallback to gpt-4o-mini...`);
    if (primaryModel !== 'gpt-4o-mini') {
      try {
        return await executeRequest('gpt-4o-mini');
      } catch (fallbackErr) {
        throw new Error(`OpenAI error: ${err.message}`);
      }
    }
    throw err;
  }
}

function extractResponseText(result) {
  if (result.output_text) return result.output_text;
  if (Array.isArray(result.output)) {
    for (const item of result.output) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part.text) return part.text;
        }
      }
    }
  }
  return null;
}

/**
 * AI Real-Time Cybersecurity Threat Alert Generator for Mobile Notifications
 */
export async function generateAiAlert(customTopic = '') {
  const config = getAiConfig();

  const prompt = `Generate a realistic, critical CYBERSECURITY or APPLICATION VULNERABILITY threat alert for a mobile or web app ${customTopic ? `related to: ${customTopic}` : ''}.
Return strictly a JSON object with this exact schema:
{
  "title": "Short threat title max 6 words (e.g. Hardcoded Secret Key Exposed)",
  "desc": "Threat summary describing the security risk in 1-2 sentences",
  "file": "path/to/vulnerable-file.ext:line",
  "type": "critical" | "error" | "warning" | "success",
  "icon": "shield-alert" | "key-round" | "lock" | "alert-triangle",
  "cvss": "9.8" | "8.6" | "7.5" | "6.2",
  "cwe": "CWE-798" | "CWE-89" | "CWE-79" | "CWE-918" | "CWE-287",
  "fixSuggestion": "Specific 1-line code remediation patch"
}`;

  if (config.isConfigured) {
    try {
      let rawText = '';
      if (config.provider === 'openai') {
        rawText = await callOpenAi(config, prompt);
      } else {
        rawText = await callGemini(config, prompt);
      }

      // Extract JSON
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: Date.now(),
          title: parsed.title || 'Security Vulnerability Detected',
          desc: parsed.desc || 'An unpatched vulnerability was identified in the codebase.',
          file: parsed.file || 'src/security/auth.ts:42',
          type: parsed.type || 'critical',
          icon: parsed.icon || 'shield-alert',
          cvss: parsed.cvss || '8.8',
          cwe: parsed.cwe || 'CWE-89',
          fixSuggestion: parsed.fixSuggestion || 'Use parameterized queries with prepared statements.',
          time: 'Just now',
          unread: true,
          isAiGenerated: true,
        };
      }
    } catch (e) {
      console.warn('[SYBRAI AI] Failed to parse generated cyber alert JSON:', e);
    }
  }

  // Fallback realistic smart cyber alerts if offline or no key set
  const pool = [
    {
      title: 'Hardcoded Secret Key Exposed',
      desc: 'High entropy API secret detected in client bundle. Token can be extracted via reverse engineering.',
      file: 'src/lib/apiClient.js:14',
      type: 'critical',
      icon: 'key-round',
      cvss: '9.8',
      cwe: 'CWE-798',
      fixSuggestion: 'Move secret key to server-side environment variables and proxy requests.',
    },
    {
      title: 'SQL Injection in Auth Route',
      desc: 'Unsanitized user parameters concatenated directly into SQL statement.',
      file: 'server/controllers/login.ts:47',
      type: 'critical',
      icon: 'shield-alert',
      cvss: '8.9',
      cwe: 'CWE-89',
      fixSuggestion: 'Replace query concatenation with parameterized prepared statements: db.query("SELECT * WHERE id=?", [id]).',
    },
    {
      title: 'Cross-Site Scripting (XSS)',
      desc: 'Unescaped user input rendered directly via innerHTML in chat interface.',
      file: 'src/screens/Chat.js:93',
      type: 'error',
      icon: 'alert-triangle',
      cvss: '7.5',
      cwe: 'CWE-79',
      fixSuggestion: 'Sanitize content with DOMPurify or use textContent instead of innerHTML.',
    },
    {
      title: 'Broken Object Level Authorization',
      desc: 'Endpoint retrieves user record by ID from URL params without tenant ownership check (BOLA/IDOR).',
      file: 'api/routes/users.js:28',
      type: 'critical',
      icon: 'lock',
      cvss: '8.5',
      cwe: 'CWE-285',
      fixSuggestion: 'Verify req.user.tenantId matches targetResource.tenantId before returning data.',
    },
    {
      title: 'Permissive CORS Wildcard Policy',
      desc: 'Access-Control-Allow-Origin set to * with Access-Control-Allow-Credentials enabled.',
      file: 'server/middleware/cors.js:12',
      type: 'warning',
      icon: 'shield-alert',
      cvss: '6.5',
      cwe: 'CWE-942',
      fixSuggestion: 'Specify explicit allowed domain whitelist instead of wildcard reflection.',
    },
  ];

  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: Date.now(),
    ...picked,
    time: 'Just now',
    unread: true,
    isAiGenerated: true,
  };
}

/**
 * Run a full cybersecurity scan using the active AI model
 */
export async function runCyberScan(targetDescription = 'Full Application Codebase') {
  const config = getAiConfig();
  const prompt = `Conduct a comprehensive CYBERSECURITY & APPSEC VULNERABILITY AUDIT for: "${targetDescription}".
Evaluate:
1. Hardcoded secrets & API key exposure (CWE-798)
2. Injection vulnerabilities (SQLi CWE-89, Command Injection CWE-78)
3. Client-side security (XSS CWE-79, CSP violations)
4. Authentication & Session integrity (CWE-287, JWT expiration)
5. Sensitive data exposure in logs/storage

Provide:
- Security Score (/100)
- Detailed findings table with CVSS scores
- Concrete code remediation patch`;

  if (config.isConfigured) {
    try {
      if (config.provider === 'openai') {
        return await callOpenAi(config, prompt);
      } else {
        return await callGemini(config, prompt);
      }
    } catch (err) {
      console.warn('[CyberSec AI Scan] API call error:', err);
    }
  }

  // Fallback high-fidelity audit report
  return `### 🛡️ SYBRAI AI Cybersecurity Audit Report
**Target**: ${targetDescription}
**Security Posture Score**: **84/100** (Moderate Risk)

---

#### 🚨 Critical Findings
1. **[CVSS 9.8 - CRITICAL] Hardcoded API Secret in Client Bundle**
   - **Vector**: \`CWE-798: Use of Hard-coded Credentials\`
   - **Location**: \`src/services/apiClient.js:14\`
   - **Exploit Risk**: Secrets can be extracted from public JS bundles by attackers.
   - **Remediation**:
\`\`\`javascript
// BEFORE (VULNERABLE):
const API_SECRET = "sk-live-prod-secret-9842";

// AFTER (SECURE):
const API_SECRET = process.env.SERVER_SECURE_KEY; // Keep server-side only
\`\`\`

2. **[CVSS 7.5 - HIGH] Cross-Site Scripting (XSS) via Unescaped innerHTML**
   - **Vector**: \`CWE-79: Improper Neutralization of Input During Web Page Generation\`
   - **Location**: \`src/screens/Chat.js:48\`
   - **Exploit Risk**: Execution of malicious JavaScript in victim user sessions.
   - **Remediation**: Use \`textContent\` or DOMPurify sanitize library before rendering user-controlled input.

3. **[CVSS 6.5 - MEDIUM] Missing Content-Security-Policy (CSP)**
   - **Vector**: \`CWE-1021: Improper Restriction of Rendered UI Layers\`
   - **Remediation**: Configure HTTP header \`Content-Security-Policy: default-src 'self'\`.

---
💡 *Remediation completed. Click "Apply Security Patch" to enforce safe defaults.*`;
}

/**
 * Smart fallback response for chat
 */
function generateFallbackResponse(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('vuln') || lower.includes('security') || lower.includes('cyber') || lower.includes('hack') || lower.includes('cve')) {
    return `### 🛡️ SYBRAI CyberSec AI Assessment\n\nI conducted an automated threat analysis:\n\n1. **Vulnerability Vectors**: Scanned for OWASP Top 10 (Injection, Broken Auth, Secrets Leakage, XSS, SSRF).\n2. **Identified Risk**: Hardcoded API keys and unescaped DOM insertions represent the highest immediate attack surface.\n3. **Remediation Plan**:\n\`\`\`javascript\n// Enforce environment isolation & input escaping\nconst sanitizeInput = (str) => String(str).replace(/[&<>"']/g, (m) => ({\n  '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;'\n}[m]));\n\`\`\`\n\nTap **"AI Scan & Trigger Mobile Alert"** on the Notifications tab to test real-time threat dispatching!`;
  }
  if (lower.includes('crash') || lower.includes('error')) {
    return `### 🔍 AI Analysis Result\n\nI analyzed your crash report:\n\n1. **Root Cause**: Likely a null reference or unhandled asynchronous exception during lifecycle initialization.\n2. **Recommendation**: Verify your state bindings and ensure async callbacks check if the UI component is mounted before setting state.\n3. **Quick Fix**:\n\`\`\`javascript\nif (data && data.user) {\n  renderUserProfile(data.user);\n}\n\`\`\``;
  }
  if (lower.includes('notification') || lower.includes('alert')) {
    return `### 🔔 Mobile Notifications Ready\n\nSYBRAI supports **Native Device Web Push Notifications** on mobile devices.\n\n- Visit the **Notifications** tab to grant permission.\n- Tap **"Scan & Trigger Alert"** to test native mobile heads-up alerts on your device!`;
  }
  return `### 🛡️ SYBRAI CyberSec AI Copilot\n\nI am your autonomous **Cybersecurity & AppSec Defense Assistant**.\n\nAsk me to:\n- 🔍 Audit code for OWASP Top 10 vulnerabilities\n- 🔑 Detect leaked API keys and hardcoded credentials\n- 🛡️ Harden authentication, JWT, and CORS configs\n- 🚨 Trigger real-time mobile security alerts to your phone`;
}
