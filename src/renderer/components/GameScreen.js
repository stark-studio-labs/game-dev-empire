/**
 * GameScreen — Main game view with office, staff, actions, notifications, game history
 */
function GameScreen({ state, onNewGame, onStaff, onUpgrade, fanMilestoneGlow }) {
  if (!state) return null;

  const officeClass = ['office-garage', 'office-small', 'office-medium', 'office-large'][state.level];
  const officeEmoji = ['\uD83C\uDFE0', '\uD83C\uDFE2', '\uD83C\uDFEC', '\uD83C\uDFEF'][state.level];

  // Track office level for slide-expand animation on upgrade
  const prevLevelRef = React.useRef(state.level);
  const [officeAnimating, setOfficeAnimating] = React.useState(false);

  React.useEffect(() => {
    if (state.level > prevLevelRef.current) {
      setOfficeAnimating(true);
      const timer = setTimeout(() => setOfficeAnimating(false), 800);
      prevLevelRef.current = state.level;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = state.level;
  }, [state.level]);

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const canStartGame = !state.currentGame && !state.sellingGame;

  return (
    <div className={`${officeClass} ${officeAnimating ? 'animate-slide-expand' : ''}`} style={{ flex: 1, display: 'flex', gap: '12px', padding: '0 12px 12px' }}>
      {/* Left panel — Office view + actions */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Office visualization */}
        <div className={`glass-card ${fanMilestoneGlow ? 'animate-glow animate-confetti' : ''}`} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: fanMilestoneGlow ? 'visible' : 'hidden' }}>
          {/* Office background icon */}
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.4 }}>
            {officeEmoji}
          </div>

          {/* Staff avatars */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {state.staff.map((member, i) => (
              <div key={member.id} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: member.isFounder
                    ? 'linear-gradient(135deg, #58a6ff, #1f6feb)'
                    : 'linear-gradient(135deg, rgba(88,166,255,0.3), rgba(88,166,255,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, color: '#fff',
                  border: state.currentGame ? '2px solid #3fb950' : '2px solid transparent',
                  animation: state.currentGame ? 'pulse 2s infinite' : 'none',
                }}>
                  {member.name.charAt(0)}
                </div>
                <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px', maxWidth: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.name}
                </div>
              </div>
            ))}
          </div>

          {/* Current activity */}
          {state.currentGame && (
            <div className="glass-card" style={{ padding: '16px', width: '100%', maxWidth: '400px' }}>
              <div className="panel-header" style={{ marginBottom: '4px' }}>
                Now Developing
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3', marginBottom: '4px' }}>
                {state.currentGame.title}
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '12px' }}>
                {state.currentGame.topic} / {state.currentGame.genre} / {state.currentGame.size}
              </div>

              {/* Phase indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {(typeof DEV_PHASES !== 'undefined' ? DEV_PHASES : []).map((phase, i) => (
                  <React.Fragment key={i}>
                    <div className={`phase-dot ${i < state.devPhase ? 'complete' : i === state.devPhase ? 'active' : ''}`} />
                    <span style={{ fontSize: '11px', color: i === state.devPhase ? '#58a6ff' : 'var(--color-text-tertiary)' }}>
                      {phase.name}
                    </span>
                    {i < 2 && <div style={{ flex: 1, height: '1px', background: i < state.devPhase ? '#3fb950' : 'rgba(255,255,255,0.08)' }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Progress bar */}
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${(state.devPhase * 100 + state.devProgress) / 3}%` }} />
              </div>

              {/* D/T points */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#da7cff' }}>Design: {Math.round(state.devDesign)}</span>
                <span style={{ fontSize: '12px', color: '#58a6ff' }}>Tech: {Math.round(state.devTech)}</span>
              </div>
            </div>
          )}

          {/* Sales activity */}
          {state.sellingGame && !state.currentGame && (
            <div className="glass-card" style={{ padding: '16px', width: '100%', maxWidth: '400px' }}>
              <div className="panel-header" style={{ color: '#3fb950', marginBottom: '4px' }}>
                Now Selling
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>
                {state.sellingGame.title}
              </div>
              <div style={{ fontSize: '14px', color: '#3fb950', marginTop: '4px' }}>
                {formatCash(state.salesRevenue)} / {formatCash(state.salesTotalTarget)}
              </div>
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div className="progress-fill" style={{ width: `${(state.salesRevenue / Math.max(state.salesTotalTarget, 1)) * 100}%`, background: 'linear-gradient(90deg, #3fb950, #2ea043)' }} />
              </div>
            </div>
          )}

          {/* Idle state */}
          {canStartGame && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '16px' }}>
                Ready to start your next project
              </div>
              <button className="btn-accent" onClick={onNewGame} style={{ padding: '12px 32px', fontSize: '15px' }}>
                Create New Game
              </button>
            </div>
          )}
        </div>

        {/* Morale mini-bar */}
        {typeof moraleSystem !== 'undefined' && (() => {
          const status = moraleSystem.getMoraleStatus();
          const morale = moraleSystem.getMorale();
          return (
            <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>{status.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ color: status.color, fontWeight: 500 }}>Morale: {status.label}</span>
                  <span style={{ color: '#8b949e' }}>x{moraleSystem.getQualityMultiplier().toFixed(2)}</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${morale}%`,
                    background: status.color, borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={onStaff} style={{ flex: 1 }}>
            Staff ({state.staff.length})
          </button>
          {state.upgradeAvailable && (
            <button className="btn-accent" onClick={onUpgrade} style={{ flex: 1 }}>
              Upgrade Office
            </button>
          )}
        </div>
      </div>

      {/* Right panel — Game history + notifications */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Notifications */}
        {state.notifications.length > 0 && (
          <div className="glass-card" style={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
            <div className="panel-header" style={{ marginBottom: '8px' }}>
              Notifications
            </div>
            {state.notifications.slice().reverse().slice(0, 5).map(n => (
              <div key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                <span style={{ color: '#c9d1d9' }}>{n.message}</span>
                <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{n.time}</div>
              </div>
            ))}
          </div>
        )}

        {/* Game History */}
        <div className="glass-card" style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          <div className="panel-header" style={{ marginBottom: '8px' }}>
            Game History ({state.games.length})
          </div>
          {state.games.length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
              No games made yet
            </div>
          )}
          {state.games.slice().reverse().map((game, i) => {
            const scoreColor = game.reviewAvg >= 9 ? '#3fb950' : game.reviewAvg >= 7 ? '#58a6ff' : game.reviewAvg >= 5 ? '#d29922' : '#f85149';
            return (
              <div key={i} className="glass-card glass-card-hover" style={{ padding: '10px', marginBottom: '6px', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{game.title}</div>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>
                      {game.topic} / {game.genre} / {game.size}
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: scoreColor }}>
                    {game.reviewAvg.toFixed(1)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#8b949e' }}>
                  <span>{formatCash(game.totalRevenue)}</span>
                  <span>Y{game.releaseYear}</span>
                </div>
                {game.publisherDeal && (
                  <div style={{ fontSize: '10px', color: '#da7cff', marginTop: '2px' }}>
                    via {game.publisherDeal.publisherName}
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
