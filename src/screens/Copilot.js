// ============================================
// SYBRAI — CyberSec Multi-Agent Copilot
// Implements OpenAI Agents SDK:
// - Specialists & Orchestration Handoffs
// - Human-in-the-Loop Approvals
// ============================================

import { showToast } from '../utils/toast.js';
import { getAiConfig } from '../utils/aiService.js';
import { runCyberAgentWorkflow, applyPatchTool } from '../utils/cyberAgentsSdk.js';

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

    <!-- Active Specialist Agents & Tools Status Bar -->
    <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 16px; background: rgba(37,99,235,0.06); border-bottom: 1px solid var(--color-border); font-size: 11px; color: var(--color-text-secondary); flex-wrap: wrap; gap: 4px;">
      <div style="display:flex; align-items:center; gap: 6px;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display:inline-block;"></span>
        <span>Tools: <code style="font-size:10px; color:var(--color-primary);">apply_patch</code> | <code style="font-size:10px; color:#10B981;">web_search</code> | <code style="font-size:10px; color:#F59E0B;">mcp</code> | <code style="font-size:10px; color:#8B5CF6;">async</code></span>
      </div>
      <span class="badge badge--secure" style="font-size: 9px;">Guardrails ON</span>
    </div>

    <div class="copilot-chat-area" id="copilot-chat">
      ${renderCopilotMessages(conversationHistory)}
    </div>

    <!-- CyberSec Quick-Action Pills -->
    <div class="cyber-pill-bar">
      <button class="cyber-pill" data-prompt="Propose and apply patch for SQL injection in src/controllers/auth.js">
        <i data-lucide="git-pull-request" style="width:12px;height:12px;color:#10B981;"></i>
        <span>apply_patch (SQLi)</span>
      </button>
      <button class="cyber-pill" data-prompt="Search live threat intel on Log4j CVE-2021-44228 and NVD score">
        <i data-lucide="globe" style="width:12px;height:12px;color:#3B82F6;"></i>
        <span>web_search (CVE Intel)</span>
      </button>
      <button class="cyber-pill" data-prompt="Run remote MCP cloud posture and repository secret scanner">
        <i data-lucide="server" style="width:12px;height:12px;color:#F59E0B;"></i>
        <span>Remote MCP Server</span>
      </button>
      <button class="cyber-pill" data-prompt="Start background async SAST scan across the repository">
        <i data-lucide="timer" style="width:12px;height:12px;color:#8B5CF6;"></i>
        <span>Async SAST Scan</span>
      </button>
      <button class="cyber-pill" data-prompt="Trigger a critical security alert push notification to my mobile device">
        <i data-lucide="bell" style="width:12px;height:12px;color:#EF4444;"></i>
        <span>Mobile Push Alert</span>
      </button>
    </div>

    <div class="chat-input-bar">
      <input class="chat-input-bar__field" id="copilot-input" type="text" placeholder="Ask CyberSec AI (e.g. Apply patch for SQLi)..." aria-label="Ask CyberSec AI" />
      <button class="chat-input-bar__btn chat-input-bar__btn--send" id="copilot-send" aria-label="Send message">
        <i data-lucide="arrow-up"></i>
      </button>
    </div>
  `;

  setTimeout(() => setupCopilotInteractivity(), 50);
  return screen;
}

function renderCopilotMessages(messages) {
  return messages.map((msg, idx) => {
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
            ${msg.patchOperation ? renderPatchCardHtml(msg.patchOperation, idx) : ''}
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

function renderPatchCardHtml(patch, id = 0) {
  return `
    <div class="cyber-patch-card" id="patch-card-${id}" style="margin-top: 10px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 12px; font-family: var(--font-mono); font-size: 11px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
        <span style="display:flex; align-items:center; gap: 5px; color: #38BDF8; font-weight:700;">
          <i data-lucide="git-commit" style="width:13px;height:13px;"></i> apply_patch :: ${patch.type}
        </span>
        <span class="badge badge--critical" style="font-size:9px;">${patch.cvss ? `CVSS ${patch.cvss}` : 'SECURITY'}</span>
      </div>
      <div style="color: #94A3B8; font-size:10px; margin-bottom: 6px;">Target: <code>${patch.path}</code></div>
      ${patch.vulnTitle ? `<div style="color: #F87171; font-weight:600; font-size:10px; margin-bottom: 8px;">⚠️ ${patch.vulnTitle}</div>` : ''}
      <pre style="background: #090D16; color: #E2E8F0; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 6px 0; border: 1px solid rgba(255,255,255,0.06); font-size: 10px; line-height: 1.4;"><code>${formatDiff(patch.diff)}</code></pre>
      <div style="display:flex; gap: 6px; margin-top: 8px;">
        <button class="btn btn--primary patch-apply-btn" data-patch-id="${id}" style="flex:1; font-size:11px; padding:6px 10px; background:#10B981; border-color:#10B981;">
          <i data-lucide="check" style="width:12px;height:12px;"></i> Apply Hotpatch
        </button>
        <button class="btn btn--secondary patch-copy-btn" data-diff="${encodeURIComponent(patch.diff)}" style="font-size:11px; padding:6px 10px;">
          <i data-lucide="copy" style="width:12px;height:12px;"></i> Copy
        </button>
      </div>
      <div class="patch-status-msg" id="patch-status-${id}" style="margin-top:6px; font-size:10px; color:#10B981; display:none;"></div>
    </div>
  `;
}

function formatDiff(diff) {
  if (!diff) return '';
  return diff.split('\n').map(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return `<span style="color:#4ADE80; background:rgba(74,222,128,0.1); display:block;">${line}</span>`;
    }
    if (line.startsWith('-') && !line.startsWith('---')) {
      return `<span style="color:#F87171; background:rgba(248,113,113,0.1); display:block;">${line}</span>`;
    }
    return `<span>${line}</span>`;
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
      // Execute Multi-Agent Workflow with Human-in-the-Loop Approval Handler & Patch Proposer
      const workflowResult = await runCyberAgentWorkflow(
        text,
        conversationHistory,
        async (interruption) => {
          return await showApprovalModal(interruption);
        },
        true // Enable onPatchPropose
      );

      typingRow.remove();

      const aiMsg = document.createElement('div');
      aiMsg.className = 'message-row message-row--ai';
      const msgIndex = conversationHistory.length;
      aiMsg.innerHTML = `
        <div class="message-avatar"><i data-lucide="${workflowResult.lastAgent?.icon || 'bot'}"></i></div>
        <div class="message-bubble message-bubble--ai">
          <div style="display:flex; align-items:center; gap: 4px; font-size: 10px; font-weight: 700; color: var(--color-primary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">
            <i data-lucide="cpu" style="width:11px;height:11px;"></i> Handoff: ${workflowResult.lastAgent?.name}
          </div>
          ${formatText(workflowResult.finalOutput)}
          ${workflowResult.patchOperation ? renderPatchCardHtml(workflowResult.patchOperation, msgIndex) : ''}
        </div>
      `;
      chatArea.appendChild(aiMsg);

      // Attach patch apply / copy handlers
      if (workflowResult.patchOperation) {
        setupPatchCardInteractions(aiMsg, workflowResult.patchOperation, msgIndex);
      }

      conversationHistory.push({
        type: 'ai',
        text: workflowResult.finalOutput,
        agentName: workflowResult.lastAgent?.name,
        agentIcon: workflowResult.lastAgent?.icon,
        patchOperation: workflowResult.patchOperation,
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

/**
 * Handles interactions on the Security Hotpatch Card (Apply / Copy)
 */
function setupPatchCardInteractions(container, patch, id) {
  const applyBtn = container.querySelector(`.patch-apply-btn[data-patch-id="${id}"]`);
  const copyBtn = container.querySelector('.patch-copy-btn');
  const statusMsg = container.querySelector(`#patch-status-${id}`);

  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      applyBtn.disabled = true;
      applyBtn.innerHTML = '<i data-lucide="loader" class="spin" style="width:12px;height:12px;"></i> Applying...';
      if (window.lucide) lucide.createIcons();

      try {
        const result = await applyPatchTool.execute(patch);
        if (result.status === 'completed') {
          applyBtn.style.background = '#059669';
          applyBtn.innerHTML = '<i data-lucide="check-check" style="width:12px;height:12px;"></i> Patch Applied';
          if (statusMsg) {
            statusMsg.style.display = 'block';
            statusMsg.innerText = `✅ [apply_patch_call_output: completed] ${result.output}`;
          }
          showToast(`Security patch applied to ${patch.path} ✅`, 'success', 2500);
        } else {
          applyBtn.disabled = false;
          applyBtn.innerHTML = 'Retry Apply';
          showToast(`Failed to apply patch: ${result.output}`, 'error', 2500);
        }
      } catch (e) {
        applyBtn.disabled = false;
        applyBtn.innerHTML = 'Error';
        showToast(`Error: ${e.message}`, 'error', 2500);
      }
      if (window.lucide) lucide.createIcons();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const diffText = decodeURIComponent(copyBtn.dataset.diff || '');
      navigator.clipboard.writeText(diffText);
      showToast('Patch diff copied to clipboard 📋', 'default', 1500);
    });
  }
}
