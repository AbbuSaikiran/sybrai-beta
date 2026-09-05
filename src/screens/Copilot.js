// ============================================
// SYBRAI — Copilot Chat Screen
// ============================================

import { copilotConversation } from '../data/mockData.js';
import { showToast } from '../utils/toast.js';

export function renderCopilot() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--copilot';

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <button class="top-app-bar__icon-btn" aria-label="Back" onclick="window.location.hash='/home'">
          <i data-lucide="arrow-left"></i>
        </button>
        <h1 class="top-app-bar__title">SYBRAI AI</h1>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" aria-label="More options">
          <i data-lucide="more-horizontal"></i>
        </button>
      </div>
    </div>

    <div class="copilot-chat-area" id="copilot-chat">
      ${renderCopilotMessages(copilotConversation)}
    </div>

    <div class="chat-input-bar">
      <input class="chat-input-bar__field" id="copilot-input" type="text" placeholder="Ask me anything..." aria-label="Ask SYBRAI AI" />
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
  let formatted = text.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

function setupCopilotInteractivity() {
  const input = document.getElementById('copilot-input');
  const sendBtn = document.getElementById('copilot-send');
  const micBtn = document.getElementById('copilot-mic');
  const chatArea = document.getElementById('copilot-chat');

  if (!input) return;

  input.addEventListener('input', () => {
    sendBtn.classList.toggle('enabled', input.value.trim().length > 0);
  });

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'message-row message-row--user';
    userMsg.innerHTML = `<div class="message-bubble message-bubble--user">${text}</div>`;
    chatArea.appendChild(userMsg);

    input.value = '';
    sendBtn.classList.remove('enabled');

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

    const responses = [
      `I've analyzed your query. Based on the current codebase analysis, I can see the issue relates to the component lifecycle. The fix involves properly initializing the state before render.\n\nWould you like me to apply the fix automatically?`,
      `Great question! Looking at the analysis data, your app health score is 92/100. The main area for improvement is memory management in the ImageCache module.\n\nI'd recommend reviewing the Learning section for best practices.`,
      `I found the root cause. The error occurs because the API response handler doesn't account for null values in the response body. I can add proper null checks and error handling.\n\nShall I proceed?`,
    ];

    setTimeout(() => {
      typingRow.remove();
      const aiMsg = document.createElement('div');
      aiMsg.className = 'message-row message-row--ai';
      const response = responses[Math.floor(Math.random() * responses.length)];
      aiMsg.innerHTML = `
        <div class="message-avatar"><i data-lucide="bot"></i></div>
        <div class="message-bubble message-bubble--ai">${formatText(response)}</div>
      `;
      chatArea.appendChild(aiMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
      if (window.lucide) lucide.createIcons();
    }, 1800);
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

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
