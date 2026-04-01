/**
 * StorytellerPanel -- Shows drama score, storyteller history, and current drama mode.
 */
function StorytellerPanel({ state, onClose }) {
  if (!state) return null;

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const dramaLabel = storyteller.getDramaLabel();
  const history = storyteller.history || [];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Storyteller</h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '13px' }}>Close</button>
        </div>

        {/* Drama gauge */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8b949e' }}>Drama Score</span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: dramaLabel.color }}>{dramaLabel.label}</span>
          </div>
          <div className="progress-bar" style={{ height: '10px' }}>
            <div className="progress-fill" style={{
              width: `${Math.round(storyteller.dramaScore)}%`,
              background: dramaLabel.color,
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#484f58', marginTop: '4px', textAlign: 'right' }}>
            {Math.round(storyteller.dramaScore)} / 100
          </div>
        </div>

        {/* How it works */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '6px' }}>How it works</div>
          <div style={{ fontSize: '12px', color: '#c9d1d9', lineHeight: '1.6' }}>
            The storyteller watches your company's trajectory. When things go well, drama rises — expect challenges.
            When you're struggling, drama drops — opportunities appear. Events are chosen to keep the narrative compelling.
          </div>
        </div>

        {/* Event history */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '8px' }}>
            Recent Story Events ({history.length})
          </div>
          {history.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#484f58', fontStyle: 'italic' }}>No storyteller events yet.</div>
          ) : (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {history.slice().reverse().map((h, i) => (
                <div key={i} style={{
                  padding: '8px 0',
                  borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'flex', justifyContent: 'space-between', fontSize: '12px',
                }}>
                  <span style={{ color: '#c9d1d9' }}>{h.eventId}</span>
                  <span style={{ color: '#8b949e' }}>Week {h.week} | Drama {Math.round(h.drama)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
