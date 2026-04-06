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

  const [bubbles, setBubbles] = React.useState([]);
  const bubbleIdRef = React.useRef(0);

  React.useEffect(() => {
    if (!state.currentGame || state.devPhase === null || state.finishingPhase) {
      setBubbles([]); return;
    }
    const interval = setInterval(() => {
      const newBubbles = state.staff.map(member => {
        const type = Math.random() < 0.15 ? 'bug' : Math.random() < 0.5 ? 'design' : 'tech';
        const label = type === 'design' ? 'D' : type === 'tech' ? 'T' : '!';
        return { id: bubbleIdRef.current++, staffId: member.id, type, label };
      });
      setBubbles(prev => [...prev.slice(-30), ...newBubbles]);
    }, 1200);
    return () => clearInterval(interval);
  }, [state.currentGame, state.devPhase, state.finishingPhase, state.staff.length]);

  React.useEffect(() => {
    if (bubbles.length === 0) return;
    const timer = setTimeout(() => setBubbles(prev => prev.slice(state.staff.length)), 1500);
    return () => clearTimeout(timer);
  }, [bubbles.length]);

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const canStartGame = !state.currentGame && !state.sellingGame;
  const overflowClass = fanMilestoneGlow ? 'gs-office-card--overflow-visible' : 'gs-office-card--overflow-hidden';

  return (
    <div className={`gs-root ${officeClass} ${officeAnimating ? 'animate-slide-expand' : ''}`}>
      {/* Left panel — Office view + actions */}
      <div className="gs-left-col">
        {/* Office visualization */}
        <div className={`gs-office-card ${overflowClass} ${fanMilestoneGlow ? 'animate-glow animate-confetti' : ''}`}>
          <div className="gs-office-emoji">{officeEmoji}</div>

          {/* Staff avatars */}
          <div className="gs-staff-row">
            {state.staff.map((member) => {
              const avatarClasses = ['gs-staff-avatar'];
              if (member.isFounder) avatarClasses.push('gs-staff-avatar--founder');
              if (state.currentGame) avatarClasses.push('gs-staff-avatar--developing');
              return (
                <div key={member.id} className="gs-staff-item">
                  <div className={avatarClasses.join(' ')}>
                    {member.name.charAt(0)}
                    {member.role && ROLE_ICONS[member.role] && (
                      <img src={ROLE_ICONS[member.role]} alt="" className="gs-role-badge" />
                    )}
                  </div>
                  <div className="gs-staff-name">{member.name}</div>
                  {member.role && (
                    <div className="gs-staff-role">{getRoleName(member.role)}</div>
                  )}
                  {bubbles.filter(b => b.staffId === member.id).map(b => (
                    <span key={b.id} className={`skill-bubble skill-bubble--${b.type}`}>{b.label}</span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Polish phase — bug-fixing before release */}
          {state.finishingPhase && (
            <div className="glass-card gs-info-card">
              <div className="panel-header" style={{ marginBottom: '4px', color: 'var(--color-warning)' }}>
                Polishing
              </div>
              <div className="gs-info-title">Fixing Bugs...</div>
              <div className="gs-info-sub">
                {state.bugs} bugs remaining (started with {state.bugsInitial})
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${state.devProgress}%`, background: 'linear-gradient(90deg, var(--color-warning), var(--color-success))' }} />
              </div>
            </div>
          )}

          {/* Current activity */}
          {state.currentGame && !state.finishingPhase && (
            <div className="glass-card gs-info-card">
              <div className="panel-header" style={{ marginBottom: '4px' }}>
                Now Developing
              </div>
              <div className="gs-info-title">{state.currentGame.title}</div>
              <div className="gs-info-sub">
                {state.currentGame.topic} / {state.currentGame.genre} / {state.currentGame.size}
              </div>

              {/* Phase indicators */}
              <div className="gs-phase-row">
                {(typeof DEV_PHASES !== 'undefined' ? DEV_PHASES : []).map((phase, i) => (
                  <React.Fragment key={i}>
                    <div className={`phase-dot ${i < state.devPhase ? 'complete' : i === state.devPhase ? 'active' : ''}`} />
                    <span className={`gs-phase-label ${i === state.devPhase ? 'gs-phase-label--active' : ''}`}>
                      {phase.name}
                    </span>
                    {i < (typeof DEV_PHASES !== 'undefined' ? DEV_PHASES.length - 1 : 2) && <div className={`gs-phase-line ${i < state.devPhase ? 'gs-phase-line--complete' : ''}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Progress bar */}
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${(state.devPhase * 100 + state.devProgress) / (typeof DEV_PHASES !== 'undefined' ? DEV_PHASES.length : 4)}%` }} />
              </div>

              {/* D/T points */}
              <div className="gs-dt-row">
                <span className="gs-dt-design">Design: {Math.round(state.devDesign)}</span>
                <span className="gs-dt-tech">Tech: {Math.round(state.devTech)}</span>
              </div>
            </div>
          )}

          {/* Sales activity */}
          {state.sellingGame && !state.currentGame && (
            <div className="glass-card gs-info-card">
              <div className="panel-header" style={{ color: 'var(--color-success)', marginBottom: '4px' }}>
                Now Selling
              </div>
              <div className="gs-info-title">{state.sellingGame.title}</div>
              <div className="gs-sales-value">
                {formatCash(state.salesRevenue)} / {formatCash(state.salesTotalTarget)}
              </div>
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div className="progress-fill" style={{ width: `${(state.salesRevenue / Math.max(state.salesTotalTarget, 1)) * 100}%`, background: 'linear-gradient(90deg, var(--color-success), #2ea043)' }} />
              </div>
            </div>
          )}

          {/* Idle state */}
          {canStartGame && (
            <div style={{ textAlign: 'center' }}>
              <div className="gs-idle-hint">Ready to start your next project</div>
              <button className="btn-accent gs-new-game-btn" onClick={onNewGame}>
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
            <div className="glass-card gs-morale-card">
              <span className="gs-morale-emoji">{status.emoji}</span>
              <div style={{ flex: 1 }}>
                <div className="gs-morale-head">
                  <span style={{ color: status.color, fontWeight: 500 }}>Morale: {status.label}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>x{moraleSystem.getQualityMultiplier().toFixed(2)}</span>
                </div>
                <div className="gs-morale-track">
                  <div className="gs-morale-fill" style={{ width: `${morale}%`, background: status.color }} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action buttons */}
        <div className="gs-actions">
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
      <div className="gs-right-col">
        {/* Notifications */}
        {state.notifications.length > 0 && (
          <div className="glass-card gs-notif-card">
            <div className="panel-header" style={{ marginBottom: '8px' }}>
              Notifications
            </div>
            {state.notifications.slice().reverse().slice(0, 5).map(n => (
              <div key={n.id} className="gs-notif-item">
                <span className="gs-notif-msg">{n.message}</span>
                <div className="gs-notif-time">{n.time}</div>
              </div>
            ))}
          </div>
        )}

        {/* Game History */}
        <div className="glass-card gs-history-card">
          <div className="panel-header" style={{ marginBottom: '8px' }}>
            Game History ({state.games.length})
          </div>
          {state.games.length === 0 && (
            <div className="gs-history-empty">No games made yet</div>
          )}
          {state.games.slice().reverse().map((game, i) => {
            const scoreColor = game.reviewAvg >= 9 ? 'var(--color-success)' : game.reviewAvg >= 7 ? 'var(--color-accent)' : game.reviewAvg >= 5 ? 'var(--color-warning)' : 'var(--color-danger)';
            const platformIcon = typeof getPlatformIcon !== 'undefined' ? getPlatformIcon(game.platformId) : null;
            return (
              <div key={i} className="glass-card glass-card-hover gs-history-entry">
                <div className="gs-history-entry-head">
                  <div>
                    <div className="gs-history-title">{game.title}</div>
                    <div className="gs-history-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {platformIcon && <img src={platformIcon} alt="" style={{ width: '11px', height: '11px', opacity: 0.7 }} />}
                      {game.topic} / {game.genre} / {game.size}
                    </div>
                  </div>
                  <div className="gs-history-score" style={{ color: scoreColor }}>
                    {game.reviewAvg.toFixed(1)}
                  </div>
                </div>
                <div className="gs-history-meta">
                  <span>{formatCash(game.totalRevenue)}</span>
                  <span>Y{game.releaseYear}</span>
                </div>
                {game.publisherDeal && (
                  <div className="gs-history-publisher">
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
