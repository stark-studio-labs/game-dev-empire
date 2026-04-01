/**
 * TopBar — Cash, fans, date, game progress, speed controls
 * Feature icons are locked until earned (office level / staff count).
 */
function TopBar({ state, onSpeedChange, onToggleFinance, showFinance, onToggleResearch, showResearch, onToggleMarket, showMarket, onToggleMorale, showMorale, onToggleMarketing, showMarketing, onToggleTraining, showTraining, onToggleHardware, showHardware, onToggleVerticals, showVerticals, onToggleHistory, showHistory, onToggleSettings, showSettings, devMode }) {
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

  // Feature unlock conditions
  const totalRevenue = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;

  const isUnlocked = {
    research:  devMode || state.level >= 2,
    hardware:  devMode || state.level >= 3,
    verticals: devMode || (state.level >= 2 && totalRevenue >= 10000000),
    marketing: devMode || state.level >= 1,
    training:  devMode || state.level >= 1,
    morale:    devMode || state.staff.length >= 2,
    finance:   true,
    market:    true,
    history:   true,
  };

  const lockTooltips = {
    research:  'Unlocks at Medium Office',
    hardware:  'Unlocks at Large Office',
    verticals: 'Unlocks at $10M revenue + Medium Office',
    marketing: 'Unlocks at Small Office',
    training:  'Unlocks at Small Office',
    morale:    'Hire your first employee',
  };

  const featureTitles = {
    research:  'R&D Laboratory',
    hardware:  'Hardware Lab',
    verticals: 'Tech Verticals',
    marketing: 'Marketing Campaigns',
    training:  'Staff Training',
    morale:    'Studio Culture & Morale',
    market:    'Market Intelligence',
    finance:   'Finance Dashboard',
    history:   'Game History',
  };

  // Render a feature icon button with CSS tooltip — locked or unlocked
  const renderFeatureBtn = (key, active, onClick, children) => {
    const unlocked = isUnlocked[key];
    const tooltip = unlocked ? featureTitles[key] : (lockTooltips[key] || featureTitles[key]);

    return (
      <div className="topbar__icon-wrap">
        <button
          className={`speed-btn${active ? ' active' : ''}${!unlocked ? ' locked' : ''}`}
          onClick={unlocked ? onClick : undefined}
          disabled={!unlocked}
          style={!unlocked ? { opacity: 0.25, cursor: 'not-allowed' } : undefined}
        >
          {children}
        </button>
        <span className="topbar__tooltip">{tooltip}</span>
      </div>
    );
  };

  const companyInitial = (state.companyName || 'G').charAt(0).toUpperCase();
  const marketLabel = typeof marketSim !== 'undefined' && marketSim ? marketSim.getLabel() : null;

  return (
    <div className="glass-card topbar">
      <div className="topbar__inner">

        {/* Company logo + name */}
        <div className="topbar__logo">
          <div className="topbar__logo-badge">{companyInitial}</div>
          <div>
            <div className="topbar__company-name">{state.companyName}</div>
            <div className="topbar__company-level">{officeNames[state.level]}</div>
          </div>
        </div>

        <div className="topbar-divider" />

        {/* Cash */}
        <div className="topbar__stat">
          <div className="topbar__stat-label">Cash</div>
          <div className={`topbar__stat-value ${state.cash < 0 ? 'topbar__stat-value--cash-neg' : 'topbar__stat-value--cash-pos'}`}>
            {formatCash(state.cash)}
          </div>
        </div>

        {/* Fans */}
        <div className="topbar__stat">
          <div className="topbar__stat-label">Fans</div>
          <div className="topbar__stat-value topbar__stat-value--fans">
            {formatFans(state.fans)}
          </div>
        </div>

        {/* Games Made */}
        <div className="topbar__stat">
          <div className="topbar__stat-label">Games</div>
          <div className="topbar__stat-value topbar__stat-value--neutral">
            {state.games.length}
          </div>
        </div>

        {/* Development progress */}
        {devProgress !== null && (
          <>
            <div className="topbar-divider" />
            <div className="topbar__progress">
              <div className="topbar__progress-label">
                Developing: Phase {state.devPhase + 1}/3
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${devProgress}%` }} />
              </div>
            </div>
          </>
        )}

        {/* Market sentiment */}
        {marketLabel && (
          <div className="topbar__stat">
            <div className="topbar__stat-label">Market</div>
            <div className="topbar__stat-value topbar__stat-value--market" style={{ color: marketLabel.color }}>
              {marketLabel.label}
            </div>
          </div>
        )}

        {/* Sales indicator */}
        {state.sellingGame && (
          <div className="topbar__stat">
            <div className="topbar__stat-label">Selling</div>
            <div className="topbar__stat-value topbar__stat-value--cash-pos" style={{ fontSize: '13px' }}>
              {formatCash(state.salesRevenue)}
            </div>
          </div>
        )}

        {/* Date */}
        <div className="topbar__stat" style={{ minWidth: '100px' }}>
          <div className="topbar__stat-label">Date</div>
          <div className="topbar__stat-value topbar__stat-value--neutral" style={{ fontSize: '16px' }}>
            Y{state.year} / M{state.month} / W{state.week}
          </div>
        </div>

        <div className="topbar-divider" />

        {/* Speed controls */}
        <div className="topbar__speed">
          {speedLabels.map(s => (
            <button
              key={s.value}
              className={`speed-btn${engine.speed === s.value ? ' active' : ''}`}
              onClick={() => onSpeedChange(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="topbar-divider" />

        {/* Feature icons */}
        <div className="topbar__icons">

          {/* Research */}
          {renderFeatureBtn('research', showResearch, onToggleResearch,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M5 1v5.27L2.37 11.7A2 2 0 004.1 15h7.8a2 2 0 001.73-3.3L11 6.27V1h1V0H4v1h1zm1 0h4v5.5l.07.13L13.42 12H2.58l3.35-5.37.07-.13V1zM6 10a1 1 0 110 2 1 1 0 010-2zm4-1a1 1 0 110 2 1 1 0 010-2z"/>
            </svg>
          )}

          {/* Market */}
          {renderFeatureBtn('market', showMarket, onToggleMarket,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M1 14h14V0h-1v13H1v1zM3 12h2V7H3v5zm3 0h2V5H6v7zm3 0h2V3H9v9zm3 0h2V1h-2v11z"/>
            </svg>
          )}

          {/* Morale */}
          {renderFeatureBtn('morale', showMorale, onToggleMorale,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M5.5 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0-1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0-1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM0 13.5A3.5 3.5 0 013.5 10h1a3.49 3.49 0 012.08.68A4 4 0 008 13.5v.5H0v-.5zm1 0v-.5a2.5 2.5 0 012.5-2.5h1a2.5 2.5 0 012.42 1.9A4 4 0 005 13.5v.5H1v-.5zM16 14h-7v-.5a3.5 3.5 0 013.5-3.5h1a3.5 3.5 0 013.5 3.5v.5zm-1-.5a2.5 2.5 0 00-2.5-2.5h-1a2.5 2.5 0 00-2.5 2.5v.5h6v-.5z"/>
            </svg>
          )}

          {/* Marketing */}
          {renderFeatureBtn('marketing', showMarketing, onToggleMarketing,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M14 1.5v9a.5.5 0 01-.8.4L10 8.7V11a2 2 0 01-2 2H6a2 2 0 01-2-2V9H2.5A1.5 1.5 0 011 7.5v-3A1.5 1.5 0 012.5 3H6V1h2v2.3l3.2-2.2a.5.5 0 01.8.4zM8 4v4l5 3.4V1.6L8 4zM2 4.5v3a.5.5 0 00.5.5H6V4H2.5a.5.5 0 00-.5.5zM5 9v2a1 1 0 001 1h2a1 1 0 001-1V9H5z"/>
            </svg>
          )}

          {/* Training */}
          {renderFeatureBtn('training', showTraining, onToggleTraining,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 000 2.5v10a.5.5 0 00.707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 00.78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0016 12.5v-10a.5.5 0 00-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783z"/>
            </svg>
          )}

          {/* Hardware */}
          {renderFeatureBtn('hardware', showHardware, onToggleHardware,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M5 0a.5.5 0 01.5.5V2h1V.5a.5.5 0 011 0V2h1V.5a.5.5 0 011 0V2A2.5 2.5 0 0112 4.5h1.5a.5.5 0 010 1H12v1h1.5a.5.5 0 010 1H12v1h1.5a.5.5 0 010 1H12a2.5 2.5 0 01-2.5 2.5v1.5a.5.5 0 01-1 0V12h-1v1.5a.5.5 0 01-1 0V12h-1v1.5a.5.5 0 01-1 0V12A2.5 2.5 0 012 9.5H.5a.5.5 0 010-1H2v-1H.5a.5.5 0 010-1H2v-1H.5a.5.5 0 010-1H2A2.5 2.5 0 014.5 2V.5A.5.5 0 015 0zm-.5 3.5A1.5 1.5 0 003 5v4a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0011 9V5a1.5 1.5 0 00-1.5-1.5h-5zM5 5h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"/>
            </svg>
          )}

          {/* Verticals (building icon) */}
          {renderFeatureBtn('verticals', showVerticals, onToggleVerticals,
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M3 0v16h2V0H3zm4 2v14h2V2H7zm4-1v15h2V1h-2z"/>
            </svg>
          )}

          <div className="topbar-divider" />

          {/* Finance — always available */}
          <div className="topbar__icon-wrap">
            <button
              className={`speed-btn${showFinance ? ' active' : ''}`}
              onClick={onToggleFinance}
              style={{ fontWeight: 700, fontSize: '13px' }}
            >
              $
            </button>
            <span className="topbar__tooltip">Finance Dashboard</span>
          </div>

          {/* Game History — when games exist */}
          {state.games.length > 0 && (
            <div className="topbar__icon-wrap">
              <button
                className={`speed-btn${showHistory ? ' active' : ''}`}
                onClick={onToggleHistory}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                  <path d="M0 2a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1v7.5a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 011 12.5V5a1 1 0 01-1-1V2zm2 3v7.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z"/>
                </svg>
              </button>
              <span className="topbar__tooltip">Game History</span>
            </div>
          )}

          {/* Settings */}
          <div className="topbar__icon-wrap">
            <button
              className={`speed-btn${showSettings ? ' active' : ''}`}
              onClick={onToggleSettings}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.434.901-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.901 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.901-3.434-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 002.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 001.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 00-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 00-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 00-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 003.06 8.282l-.318-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 004.177 3.82l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 002.692-1.115l.094-.319z"/>
              </svg>
            </button>
            <span className="topbar__tooltip">Settings</span>
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter state={state} />
      </div>
    </div>
  );
}
