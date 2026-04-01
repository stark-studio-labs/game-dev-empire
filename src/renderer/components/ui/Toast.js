/**
 * Toast — Premium notification system
 * Global showToast(message, type) function replaces all alert() calls.
 * Renders stacked slide-in toasts in the bottom-right corner.
 */

// ── Global toast state ──────────────────────────────────────────────────
const _toastState = {
  toasts: [],
  listeners: [],
  nextId: 1,

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  },

  _emit() {
    this.listeners.forEach(fn => fn([...this.toasts]));
  },

  add(message, type = 'info', duration = 4000) {
    const id = this.nextId++;
    this.toasts.push({ id, message, type, createdAt: Date.now(), exiting: false });
    this._emit();

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  },

  dismiss(id) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast || toast.exiting) return;
    toast.exiting = true;
    this._emit();
    // Remove after exit animation
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this._emit();
    }, 300);
  },
};

/** Global function — call from anywhere: showToast('Saved!', 'success') */
function showToast(message, type = 'info', duration = 4000) {
  return _toastState.add(message, type, duration);
}


// ── Individual Toast component ──────────────────────────────────────────

function Toast({ toast, onDismiss }) {
  const typeConfig = {
    success: { color: '#3fb950', bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.25)', icon: '\u2713' },
    warning: { color: '#d29922', bg: 'rgba(210,153,34,0.12)', border: 'rgba(210,153,34,0.25)', icon: '!' },
    error:   { color: '#f85149', bg: 'rgba(248,81,73,0.12)',  border: 'rgba(248,81,73,0.25)',  icon: '\u2717' },
    info:    { color: '#58a6ff', bg: 'rgba(88,166,255,0.12)', border: 'rgba(88,166,255,0.25)', icon: 'i' },
  };

  const cfg = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      className={toast.exiting ? 'ui-toast ui-toast--exit' : 'ui-toast'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: '380px',
        minWidth: '260px',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <div style={{
        minWidth: '24px',
        height: '24px',
        borderRadius: '50%',
        background: `${cfg.color}20`,
        color: cfg.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {cfg.icon}
      </div>

      {/* Message */}
      <div style={{
        flex: 1,
        fontSize: '13px',
        fontWeight: 500,
        color: '#e6edf3',
        lineHeight: 1.4,
      }}>
        {toast.message}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#8b949e',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '2px 4px',
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.6,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
      >
        {'\u00d7'}
      </button>
    </div>
  );
}


// ── ToastContainer — renders in bottom-right, stacks vertically ─────────

function ToastContainer() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const unsub = _toastState.subscribe(setToasts);
    return () => unsub();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={(id) => _toastState.dismiss(id)} />
      ))}
    </div>
  );
}
