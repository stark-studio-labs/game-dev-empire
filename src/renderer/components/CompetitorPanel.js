/**
 * CompetitorPanel — AI rival studios leaderboard, market share, and detail view.
 */
function CompetitorPanel({ state, onClose }) {
  const [selectedStudio, setSelectedStudio] = React.useState(null);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { selectedStudio ? setSelectedStudio(null) : onClose(); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedStudio]);

  if (!state) return null;

  const hasCompetitors = typeof competitorSystem !== 'undefined' && competitorSystem.studios.length > 0;
  if (!hasCompetitors) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '500px', padding: '24px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <p style={{ color: '#8b949e' }}>Competitor data not yet available.</p>
          <button className="btn-secondary" onClick={onClose} style={{ marginTop: '16px' }}>Close</button>
        </div>
      </div>
    );
  }

  // Calculate player's recent revenue (last 48 weeks)
  const playerRecentRevenue = state.games
    .filter(g => g.releaseWeek && g.releaseWeek >= (state.totalWeeks - 48))
    .reduce((sum, g) => sum + (g.totalRevenue || 0), 0);

  const marketShare = competitorSystem.getMarketShare(playerRecentRevenue);
  const leaderboard = competitorSystem.getLeaderboard(state.companyName, playerRecentRevenue);
  const recentReleases = competitorSystem.getRecentReleases(state.totalWeeks, 8);

  const formatRev = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + Math.round(n).toLocaleString();
  };

  const rivalryColors = {
    friendly: '#3fb950',
    neutral: '#8b949e',
    rival: '#d29922',
    nemesis: '#f85149',
  };

  const rivalryLabels = {
    friendly: 'Friendly',
    neutral: 'Neutral',
    rival: 'Rival',
    nemesis: 'Nemesis',
  };

  // ── Detail View ──────────────────────────────────────────────

  if (selectedStudio) {
    const studio = competitorSystem.studios.find(s => s.id === selectedStudio);
    if (!studio) { setSelectedStudio(null); return null; }

    const rivalry = competitorSystem.getRivalryLevel(studio.id, playerRecentRevenue);
    const studioGames = [...studio.games].sort((a, b) => b.releaseWeek - a.releaseWeek).slice(0, 10);
    const studioShare = (marketShare[studio.id] || 0).toFixed(1);
    const avgScore = studio.games.length > 0
      ? (studio.games.reduce((sum, g) => sum + g.score, 0) / studio.games.length).toFixed(1)
      : '-';

    // Detect strengths and weaknesses
    const genreCounts = {};
    studio.games.forEach(g => { genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1; });
    const strengths = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);

    const highScoreGames = studio.games.filter(g => g.score >= 8).length;
    const lowScoreGames = studio.games.filter(g => g.score < 5).length;

    return (
      <div className="modal-overlay" onClick={() => setSelectedStudio(null)}>
        <div
          className="modal-content"
          style={{ maxWidth: '700px', width: '90%', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${studio.color}22`,
                border: `2px solid ${studio.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 800, color: studio.color,
              }}>
                {studio.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', marginBottom: '2px' }}>
                  {studio.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>{studio.description}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedStudio(null)}
              style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
            >
              x
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Market Share
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: studio.color }}>
                {studioShare}%
              </div>
            </div>
            <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Games
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3' }}>
                {studio.games.length}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Avg Score
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: parseFloat(avgScore) >= 7 ? '#3fb950' : parseFloat(avgScore) >= 5 ? '#d29922' : '#f85149' }}>
                {avgScore}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Rivalry
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: rivalryColors[rivalry], marginTop: '4px' }}>
                {rivalryLabels[rivalry]}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '10px', color: '#3fb950', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Strengths
              </div>
              <div style={{ fontSize: '13px', color: '#c9d1d9' }}>
                {strengths.length > 0 ? strengths.join(', ') + ' genres' : 'No data yet'}
                {highScoreGames > 0 && ` | ${highScoreGames} critically acclaimed`}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '10px', color: '#f85149', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Weaknesses
              </div>
              <div style={{ fontSize: '13px', color: '#c9d1d9' }}>
                {lowScoreGames > 0 ? `${lowScoreGames} critically panned` : 'No major flops'}
                {studio.sequelBias > 0.5 && ' | Over-reliant on sequels'}
                {studio.riskTolerance > 0.7 && ' | Inconsistent quality'}
              </div>
            </div>
          </div>

          {/* Game History */}
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Recent Releases
            </div>
            {studioGames.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#484f58', fontSize: '13px' }}>
                No games released yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {studioGames.map((game, i) => {
                  const scoreColor = game.score >= 8 ? '#3fb950' : game.score >= 6 ? '#d29922' : '#f85149';
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
                          {game.title} {game.isSequel && <span style={{ fontSize: '10px', color: '#8b949e' }}>(Sequel)</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8b949e' }}>
                          {game.topic} / {game.genre} / {game.size} | Y{game.releaseYear}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: scoreColor }}>{game.score}</div>
                          <div style={{ fontSize: '10px', color: '#484f58' }}>score</div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#8b949e' }}>{formatRev(game.revenue)}</div>
                          <div style={{ fontSize: '10px', color: '#484f58' }}>revenue</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Panel ───────────────────────────────────────────────

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '750px', width: '90%', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3', marginBottom: '4px' }}>
              Industry Competition
            </h2>
            <div style={{ fontSize: '13px', color: '#8b949e' }}>
              Market share and rival studios
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
          >
            x
          </button>
        </div>

        {/* Your Market Share */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Your Market Share
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#e6edf3' }}>
                {(marketShare.player || 0).toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Industry Rank
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#58a6ff' }}>
                #{leaderboard.find(e => e.isPlayer)?.rank || '-'}
              </div>
            </div>
          </div>

          {/* Market share bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', height: '12px' }}>
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    width: `${Math.max(2, (marketShare[entry.id] || marketShare.player || 0))}%`,
                    background: entry.color,
                    opacity: entry.isPlayer ? 1.0 : 0.5,
                    transition: 'width 0.3s ease',
                  }}
                  title={`${entry.name}: ${(marketShare[entry.id] || marketShare.player || 0).toFixed(1)}%`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
              {leaderboard.slice(0, 4).map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#8b949e' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: entry.color, opacity: entry.isPlayer ? 1 : 0.6 }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Leaderboard */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Industry Leaderboard (Trailing 12 Months)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {leaderboard.map((entry) => {
              const share = entry.isPlayer ? marketShare.player : (marketShare[entry.id] || 0);
              const rivalry = !entry.isPlayer
                ? competitorSystem.getRivalryLevel(entry.id, playerRecentRevenue)
                : null;
              return (
                <div
                  key={entry.id}
                  onClick={() => !entry.isPlayer && setSelectedStudio(entry.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: entry.isPlayer
                      ? 'rgba(88,166,255,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    border: entry.isPlayer
                      ? '1px solid rgba(88,166,255,0.2)'
                      : '1px solid rgba(255,255,255,0.04)',
                    cursor: entry.isPlayer ? 'default' : 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!entry.isPlayer) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!entry.isPlayer) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  {/* Rank */}
                  <div style={{
                    width: '28px', fontSize: '14px', fontWeight: 700,
                    color: entry.rank <= 3 ? entry.color : '#484f58',
                  }}>
                    #{entry.rank}
                  </div>

                  {/* Logo badge */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: `${entry.color}18`,
                    border: `1px solid ${entry.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: entry.color,
                    flexShrink: 0,
                  }}>
                    {entry.name.charAt(0)}
                  </div>

                  {/* Name + rivalry */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: entry.isPlayer ? 700 : 600,
                      color: entry.isPlayer ? '#58a6ff' : '#e6edf3',
                    }}>
                      {entry.name} {entry.isPlayer && <span style={{ fontSize: '10px', fontWeight: 400 }}>(You)</span>}
                    </div>
                    {rivalry && (
                      <div style={{ fontSize: '10px', color: rivalryColors[rivalry] }}>
                        {rivalryLabels[rivalry]}
                      </div>
                    )}
                  </div>

                  {/* Share */}
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: entry.color }}>
                      {share.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#484f58' }}>share</div>
                  </div>

                  {/* Revenue */}
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#8b949e' }}>
                      {formatRev(entry.revenue)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#484f58' }}>revenue</div>
                  </div>

                  {/* Chevron for clickable */}
                  {!entry.isPlayer && (
                    <div style={{ fontSize: '14px', color: '#484f58' }}>&#8250;</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Industry Releases */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Recent Industry Releases
          </div>
          {recentReleases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#484f58', fontSize: '13px' }}>
              No competitor releases yet. They'll start releasing games soon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentReleases.map((game, i) => {
                const studio = competitorSystem.studios.find(s => s.id === game.studioId);
                const scoreColor = game.score >= 8 ? '#3fb950' : game.score >= 6 ? '#d29922' : '#f85149';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: studio ? studio.color : '#8b949e',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
                        {game.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>
                        {game.studioName} | {game.genre} | {game.platform}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: scoreColor }}>
                      {game.score}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b949e', minWidth: '65px', textAlign: 'right' }}>
                      {formatRev(game.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
