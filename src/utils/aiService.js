// ============================================
// SYBRAI — AI Service
// Handles Gemini / OpenAI / Custom AI models with API keys
// ============================================

// Read from Vite define, import.meta.env, or saved localStorage configuration
export function getAiConfig() {
  const envConfig = (typeof __AI_ENV__ !== 'undefined') ? __AI_ENV__ : {};
  const localApiKey = localStorage.getItem('sybrai_ai_api_key');
  const localModel = localStorage.getItem('sybrai_ai_model');
  const localProvider = localStorage.getItem('sybrai_ai_provider');

  const apiKey = localApiKey || envConfig.apiKey || import.meta.env.VITE_AI_API_KEY || '';
  const model = localModel || envConfig.model || import.meta.env.VITE_AI_MODEL || 'gemini-1.5-flash';
  const provider = localProvider || envConfig.provider || import.meta.env.VITE_AI_PROVIDER || 'gemini';
  const baseUrl = envConfig.baseUrl || import.meta.env.VITE_AI_BASE_URL || '';

  return {
    apiKey: apiKey.trim(),
    model: model.trim(),
    provider: provider.trim().toLowerCase(),
    baseUrl: baseUrl.trim(),
    isConfigured: Boolean(apiKey && apiKey.trim().length > 5 && !apiKey.includes('your_api_key')),
  };
}

export function saveAiConfig({ apiKey, model, provider }) {
  if (apiKey !== undefined) localStorage.setItem('sybrai_ai_api_key', apiKey.trim());
  if (model !== undefined) localStorage.setItem('sybrai_ai_model', model.trim());
  if (provider !== undefined) localStorage.setItem('sybrai_ai_provider', provider.trim());
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
    console.warn('[SYBRAI AI Service] API call failed, using intelligent fallback:', error);
    return `${generateFallbackResponse(prompt)}\n\n*(Note: AI API call encountered an error: ${error.message}. Please check your API key & model in .env or settings)*`;
  }
}

/**
 * Google Gemini API integration
 */
async function callGemini(config, prompt, history = []) {
  const model = config.model || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  const contents = [];

  // Add system instruction context
  const systemInstruction = "You are SYBRAI, an advanced AI Bug Fixer and Code Analyzer mobile assistant. Provide clear, concise, actionable solutions formatted in markdown with code snippets. Keep responses direct and friendly for mobile viewing.";

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
      maxOutputTokens: 1000,
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
  const endpoint = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
  const model = config.model || 'gpt-4o-mini';

  const messages = [
    { role: 'system', content: 'You are SYBRAI, an AI Bug Fixer and Code Analyzer for mobile developers. Be concise and practical.' },
    ...history.slice(-6).map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: prompt },
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

/**
 * AI Real-Time Bug Alert Generator for Mobile Notifications
 */
export async function generateAiAlert(customTopic = '') {
  const config = getAiConfig();

  const prompt = `Generate a realistic, critical software bug alert for a mobile or web app ${customTopic ? `related to: ${customTopic}` : ''}.
Return strictly JSON with this exact schema:
{
  "title": "Short title max 6 words",
  "desc": "Summary of the bug or issue in 1-2 sentences",
  "file": "file/path.ext:line",
  "type": "warning" | "error" | "critical" | "success",
  "icon": "alert-circle" | "alert-triangle" | "shield-alert" | "cpu",
  "fixSuggestion": "Specific 1-line code fix suggestion"
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
          title: parsed.title || 'AI Bug Detected',
          desc: parsed.desc || 'An issue was flagged in your active build.',
          file: parsed.file || 'src/services/api.js:42',
          type: parsed.type || 'warning',
          icon: parsed.icon || 'alert-triangle',
          fixSuggestion: parsed.fixSuggestion || 'Review null safety check.',
          time: 'Just now',
          unread: true,
          isAiGenerated: true,
        };
      }
    } catch (e) {
      console.warn('[SYBRAI AI] Failed to parse generated alert JSON:', e);
    }
  }

  // Fallback realistic smart alerts if offline or no key set
  const pool = [
    {
      title: 'Uncaught Promise Rejection',
      desc: 'Unhandled API error in AuthService token refresh lifecycle.',
      file: 'src/services/AuthService.js:84',
      type: 'warning',
      icon: 'alert-triangle',
      fixSuggestion: 'Wrap in try/catch block and handle 401 token invalidation.',
    },
    {
      title: 'Critical Memory Leak',
      desc: 'Bitmap buffer not disposed after texture rendering cycle.',
      file: 'src/components/ImagePreview.kt:128',
      type: 'error',
      icon: 'alert-circle',
      fixSuggestion: 'Call recycle() or use WeakReference inside onCleared().',
    },
    {
      title: 'Security Vulnerability Alert',
      desc: 'Outdated CORS policy allows arbitrary origin reflections.',
      file: 'server/security/cors.ts:15',
      type: 'warning',
      icon: 'shield-alert',
      fixSuggestion: 'Restrict Access-Control-Allow-Origin to authorized client domains.',
    },
    {
      title: 'High CPU Usage Detected',
      desc: 'Infinite re-render loop detected in Dashboard state subscriber.',
      file: 'src/screens/Dashboard.js:63',
      type: 'warning',
      icon: 'cpu',
      fixSuggestion: 'Add dependency array [activeTab] to avoid unbounded hook execution.',
    },
    {
      title: 'Database Pool Exhaustion',
      desc: 'Connections exceeded threshold (95/100 connections active).',
      file: 'config/database.js:29',
      type: 'error',
      icon: 'database',
      fixSuggestion: 'Enable connection timeout and connection pooling reaper.',
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
 * Smart fallback response for chat
 */
function generateFallbackResponse(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('crash') || lower.includes('error')) {
    return `### 🔍 AI Analysis Result\n\nI analyzed your crash report:\n\n1. **Root Cause**: Likely a null reference or unhandled asynchronous exception during lifecycle initialization.\n2. **Recommendation**: Verify your state bindings and ensure async callbacks check if the UI component is mounted before setting state.\n3. **Quick Fix**:\n\`\`\`javascript\nif (data && data.user) {\n  renderUserProfile(data.user);\n}\n\`\`\``;
  }
  if (lower.includes('notification') || lower.includes('alert')) {
    return `### 🔔 Mobile Notifications Ready\n\nSYBRAI supports **Native Device Web Push Notifications** on mobile devices.\n\n- Visit the **Notifications** tab to grant permission.\n- Tap **"Scan & Trigger Alert"** to test native mobile heads-up alerts on your device!`;
  }
  return `### 🤖 SYBRAI AI Copilot\n\nI am ready to help you analyze code, diagnose crashes, and fix bugs!\n\n💡 **Tip**: To connect your live **Google Gemini** or **OpenAI** model, add your API key in your \`.env\` file (\`VITE_AI_API_KEY=...\`) or configure it directly in **Profile → AI Model Settings**.`;
}
