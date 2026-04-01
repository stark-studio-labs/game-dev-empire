/**
 * ConferencePanel -- Shows upcoming conferences and attendance history.
 * Also handles the pending conference decision modal.
 */
function ConferencePanel({ state, onClose, pendingConference, onResolveConference }) {
  if (!state) return null;

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && !pendingConference) onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [pendingConference]);

  const conferences = conferenceSystem.getConferencesThisYear(state);
  const history = conferenceSystem.getHistory();
  const lastResult = conferenceSystem.conferenceResult;

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  // Pending conference decision
  if (pendingConference) {
    const cost = conferenceSystem.getAttendCost(pendingConference, state);
    const canAfford = state.cash >= cost;

    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '520px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{pendingConference.name}</h2>
          <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '16px' }}>
            {pendingConference.desc}
          </div>
          <div style={{ fontSize: '14px', color: '#c9d1d9', marginBottom: '16px' }}>
            Attendance cost: <span style={{ fontWeight: 600, color: canAfford ? '#3fb950' : '#f85149' }}>{formatCash(cost)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className="btn-accent" disabled={!canAfford}
              onClick={() => onResolveConference('attend_announce')}
              style={{ padding: '10px', fontSize: '14px', opacity: canAfford ? 1 : 0.4 }}>
              Announce a Game (max hype + award chance)
            </button>
            <button className="btn-accent" disabled={!canAfford}
              onClick={() => onResolveConference('attend_recruit')}
              style={{ padding: '10px', fontSize: '14px', opacity: canAfford ? 1 : 0.4 }}>
              Network & Recruit (find star talent)
            </button>
            <button className="btn-accent" disabled={!canAfford}
              onClick={() => onResolveConference('attend_spy')}
              style={{ padding: '10px', fontSize: '14px', opacity: canAfford ? 1 : 0.4 }}>
              Gather Intel (spy on competitors)
            </button>
            <button className="btn-secondary"
              onClick={() => onResolveConference('skip')}
              style={{ padding: '10px', fontSize: '13px' }}>
              Skip this year
            </button>
          </div>
        </div>
      </div>
    );
  }

  // History / overview view
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Conferences</h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '13px' }}>Close</button>
        </div>

        {/* This year's conferences */}
        <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '8px' }}>This Year</div>
        {conferences.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#484f58', marginBottom: '16px' }}>No conferences available yet.</div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            {conferences.map(c => {
              const attended = history.some(h => h.confId === c.id && h.year === state.year);
              return (
                <div key={c.id} className="glass-card" style={{
                  padding: '12px', marginBottom: '8px',
                  borderLeft: `3px solid ${attended ? '#3fb950' : '#484f58'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: '#e6edf3', fontSize: '14px' }}>{c.name}</span>
                    <span style={{ fontSize: '11px', color: '#8b949e' }}>Month {c.month}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
                    {attended ? 'Attended' : (state.month > c.month ? 'Missed' : 'Upcoming')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Last result */}
        {lastResult && lastResult.attended && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '6px' }}>Last Conference Result</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#3fb950', marginBottom: '4px' }}>{lastResult.confName}</div>
            {lastResult.outcomes.map((o, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#c9d1d9', marginTop: '4px' }}>{o}</div>
            ))}
            <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '8px' }}>
              Cost: {formatCash(lastResult.cost)} | +{lastResult.fansGain.toLocaleString()} fans | +{lastResult.hypeGain} hype
            </div>
          </div>
        )}

        {/* Attendance history */}
        <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '8px' }}>History ({history.length})</div>
        {history.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#484f58', fontStyle: 'italic' }}>No conferences attended yet.</div>
        ) : (
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {history.slice().reverse().map((h, i) => (
              <div key={i} style={{
                padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', fontSize: '12px',
              }}>
                <span style={{ color: '#c9d1d9' }}>{h.confId} (Y{h.year})</span>
                <span style={{ color: '#8b949e' }}>+{(h.fansGain || 0).toLocaleString()} fans{h.awardWon ? ` | ${h.awardWon}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
