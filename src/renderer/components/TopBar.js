/**
 * TopBar — Cash, fans, date, game progress, speed controls
 */
function TopBar({ state, onSpeedChange, onToggleFinance, showFinance }) {
  if (!state) return null;

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const formatFans = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const officeNames = ['Garage', 'Small Office', 'Medium Office', 'Large Office'];
  const speedLabels = [
    { value: 0, label: '||' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
  ];

  const devProgress = state.devPhase !== null
    ? ((state.devPhase * 100 + state.devProgress) / 3)
    : null;

  return (
    <div className="glass-card" style={{ margin: '8px 12px', padding: '10px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        {/* Company name & office */}
        <div style={{ minWidth: '160px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#e6edf3' }}>
            {state.companyName}
          </div>
          <div style={{ fontSize: '11px', color: '#8b949e' }}>
            {officeNames[state.level]}
          </div>
        </div>

        {/* Cash */}
        <div style={{ textAlign: 'center', minWidth: '100px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: state.cash < 0 ? '#f85149' : '#3fb950' }}>
            {formatCash(state.cash)}
          </div>
        </div>

        {/* Fans */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fans</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#58a6ff' }}>
            {formatFans(state.fans)}
          </div>
        </div>

        {/* Games Made */}
        <div style={{ textAlign: 'center', minWidth: '60px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Games</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#e6edf3' }}>
            {state.games.length}
          </div>
        </div>

        {/* Development progress */}
        {devProgress !== null && (
          <div style={{ flex: 1, maxWidth: '200px', minWidth: '120px' }}>
            <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>
              Developing: Phase {state.devPhase + 1}/3
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${devProgress}%` }} />
            </div>
          </div>
        )}

        {/* Sales indicator */}
        {state.sellingGame && (
          <div style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>Selling</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#3fb950' }}>
              {formatCash(state.salesRevenue)}
            </div>
          </div>
        )}

        {/* Date */}
        <div style={{ textAlign: 'center', minWidth: '140px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>
            Y{state.year} / M{state.month} / W{state.week}
          </div>
        </div>

        {/* Speed controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {speedLabels.map(s => (
            <button
              key={s.value}
              className={`speed-btn ${engine.speed === s.value ? 'active' : ''}`}
              onClick={() => onSpeedChange(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Finance toggle */}
        <button
          className={`speed-btn ${showFinance ? 'active' : ''}`}
          onClick={onToggleFinance}
          title="Finance Dashboard"
          style={{ marginLeft: '8px', fontWeight: 700, fontSize: '13px' }}
        >
          $
        </button>
      </div>
    </div>
  );
}
