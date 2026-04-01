/**
 * VictoryTracker — Shows all 5 Civ-style victory paths with progress bars.
 * Highlights the closest victory path. Accessible from TopBar trophy icon.
 */

function VictoryTracker({ state, onClose }) {
  if (!state) return null;

  const paths = victorySystem.getAllProgress(state);
  const moonshots = victorySystem.getMoonshotProjects();

  // Find the closest (highest progress) path
  const closestIdx = paths.reduce((best, p, i) =>
    p.progress > paths[best].progress ? i : best, 0);

  const formatValue = (val, format) => {
    if (format === 'cash') {
      if (val >= 1000000000) return '$' + (val / 1000000000).toFixed(2) + 'B';
      if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K';
      return '$' + val.toLocaleString();
    }
    if (format === 'fans') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
      return val.toLocaleString();
    }
    if (format === 'percent') {
      return (val * 100).toFixed(1) + '%';
    }
    if (format === 'text') return val;
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'success';
    if (pct >= 66) return 'accent';
    if (pct >= 33) return 'warning';
    return 'purple';
  };

  const handleStartMoonshot = (projectId) => {
    const result = victorySystem.startMoonshot(projectId, engine.state);
    if (result.success) {
      showToast(result.message, 'success', 4000);
      engine._emit();
      engine._save();
    } else {
      showToast(result.message, 'danger', 3000);
    }
  };

  const handleCancelMoonshot = () => {
    if (victorySystem.cancelMoonshot()) {
      showToast('Moonshot cancelled (no refund).', 'warning', 3000);
      engine._emit();
      engine._save();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', padding: '0',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
              Victory Paths
            </h2>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
              5 ways to achieve legendary status
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#8b949e',
            fontSize: '20px', cursor: 'pointer', padding: '4px 8px',
          }}>
            ✕
          </button>
        </div>

        {/* Victory Paths */}
        <div style={{ padding: '16px 28px' }}>
          {paths.map((path, i) => {
            const isClosest = i === closestIdx && !path.isComplete;
            return (
              <div key={path.id} style={{
                background: path.isComplete
                  ? 'rgba(63,185,80,0.08)'
                  : isClosest
                    ? 'rgba(88,166,255,0.06)'
                    : 'rgba(255,255,255,0.02)',
                border: path.isComplete
                  ? '1px solid rgba(63,185,80,0.25)'
                  : isClosest
                    ? '1px solid rgba(88,166,255,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '12px',
                position: 'relative',
              }}>
                {/* Closest badge */}
                {isClosest && (
                  <div style={{
                    position: 'absolute', top: '-8px', right: '16px',
                    background: 'linear-gradient(135deg, #58a6ff, #1f6feb)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '2px 10px', borderRadius: '10px',
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                  }}>
                    Closest
                  </div>
                )}

                {/* Complete badge */}
                {path.isComplete && (
                  <div style={{
                    position: 'absolute', top: '-8px', right: '16px',
                    background: 'linear-gradient(135deg, #3fb950, #2ea043)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '2px 10px', borderRadius: '10px',
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                  }}>
                    Achieved
                  </div>
                )}

                {/* Icon + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{path.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '15px', fontWeight: 700,
                      color: path.isComplete ? '#3fb950' : '#e6edf3',
                    }}>
                      {path.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b949e' }}>
                      {path.description}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar
                  value={path.progress}
                  color={path.isComplete ? 'success' : getProgressColor(path.progress)}
                  size="md"
                  showPercent
                  style={{ marginBottom: '10px' }}
                />

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {path.details.map((d, j) => (
                    <div key={j} style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {d.label}
                      </div>
                      <div style={{ fontSize: '14px', color: '#c9d1d9', fontWeight: 600, marginTop: '2px' }}>
                        {formatValue(d.current, d.format)}
                        {d.target !== null && d.format !== 'text' && (
                          <span style={{ color: '#484f58', fontWeight: 400, fontSize: '12px' }}>
                            {' / '}{formatValue(d.target, d.format)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Moonshot Projects Section */}
        <div style={{
          padding: '16px 28px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e6edf3', marginBottom: '12px' }}>
            Moonshot Projects
          </h3>
          <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '16px' }}>
            $100M each, ~2 years of research. Complete all 3 for Innovation Leader victory.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {moonshots.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: p.completed
                  ? 'rgba(63,185,80,0.06)'
                  : p.inProgress
                    ? 'rgba(218,124,255,0.06)'
                    : 'rgba(255,255,255,0.02)',
                border: p.completed
                  ? '1px solid rgba(63,185,80,0.2)'
                  : p.inProgress
                    ? '1px solid rgba(218,124,255,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '12px 16px',
              }}>
                <span style={{ fontSize: '22px' }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600,
                    color: p.completed ? '#3fb950' : '#e6edf3',
                  }}>
                    {p.name}
                    {p.completed && <span style={{ marginLeft: '8px', fontSize: '11px' }}>COMPLETE</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                    {p.description}
                  </div>
                  {p.inProgress && (
                    <div style={{ marginTop: '6px' }}>
                      <ProgressBar
                        value={((p.durationWeeks - p.weeksLeft) / p.durationWeeks) * 100}
                        color="purple"
                        size="sm"
                        showPercent
                      />
                      <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '2px' }}>
                        ~{Math.ceil(p.weeksLeft)} weeks remaining
                      </div>
                    </div>
                  )}
                </div>
                {!p.completed && !p.inProgress && !victorySystem.activeMoonshot && (
                  <button
                    className="btn-accent"
                    onClick={() => handleStartMoonshot(p.id)}
                    style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    Fund $100M
                  </button>
                )}
                {p.inProgress && (
                  <button
                    className="btn-secondary"
                    onClick={handleCancelMoonshot}
                    style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap', opacity: 0.7 }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
