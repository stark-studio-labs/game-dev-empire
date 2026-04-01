/**
 * Modal — Unified modal system with backdrop blur, Escape key, outside click.
 * Usage:
 *   <Modal open={isOpen} onClose={handleClose} title="My Title">
 *     <ModalBody>...content...</ModalBody>
 *     <ModalFooter>
 *       <button className="btn-secondary" onClick={handleClose}>Cancel</button>
 *       <button className="btn-accent" onClick={handleSave}>Save</button>
 *     </ModalFooter>
 *   </Modal>
 */

function Modal({ open, onClose, title, subtitle, children, maxWidth = '600px', zIndex = 100 }) {
  const [exiting, setExiting] = React.useState(false);
  const overlayRef = React.useRef(null);

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, 200);
  };

  // Close on outside click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={exiting ? 'ui-modal-overlay ui-modal-overlay--exit' : 'ui-modal-overlay'}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex,
        animation: exiting ? 'uiModalFadeOut 0.2s ease forwards' : 'fadeIn 0.2s ease',
      }}
    >
      <div
        className={exiting ? 'ui-modal-content ui-modal-content--exit' : 'ui-modal-content'}
        style={{
          background: '#161b22',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '0',
          maxWidth,
          width: '90%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: exiting ? 'uiModalSlideDown 0.2s ease forwards' : 'slideUp 0.25s ease',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e6edf3' }}>{title}</div>
              {subtitle && (
                <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px' }}>{subtitle}</div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="modal-close-btn"
              aria-label="Close"
            >
              {'\u00d7'}
            </button>
          </div>
        )}

        {/* Body + Footer rendered as children */}
        {children}
      </div>
    </div>
  );
}


function ModalBody({ children, style }) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px 24px',
      ...style,
    }}>
      {children}
    </div>
  );
}


function ModalFooter({ children, style }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      padding: '16px 24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
      ...style,
    }}>
      {children}
    </div>
  );
}
