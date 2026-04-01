/**
 * TimelinePanel -- Shows tech history timeline events (past and upcoming).
 */
function TimelinePanel({ state, onClose }) {
  if (!state) return null;

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const allEvents = techTimeline.getFullTimeline();
  const firedIds = new Set(techTimeline.getFiredEvents().map(e => e.id));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Tech Timeline</h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '13px' }}>Close</button>
        </div>

        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '16px' }}>
          Year {state.year} -- Historical tech events that shape the industry.
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {allEvents.map((evt, i) => {
            const fired = firedIds.has(evt.id);
            const upcoming = !fired && evt.year > state.year;
            const color = fired ? (evt.color || '#58a6ff') : '#30363d';

            return (
              <div key={evt.id} style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                background: fired ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                borderLeft: `3px solid ${color}`,
                opacity: upcoming ? 0.4 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: fired ? '#e6edf3' : '#484f58' }}>
                    {fired ? evt.title : '???'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#8b949e', fontWeight: 500 }}>
                    Year {evt.year}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: fired ? '#8b949e' : '#30363d' }}>
                  {fired ? evt.desc : 'Something will happen in the industry...'}
                </div>
                {fired && (
                  <div style={{ fontSize: '11px', color: color, marginTop: '4px', fontWeight: 500 }}>
                    {evt.category || 'Industry Event'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
