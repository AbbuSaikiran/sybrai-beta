// ============================================
// SYBRAI — Copilot Chat Screen (AI Powered)
// ============================================

import { copilotConversation } from '../data/mockData.js';
import { showToast } from '../utils/toast.js';
import { chatWithAi, getAiConfig } from '../utils/aiService.js';

let conversationHistory = [...copilotConversation];

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
          <h1 class="top-app-bar__title">SYBRAI AI</h1>
          <div style="font-size: 10px; color: var(--color-primary); font-family: var(--font-mono); margin-top: -2px;">
            ${aiConfig.model || 'gemini-1.5-flash'} ${aiConfig.isConfigured ? '● live' : '● offline mode'}
          </div>
        </div>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" id="copilot-clear" title="Clear chat" aria-label="Clear chat">
          <i data-lucide="rotate-ccw"></i>
        </button>
      </div>
    </div>

    <div class="copilot-chat-area" id="copilot-chat">
      ${renderCopilotMessages(conversationHistory)}
    </div>

    <div class="chat-input-bar">
      <input class="chat-input-bar__field" id="copilot-input" type="text" placeholder="Ask AI to fix or debug..." aria-label="Ask SYBRAI AI" />
      <button class="chat-input-bar__btn" id="copilot-mic" aria-label="Voice input">
        <i data-lucide="mic"></i>
      </button>
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
            <i data-lucide="bot"></i>
          </div>
          <div class="message-bubble message-bubble--ai">
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
  // Format code blocks
  let formatted = text.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre style="background:#0f172a;color:#38bdf8;padding:10px;border-radius:6px;overflow-x:auto;font-family:var(--font-mono);font-size:0.85em;margin:6px 0;"><code>$2</code></pre>');
  // Format inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
  // Format markdown headers
  formatted = formatted.replace(/^### (.*$)/gim, '<div style="font-weight:700;margin:6px 0 3px;">$1</div>');
  formatted = formatted.replace(/^## (.*$)/gim, '<div style="font-weight:700;font-size:1.1em;margin:8px 0 4px;">$1</div>');
  // Format bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Newlines to br
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

function setupCopilotInteractivity() {
  const input = document.getElementById('copilot-input');
  const sendBtn = document.getElementById('copilot-send');
  const micBtn = document.getElementById('copilot-mic');
  const clearBtn = document.getElementById('copilot-clear');
  const chatArea = document.getElementById('copilot-chat');

  if (!input) return;

  input.addEventListener('input', () => {
    sendBtn.classList.toggle('enabled', input.value.trim().length > 0);
  });

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message-row message-row--user';
    userMsg.innerHTML = `<div class="message-bubble message-bubble--user">${formatText(text)}</div>`;
    chatArea.appendChild(userMsg);

    conversationHistory.push({ type: 'user', text, time: 'Now' });

    input.value = '';
    sendBtn.classList.remove('enabled');

    // Show typing indicator
    const typingRow = document.createElement('div');
    typingRow.className = 'message-row message-row--ai';
    typingRow.id = 'copilot-typing';
    typingRow.innerHTML = `
      <div class="message-avatar"><i data-lucide="bot"></i></div>
      <div class="message-bubble message-bubble--ai">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    chatArea.appendChild(typingRow);
    chatArea.scrollTop = chatArea.scrollHeight;
    if (window.lucide) lucide.createIcons();

    try {
      const aiResponse = await chatWithAi(text, conversationHistory);
      typingRow.remove();

      const aiMsg = document.createElement('div');
      aiMsg.className = 'message-row message-row--ai';
      aiMsg.innerHTML = `
        <div class="message-avatar"><i data-lucide="bot"></i></div>
        <div class="message-bubble message-bubble--ai">${formatText(aiResponse)}</div>
      `;
      chatArea.appendChild(aiMsg);
      conversationHistory.push({ type: 'ai', text: aiResponse, time: 'Now' });
    } catch (err) {
      typingRow.remove();
      const errRow = document.createElement('div');
      errRow.className = 'message-row message-row--ai';
      errRow.innerHTML = `
        <div class="message-avatar"><i data-lucide="alert-circle" style="color:var(--color-destructive)"></i></div>
        <div class="message-bubble message-bubble--ai">Failed to reach AI model: ${err.message}</div>
      `;
      chatArea.appendChild(errRow);
    }

    chatArea.scrollTop = chatArea.scrollHeight;
    if (window.lucide) lucide.createIcons();
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      conversationHistory = [];
      chatArea.innerHTML = renderCopilotMessages(conversationHistory);
      showToast('Chat history cleared', 'default', 1500);
    });
  }

  let micActive = false;
  micBtn.addEventListener('click', () => {
    micActive = !micActive;
    micBtn.classList.toggle('active', micActive);
    if (micActive) {
      showToast('Listening...', 'info', 2000);
    }
  });

  // Scroll to bottom on load
  if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}
