// ============================================
// SYBRAI — Home (Bug Fixer) Screen
// ============================================

import { chatConversation } from '../data/mockData.js';
import { showToast } from '../utils/toast.js';

export function renderHome() {
  const screen = document.createElement('div');
  screen.className = 'screen screen--home';

  screen.innerHTML = `
    <div class="top-app-bar">
      <div class="top-app-bar__leading">
        <img src="/logo.png" alt="SYBRAI" class="top-app-bar__logo" />
        <h1 class="top-app-bar__title">SYBRAI</h1>
      </div>
      <div class="top-app-bar__trailing">
        <button class="top-app-bar__icon-btn" aria-label="Notifications" onclick="window.location.hash='/notifications'">
          <i data-lucide="bell"></i>
          <span class="notification-dot"></span>
        </button>
      </div>
    </div>

    <div class="home-chat-area" id="home-chat">
      <div class="voice-indicator" style="align-self: flex-start; margin-bottom: var(--space-sm);">
        <div class="voice-indicator__dot"></div>
        <span class="voice-indicator__text">AI is listening...</span>
        <div class="voice-indicator__bars">
          <div class="voice-indicator__bar"></div>
          <div class="voice-indicator__bar"></div>
          <div class="voice-indicator__bar"></div>
          <div class="voice-indicator__bar"></div>
          <div class="voice-indicator__bar"></div>
        </div>
      </div>

      ${renderMessages(chatConversation)}
    </div>

    <div class="chat-input-bar">
      <input class="chat-input-bar__field" id="home-input" type="text" placeholder="Type your issue or bug..." aria-label="Describe your issue" />
      <button class="chat-input-bar__btn" id="mic-btn" aria-label="Voice input">
        <i data-lucide="mic"></i>
      </button>
      <button class="chat-input-bar__btn chat-input-bar__btn--send" id="send-btn" aria-label="Send message">
        <i data-lucide="send"></i>
      </button>
    </div>
  `;

  // Wire up interactivity after render
  setTimeout(() => setupHomeInteractivity(), 50);

  return screen;
}

function renderMessages(messages) {
  return messages.map(msg => {
    if (msg.type === 'ai') {
      return `
        <div class="message-row message-row--ai">
          <div class="message-avatar">
            <i data-lucide="bot"></i>
          </div>
          <div>
            <div class="message-bubble message-bubble--ai">
              ${formatMessageText(msg.text)}
            </div>
            ${msg.actions ? `
              <div class="action-chips">
                ${msg.actions.map((a, i) => `
                  <button class="action-chip ${i === msg.actions.length - 1 ? 'action-chip--primary' : ''}" data-action="${a}">
                    ${a}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="message-row message-row--user">
          <div class="message-bubble message-bubble--user">
            ${formatMessageText(msg.text)}
          </div>
        </div>
      `;
    }
  }).join('');
}

function formatMessageText(text) {
  // Handle code backticks
  let formatted = text.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.8em;">$1</code>');
  // Handle numbered lists
  formatted = formatted.replace(/(\d+\.\s)/g, '<br>$1');
  // Handle newlines
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

function setupHomeInteractivity() {
  const input = document.getElementById('home-input');
  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');
  const chatArea = document.getElementById('home-chat');

  if (!input) return;

  // Enable send button when typing
  input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
      sendBtn.classList.add('enabled');
    } else {
      sendBtn.classList.remove('enabled');
    }
  });

  // Send message
  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message-row message-row--user';
    userMsg.innerHTML = `<div class="message-bubble message-bubble--user">${text}</div>`;
    chatArea.appendChild(userMsg);

    input.value = '';
    sendBtn.classList.remove('enabled');

    // Show typing indicator
    const typingRow = document.createElement('div');
    typingRow.className = 'message-row message-row--ai';
    typingRow.id = 'typing-row';
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

    // Simulate AI response
    setTimeout(() => {
      typingRow.remove();
      const aiMsg = document.createElement('div');
      aiMsg.className = 'message-row message-row--ai';
      aiMsg.innerHTML = `
        <div class="message-avatar"><i data-lucide="bot"></i></div>
        <div>
          <div class="message-bubble message-bubble--ai">
            I'm analyzing your issue: "<strong>${text}</strong>"<br><br>
            Let me scan the codebase for related problems and potential fixes. This will take just a moment...
          </div>
          <div class="action-chips">
            <button class="action-chip" data-action="Show Details">Show Details</button>
            <button class="action-chip action-chip--primary" data-action="Auto Fix">Auto Fix</button>
          </div>
        </div>
      `;
      chatArea.appendChild(aiMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
      if (window.lucide) lucide.createIcons();
      setupActionChips();
    }, 1500);
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Mic toggle
  let micActive = false;
  micBtn.addEventListener('click', () => {
    micActive = !micActive;
    micBtn.classList.toggle('active', micActive);
  });

  setupActionChips();
}

function setupActionChips() {
  document.querySelectorAll('.action-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'Auto Fix') {
        showToast('Applying fixes...', 'info');
        setTimeout(() => {
          showToast('All issues fixed successfully! 🎉', 'success');
        }, 2000);
      } else if (action === 'Show Details') {
        window.location.hash = '/analysis';
      }
    });
  });
}
