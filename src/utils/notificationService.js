// ============================================
// SYBRAI — Mobile Notification Service
// Native Device Push Notifications & State Management
// ============================================

import { notifications as defaultMockNotifications } from '../data/mockData.js';

const STORAGE_KEY = 'sybrai_notifications_v1';
const LISTENERS = new Set();

/**
 * Check if the browser / mobile device supports notifications
 */
export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current permission state: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request permission from the mobile device/browser
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    notifyListeners();
    return permission;
  } catch (err) {
    console.error('[NotificationService] Error requesting permission:', err);
    return Notification.permission;
  }
}

/**
 * Play a synthetic notification chime using Web Audio API
 */
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    // AudioContext autoplay restrictions or not allowed
  }
}

/**
 * Trigger physical haptic vibration on mobile devices
 */
export function triggerHaptic(pattern = [100, 50, 100]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

/**
 * Send a notification to the device's system tray / heads-up banner
 */
export async function sendDeviceNotification({ title, body, icon = '/icons/icon-192.png', tag, data = {} }) {
  // Always trigger sound & haptics on device
  playNotificationSound();
  triggerHaptic([150, 80, 150]);

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const options = {
    body,
    icon,
    badge: '/icons/icon-192.png',
    tag: tag || `sybrai-${Date.now()}`,
    vibrate: [200, 100, 200],
    data: {
      url: '/#/notifications',
      ...data,
    },
  };

  try {
    // Try Service Worker registration first (standard for Mobile PWAs)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }

    // Fallback to standard Notification constructor
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('[NotificationService] Failed to show system notification:', err);
    return false;
  }
}

/**
 * Convenience helper to show device notification directly with title and body
 */
export async function showDeviceNotification(title, body, options = {}) {
  return sendDeviceNotification({ title, body, ...options });
}

/**
 * Load all active notifications (saved in localStorage or seed from mock data)
 */
export function getNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  // Initialize with mock notifications
  saveNotifications(defaultMockNotifications);
  return defaultMockNotifications;
}

/**
 * Save notification list to localStorage and trigger listeners
 */
export function saveNotifications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
  notifyListeners();
}

/**
 * Add a new notification, save it, and send a mobile device notification
 */
export async function addNotification(notification, sendToDevice = true) {
  const current = getNotifications();
  const newItem = {
    id: notification.id || Date.now(),
    title: notification.title || 'New Alert',
    desc: notification.desc || notification.body || '',
    time: notification.time || 'Just now',
    icon: notification.icon || 'alert-triangle',
    unread: true,
    type: notification.type || 'warning',
    file: notification.file || null,
    fixSuggestion: notification.fixSuggestion || null,
    isAiGenerated: Boolean(notification.isAiGenerated),
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current];
  saveNotifications(updated);

  if (sendToDevice) {
    await sendDeviceNotification({
      title: `SYBRAI: ${newItem.title}`,
      body: newItem.desc,
      data: { id: newItem.id },
    });
  }

  return newItem;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, unread: false }));
  saveNotifications(updated);
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
  saveNotifications([]);
}

/**
 * Unread notifications count
 */
export function getUnreadCount() {
  return getNotifications().filter(n => n.unread).length;
}

/**
 * Subscribe to notification changes
 */
export function subscribeNotifications(callback) {
  LISTENERS.add(callback);
  return () => LISTENERS.delete(callback);
}

function notifyListeners() {
  const list = getNotifications();
  const count = getUnreadCount();
  LISTENERS.forEach(cb => {
    try { cb(list, count); } catch (e) {}
  });

  // Also update any badge dots on top-bar icons
  document.querySelectorAll('.notification-dot').forEach(dot => {
    dot.style.display = count > 0 ? 'block' : 'none';
  });
}
