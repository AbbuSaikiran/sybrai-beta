// ============================================
// SYBRAI — CyberSec Multi-Agent Copilot
// Implements OpenAI Agents SDK:
// - Specialists & Orchestration Handoffs
// - Human-in-the-Loop Approvals
// ============================================

import { showToast } from '../utils/toast.js';
import { getAiConfig } from '../utils/aiService.js';
import { runCyberAgentWorkflow } from '../utils/cyberAgentsSdk.js';

let conversationHistory = [
  {
    type: 'ai',
    text: 'Welcome to **SYBRAI CyberSec AI**. I am connected to the autonomous multi-agent security orchestrator.\n\nAsk me to audit source code for **OWASP vulnerabilities**, check for **leaked API secrets**, verify **CORS / JWT headers**, or dispatch **mobile threat alerts**.',
    agentName: 'SYBRAI CyberSec Triage',
    agentIcon: 'shield-check',
    time: '2:00 PM',
  },
];

export function renderCopilot() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--copilot';
  const aiConfig = getAiConfig();

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <button class="top-app-bar__icon-btn" aria-label="Back" onclick="window.location.hash='/home'">
          <i data-lucide="arrow-left"></i>
        </button>
        <div>
          <h1 class="top-app-bar__title">CyberSec AI</h1>
          <div style="font-size: 10px; color: var(--color-primary); font-family: var(--font-mono); margin-top: -2px;">
            ${aiConfig.model || 'gpt-5.6-luna'} ${aiConfig.isConfigured ? '● active' : '● offline'}
          </div>
        </div>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" id="copilot-clear" title="Clear chat" aria-label="Clear chat">
          <i data-lucide="rotate-ccw"></i>
        </button>
      </div>
    </div>

    <!-- Active Specialist Agents Status Bar -->
    <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 16px; background: rgba(37,99,235,0.06); border-bottom: 1px solid var(--color-border); font-size: 11px; color: var(--color-text-secondary);">
      <div style="display:flex; align-items:center; gap: 6px;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display:inline-block;"></span>
        <span>Specialists: <strong>Auditor</strong> | <strong>Defense</strong> | <strong>Incident</strong></span>
      </div>
      <span class="badge badge--secure" style="font-size: 9px;">Guardrails ON</span>
    </div>

    <div class="copilot-chat-area" id="copilot-chat">
      ${renderCopilotMessages(conversationHistory)}
    </div>

    <!-- CyberSec Quick-Action Pills -->
    <div class="cyber-pill-bar">
      <button class="cyber-pill" data-prompt="Audit this codebase for OWASP Top 10 vulnerabilities">
        <i data-lucide="shield-alert" style="width:12px;height:12px;color:#EF4444;"></i>
        <span>Scan OWASP Risks</span>
      </button>
      <button class="cyber-pill" data-prompt="Check for hardcoded API keys, JWT tokens, or credentials">
        <i data-lucide="key-round" style="width:12px;height:12px;color:#F59E0B;"></i>
        <span>Detect Leaked Keys</span>
      </button>
      <button class="cyber-pill" data-prompt="How to fix SQL injection and XSS vulnerabilities in our routes?">
        <i data-lucide="zap" style="width:12px;height:12px;color:#3B82F6;"></i>
        <span>Fix SQLi / XSS</span>
      </button>
      <button class="cyber-pill" data-prompt="Harden CORS policy, CSP headers, and cookie security">
        <i data-lucide="lock" style="width:12px;height:12px;color:#10B981;"></i>
        <span>Harden Headers</span>
      </button>
      <button class="cyber-pill" data-prompt="Trigger a critical security alert push notification to my mobile device">
        <i data-lucide="bell" style="width:12px;height:12px;color:#8B5CF6;"></i>
        <span>Trigger Mobile Alert</span>
      </button>
    </div>

    <div class="chat-input-bar">
      <input class="chat-input-bar__field" id="copilot-input" type="text" placeholder="Ask CyberSec AI (e.g. Audit login route for SQLi)..." aria-label="Ask CyberSec AI" />
      <button class="chat-input-bar__btn chat-input-bar__btn--send" id="copilot-send" aria-label="Send message">
        <i data-lucide="arrow-up"></i>
      </button>
    </div>
  `;

  setTimeout(() => setupCopilotInteractivity(), 50);
  return screen;
}

function renderCopilotMessages(messages) {
  return messages.map(msg => {
    if (msg.type === 'ai') {
      return `
        <div class="message-row message-row--ai">
          <div class="message-avatar">
            <i data-lucide="${msg.agentIcon || 'bot'}"></i>
          </div>
          <div class="message-bubble message-bubble--ai">
            ${msg.agentName ? `
              <div style="display:flex; align-items:center; gap: 4px; font-size: 10px; font-weight: 700; color: var(--color-primary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">
                <i data-lucide="cpu" style="width:11px;height:11px;"></i> Handoff: ${msg.agentName}
              </div>
            ` : ''}
            ${formatText(msg.text)}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="message-row message-row--user">
          <div class="message-bubble message-bubble--user">
            ${formatText(msg.text)}
          </div>
        </div>
      `;
    }
  }).join('');
}

function formatText(text) {
  if (!text) return '';
  let formatted = text.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre style="background:#0f172a;color:#38bdf8;padding:10px;border-radius:6px;overflow-x:auto;font-family:var(--font-mono);font-size:0.85em;margin:6px 0;"><code>$2</code></pre>');
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
  formatted = formatted.replace(/^#### (.*$)/gim, '<div style="font-weight:700;font-size:0.95em;margin:5px 0 2px;">$1</div>');
  formatted = formatted.replace(/^### (.*$)/gim, '<div style="font-weight:700;margin:6px 0 3px;">$1</div>');
  formatted = formatted.replace(/^## (.*$)/gim, '<div style="font-weight:700;font-size:1.1em;margin:8px 0 4px;">$1</div>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

function setupCopilotInteractivity() {
  const input = document.getElementById('copilot-input');
  const sendBtn = document.getElementById('copilot-send');
  const clearBtn = document.getElementById('copilot-clear');
  const chatArea = document.getElementById('copilot-chat');

  if (!input) return;

  input.addEventListener('input', () => {
    sendBtn.classList.toggle('enabled', input.value.trim().length > 0);
  });

  const sendMessage = async (customPrompt = null) => {
    const text = customPrompt || input.value.trim();
    if (!text) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message-row message-row--user';
    userMsg.innerHTML = `<div class="message-bubble message-bubble--user">${formatText(text)}</div>`;
    chatArea.appendChild(userMsg);

    conversationHistory.push({ type: 'user', text, time: 'Now' });

    input.value = '';
    sendBtn.classList.remove('enabled');

    // Show typing / routing indicator
    const typingRow = document.createElement('div');
    typingRow.className = 'message-row message-row--ai';
    typingRow.id = 'copilot-typing';
    typingRow.innerHTML = `
      <div class="message-avatar"><i data-lucide="shield"></i></div>
      <div class="message-bubble message-bubble--ai">
        <div style="display:flex; align-items:center; gap: 8px;">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span style="font-size: 11px; color: var(--color-text-secondary);">Orchestrating CyberSec Specialist...</span>
        </div>
      </div>
    `;
    chatArea.appendChild(typingRow);
    chatArea.scrollTop = chatArea.scrollHeight;
    if (window.lucide) lucide.createIcons();

    try {
      // Execute Multi-Agent Workflow with Human-in-the-Loop Approval Handler
      const workflowResult = await runCyberAgentWorkflow(text, conversationHistory, async (interruption) => {
        // Return promise that resolves when human clicks Approve or Deny
        return await showApprovalModal(interruption);
      });

      typingRow.remove();

      const aiMsg = document.createElement('div');
      aiMsg.className = 'message-row message-row--ai';
      aiMsg.innerHTML = `
        <div class="message-avatar"><i data-lucide="${workflowResult.lastAgent?.icon || 'bot'}"></i></div>
        <div class="message-bubble message-bubble--ai">
          <div style="display:flex; align-items:center; gap: 4px; font-size: 10px; font-weight: 700; color: var(--color-primary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">
            <i data-lucide="cpu" style="width:11px;height:11px;"></i> Handoff: ${workflowResult.lastAgent?.name}
          </div>
          ${formatText(workflowResult.finalOutput)}
        </div>
      `;
      chatArea.appendChild(aiMsg);
      conversationHistory.push({
        type: 'ai',
        text: workflowResult.finalOutput,
        agentName: workflowResult.lastAgent?.name,
        agentIcon: workflowResult.lastAgent?.icon,
        time: 'Now',
      });
    } catch (err) {
      typingRow.remove();
      const errRow = document.createElement('div');
      errRow.className = 'message-row message-row--ai';
      errRow.innerHTML = `
        <div class="message-avatar"><i data-lucide="alert-circle" style="color:var(--color-destructive)"></i></div>
        <div class="message-bubble message-bubble--ai">Agent Error: ${err.message}</div>
      `;
      chatArea.appendChild(errRow);
    }

    chatArea.scrollTop = chatArea.scrollHeight;
    if (window.lucide) lucide.createIcons();
  };

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  // Quick Action Pills
  document.querySelectorAll('.cyber-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const prompt = pill.dataset.prompt;
      sendMessage(prompt);
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      conversationHistory = [];
      chatArea.innerHTML = renderCopilotMessages(conversationHistory);
      showToast('Session cleared', 'default', 1500);
    });
  }

  if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}

/**
 * Human-in-the-Loop Approval Modal
 * Implements the OpenAI Agents SDK Approval Interruption pattern
 */
function showApprovalModal(interruption) {
  return new Promise((resolve) => {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
      resolve(true);
      return;
    }

    modalContainer.innerHTML = `
      <div class="modal-backdrop active" id="guardrail-modal-backdrop">
        <div class="modal-sheet" role="dialog" aria-labelledby="modal-guardrail-title">
          <div class="modal-sheet__handle"></div>
          <div class="modal-sheet__header">
            <h2 class="modal-sheet__title" id="modal-guardrail-title" style="color:#EF4444;">
              <i data-lucide="shield-alert"></i> Guardrail Review Required
            </h2>
          </div>
          <div class="modal-sheet__body">
            <p style="font-size: 13px; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-xs);">
              Specialist Agent requests approval to execute sensitive action:
            </p>
            <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px; margin: 8px 0; font-family: var(--font-mono); font-size: 11px;">
              <div><strong>Action:</strong> <code>${interruption.tool.name}</code></div>
              <div style="margin-top: 4px;"><strong>Target:</strong> <code>${interruption.args.file || interruption.args.fileFound || 'System'}</code></div>
              ${interruption.args.cvss ? `<div style="margin-top: 4px;"><strong>CVSS Severity:</strong> <span class="badge badge--critical">${interruption.args.cvss}</span></div>` : ''}
            </div>
            <p style="font-size: 11px; color: var(--color-text-secondary); line-height: 1.4;">
              As per Cybersecurity Safety policy, sensitive actions require explicit human operator confirmation before execution.
            </p>
          </div>
          <div class="modal-sheet__footer" style="display:flex; gap: 8px;">
            <button class="btn btn--secondary" id="deny-action-btn" style="flex:1;">
              Reject Action
            </button>
            <button class="btn btn--primary" id="approve-action-btn" style="flex:1; background:#10B981; border-color:#10B981;">
              Approve & Run
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    const cleanup = () => { modalContainer.innerHTML = ''; };

    modalContainer.querySelector('#approve-action-btn')?.addEventListener('click', () => {
      cleanup();
      showToast('Action approved by operator ✅', 'success', 2000);
      resolve(true);
    });

    modalContainer.querySelector('#deny-action-btn')?.addEventListener('click', () => {
      cleanup();
      showToast('Action rejected by operator 🛑', 'warning', 2000);
      resolve(false);
    });
  });
}
