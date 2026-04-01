/**
 * TopBar — Cash, fans, date, game progress, speed controls
 */
function TopBar({ state, onSpeedChange, onToggleFinance, showFinance, onToggleResearch, showResearch, onToggleMarket, showMarket, onToggleMorale, showMorale }) {
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

        {/* Market sentiment indicator */}
        {typeof marketSim !== 'undefined' && (
          <div style={{ textAlign: 'center', minWidth: '60px' }}>
            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Market</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: marketSim.getLabel().color }}>
              {marketSim.getLabel().label}
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

        {/* Research toggle (beaker icon) */}
        <button
          className={`speed-btn ${showResearch ? 'active' : ''}`}
          onClick={onToggleResearch}
          title="R&D Laboratory"
          style={{ marginLeft: '8px', fontWeight: 700, fontSize: '14px', lineHeight: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
            <path d="M5 1v5.27L2.37 11.7A2 2 0 004.1 15h7.8a2 2 0 001.73-3.3L11 6.27V1h1V0H4v1h1zm1 0h4v5.5l.07.13L13.42 12H2.58l3.35-5.37.07-.13V1zM6 10a1 1 0 110 2 1 1 0 010-2zm4-1a1 1 0 110 2 1 1 0 010-2z"/>
          </svg>
        </button>

        {/* Market toggle (chart icon) */}
        <button
          className={`speed-btn ${showMarket ? 'active' : ''}`}
          onClick={onToggleMarket}
          title="Market Intelligence"
          style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
            <path d="M1 14h14V0h-1v13H1v1zM3 12h2V7H3v5zm3 0h2V5H6v7zm3 0h2V3H9v9zm3 0h2V1h-2v11z"/>
          </svg>
        </button>

        {/* Morale toggle (people icon) */}
        <button
          className={`speed-btn ${showMorale ? 'active' : ''}`}
          onClick={onToggleMorale}
          title="Studio Culture & Morale"
          style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
            <path d="M5.5 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0-1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0-1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM0 13.5A3.5 3.5 0 013.5 10h1a3.49 3.49 0 012.08.68A4 4 0 008 13.5v.5H0v-.5zm1 0v-.5a2.5 2.5 0 012.5-2.5h1a2.5 2.5 0 012.42 1.9A4 4 0 005 13.5v.5H1v-.5zM16 14h-7v-.5a3.5 3.5 0 013.5-3.5h1a3.5 3.5 0 013.5 3.5v.5zm-1-.5a2.5 2.5 0 00-2.5-2.5h-1a2.5 2.5 0 00-2.5 2.5v.5h6v-.5z"/>
          </svg>
        </button>

        {/* Finance toggle */}
        <button
          className={`speed-btn ${showFinance ? 'active' : ''}`}
          onClick={onToggleFinance}
          title="Finance Dashboard"
          style={{ fontWeight: 700, fontSize: '13px' }}
        >
          $
        </button>
      </div>
    </div>
  );
}
