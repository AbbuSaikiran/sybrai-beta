// ============================================
// SYBRAI — Real-Time Event Bus
// Pub/Sub system for live scan events across screens
// ============================================

const listeners = {};

/**
 * Subscribe to an event
 * @param {string} event - Event name (e.g. 'scan:start', 'scan:finding', 'fix:applied')
 * @param {Function} callback - Handler function
 */
export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

/**
 * Unsubscribe from an event
 */
export function off(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(cb => cb !== callback);
}

/**
 * Emit an event to all subscribers
 */
export function emit(event, data) {
  if (!listeners[event]) return;
  listeners[event].forEach(cb => {
    try { cb(data); } catch (e) { console.error(`[EventBus] Error in ${event} handler:`, e); }
  });
}

/**
 * Subscribe once — auto-unsubscribe after first fire
 */
export function once(event, callback) {
  const wrapper = (data) => {
    off(event, wrapper);
    callback(data);
  };
  on(event, wrapper);
}

// Event constants for type safety
export const EVENTS = {
  SCAN_START: 'scan:start',
  SCAN_PROGRESS: 'scan:progress',
  SCAN_FINDING: 'scan:finding',
  SCAN_COMPLETE: 'scan:complete',
  FIX_START: 'fix:start',
  FIX_PROGRESS: 'fix:progress',
  FIX_APPLIED: 'fix:applied',
  FIX_FAILED: 'fix:failed',
  FIX_ALL_COMPLETE: 'fix:all_complete',
  ACTIVITY: 'activity',       // generic activity feed entry
};
