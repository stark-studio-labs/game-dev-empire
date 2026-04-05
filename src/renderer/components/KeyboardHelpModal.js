/**
 * KeyboardHelpModal — Reference card for all keyboard shortcuts.
 * Triggered by "?" key. Closes on Escape or click-outside.
 */
function KeyboardHelpModal({ onClose }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const Row = ({ keys, label }) => (
    <div className="kbhelp-row">
      <div className="kbhelp-keys">
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="kbhelp-or">or</span>}
            <kbd className="kbhelp-key">{k}</kbd>
          </React.Fragment>
        ))}
      </div>
      <div className="kbhelp-label">{label}</div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content kbhelp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kbhelp-header">
          <div>
            <div className="panel-header" style={{ marginBottom: '4px' }}>Reference</div>
            <h2 className="kbhelp-title">Keyboard Shortcuts</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="kbhelp-section-title">Game Speed</div>
        <Row keys={['Space']}   label="Pause / Resume" />
        <Row keys={['1']}       label="Pause (speed 0)" />
        <Row keys={['2']}       label="Normal (1x)" />
        <Row keys={['3']}       label="Fast (2x)" />
        <Row keys={['4']}       label="Very Fast (4x)" />

        <div className="kbhelp-section-title">Open Panel</div>
        <Row keys={['S']}       label="Staff" />
        <Row keys={['F']}       label="Finance" />
        <Row keys={['R']}       label="Research" />
        <Row keys={['T']}       label="Training" />
        <Row keys={['C']}       label="Campaigns (marketing)" />
        <Row keys={['V']}       label="Verticals" />
        <Row keys={['M']}       label="Market" />
        <Row keys={['H']}       label="Game History" />

        <div className="kbhelp-section-title">Utility</div>
        <Row keys={['Esc']}     label="Close any open panel" />
        <Row keys={['?']}       label="Show this reference" />

        <div className="kbhelp-footer">
          Shortcuts are disabled while typing in inputs.
        </div>
      </div>
    </div>
  );
}
