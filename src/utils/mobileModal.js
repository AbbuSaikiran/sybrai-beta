// ============================================
// SYBRAI — Mobile PWA Install & QR Code Modal
// Generates QR codes and step-by-step install
// instructions for Android & iOS mobile devices
// ============================================

export function showMobileInstallModal(customUrl = null) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Detect current origin or fallback to Vercel production URL
  const currentUrl = customUrl || (window.location.hostname !== 'localhost' ? window.location.href : 'https://sybrai-beta.vercel.app');
  const localWifiUrl = 'http://10.205.195.177:3000';

  const qrCodeVercel = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=0f172a&color=38bdf8`;
  const qrCodeWifi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(localWifiUrl)}&bgcolor=0f172a&color=10b981`;

  modalContainer.innerHTML = `
    <div class="modal-backdrop active" id="mobile-install-backdrop">
      <div class="modal-sheet" role="dialog" aria-labelledby="mobile-modal-title" style="max-height: 90vh; text-align: center;">
        <div class="modal-sheet__handle"></div>
        <div class="modal-sheet__header" style="justify-content:center; flex-direction:column; gap:4px;">
          <h2 class="modal-sheet__title" id="mobile-modal-title" style="color:var(--color-primary); font-size:18px;">
            <i data-lucide="smartphone"></i> Install SYBRAI on Mobile
          </h2>
          <p style="font-size:12px; color:var(--color-text-secondary); margin:0;">
            Point your phone's camera at the QR code below
          </p>
        </div>

        <div class="modal-sheet__body" style="padding:12px 16px;">
          <!-- QR Code Container -->
          <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 14px; display: inline-block; box-shadow: 0 8px 32px rgba(0,0,0,0.4); margin-bottom: 12px;">
            <img id="qr-display-img" src="${qrCodeVercel}" alt="Scan QR Code to open on Mobile" style="width:180px; height:180px; border-radius:8px; display:block;" />
          </div>

          <!-- URL Switcher Tabs -->
          <div style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
            <button class="btn btn--secondary active" id="btn-qr-vercel" style="font-size:11px; padding:4px 10px; border-color:var(--color-primary); color:var(--color-primary);">
              🌐 Vercel Web App
            </button>
            <button class="btn btn--secondary" id="btn-qr-wifi" style="font-size:11px; padding:4px 10px;">
              📶 Local Wi-Fi (Live)
            </button>
          </div>

          <div id="qr-url-text" style="font-size:11px; font-family:var(--font-mono); color:var(--color-text-secondary); word-break:break-all; background:var(--color-surface); padding:6px 10px; border-radius:6px; border:1px solid var(--color-border); margin-bottom:14px;">
            <a href="${currentUrl}" target="_blank" style="color:var(--color-primary); text-decoration:none;">${currentUrl}</a>
          </div>

          <!-- Step-by-Step Install Guide -->
          <div style="text-align:left; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:12px; font-size:12px;">
            <div style="font-weight:700; color:var(--color-text-primary); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="download" style="width:14px;height:14px;color:#10B981;"></i> How to Install to Home Screen:
            </div>
            <div style="margin-bottom:6px;">
              <strong>🤖 Android (Chrome/Brave):</strong> Tap <code>⋮</code> (Menu) ➔ Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </div>
            <div>
              <strong>🍏 iPhone / iPad (Safari):</strong> Tap <code>⎋</code> (Share icon) ➔ Scroll down and tap <strong>"Add to Home Screen"</strong> (<code>+</code>).
            </div>
          </div>
        </div>

        <div class="modal-sheet__footer">
          <button class="btn btn--primary" id="mobile-modal-close" style="width:100%;">
            Done
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const qrImg = modalContainer.querySelector('#qr-display-img');
  const urlText = modalContainer.querySelector('#qr-url-text');
  const btnVercel = modalContainer.querySelector('#btn-qr-vercel');
  const btnWifi = modalContainer.querySelector('#btn-qr-wifi');
  const closeBtn = modalContainer.querySelector('#mobile-modal-close');

  btnVercel?.addEventListener('click', () => {
    qrImg.src = qrCodeVercel;
    urlText.innerHTML = `<a href="${currentUrl}" target="_blank" style="color:var(--color-primary); text-decoration:none;">${currentUrl}</a>`;
    btnVercel.style.borderColor = 'var(--color-primary)';
    btnVercel.style.color = 'var(--color-primary)';
    btnWifi.style.borderColor = '';
    btnWifi.style.color = '';
  });

  btnWifi?.addEventListener('click', () => {
    qrImg.src = qrCodeWifi;
    urlText.innerHTML = `<a href="${localWifiUrl}" target="_blank" style="color:#10B981; text-decoration:none;">${localWifiUrl}</a>`;
    btnWifi.style.borderColor = '#10B981';
    btnWifi.style.color = '#10B981';
    btnVercel.style.borderColor = '';
    btnVercel.style.color = '';
  });

  closeBtn?.addEventListener('click', () => {
    modalContainer.innerHTML = '';
  });
}
