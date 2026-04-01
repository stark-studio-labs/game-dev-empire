/**
 * RemasterWizard — Pick new platforms for a remaster.
 * Costs 30% of original dev cost. Score/reviews same as normal.
 * Available for games released 5+ years ago.
 */
function RemasterWizard({ state, game, onStart, onCancel }) {
  const [platformIds, setPlatformIds] = React.useState([]);

  if (!state || !game) return null;

  const availablePlatforms = state.availablePlatforms || [];
  const sizeData = GAME_SIZES[game.size] || {};
  const remasterCost = Math.round((sizeData.cost || 0) * 0.3);
  const licenseFees = platformIds.reduce((sum, pid) => {
    const p = PLATFORMS.find(pl => pl.id === pid);
    return sum + (p ? p.licenseFee : 0);
  }, 0);
  const totalCost = remasterCost + licenseFees;
  const canAfford = state.cash >= totalCost;

  const togglePlatform = (id) => {
    setPlatformIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const handleStart = () => {
    if (platformIds.length === 0 || !canAfford) return;
    engine.startRemaster(game, platformIds);
    onStart();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#da7cff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Remaster
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
              {game.title}
            </h2>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
              {game.genre} / {game.size} / Released Y{game.releaseYear} — Score {game.reviewAvg.toFixed(1)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#8b949e' }}>Dev Cost</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#d29922' }}>{formatCash(remasterCost)}</div>
            <div style={{ fontSize: '10px', color: '#484f58' }}>30% of original</div>
          </div>
        </div>

        {/* Info card */}
        <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8b949e', lineHeight: 1.6 }}>
            A remaster targets <strong style={{ color: '#e6edf3' }}>new platforms</strong> with 50% faster development.
            Quality is based on the original game's reputation. Older titles gain a nostalgia bonus.
          </div>
        </div>

        {/* Platform selection */}
        <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Target Platforms <span style={{ color: '#484f58', textTransform: 'none' }}>(select 1–3)</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
          {availablePlatforms.map(p => {
            const selected = platformIds.includes(p.id);
            const disabled = !selected && platformIds.length >= 3;
            return (
              <div
                key={p.id}
                className={`selection-item ${selected ? 'selected' : ''}`}
                onClick={() => !disabled && togglePlatform(p.id)}
                style={{ padding: '10px', textAlign: 'left', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>{p.company}</div>
                <div style={{ fontSize: '11px', color: '#484f58', marginTop: '2px' }}>
                  License: ${(p.licenseFee / 1000).toFixed(0)}K
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost summary */}
        {platformIds.length > 0 && (
          <div className="glass-card" style={{ padding: '10px 14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#8b949e' }}>Dev cost (30%)</span>
              <span style={{ color: '#d29922' }}>{formatCash(remasterCost)}</span>
            </div>
            {licenseFees > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                <span style={{ color: '#8b949e' }}>License fees</span>
                <span style={{ color: '#d29922' }}>{formatCash(licenseFees)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#8b949e' }}>Total</span>
              <span style={{ color: canAfford ? '#3fb950' : '#f85149' }}>{formatCash(totalCost)}</span>
            </div>
            {!canAfford && (
              <div style={{ fontSize: '11px', color: '#f85149', marginTop: '4px' }}>
                Insufficient funds (have {formatCash(state.cash)})
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn-accent"
            onClick={handleStart}
            disabled={platformIds.length === 0 || !canAfford}
            style={{ flex: 1 }}
          >
            Start Remaster
          </button>
        </div>
      </div>
    </div>
  );
}
