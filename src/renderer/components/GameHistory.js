/**
 * GameHistory — Full-page view of all released games with sorting,
 * filtering, detail view, stats summary, and score trend line.
 */
function GameHistory({ state, onClose, onRemaster }) {
  if (!state) return null;

  const [sortField, setSortField] = React.useState('releaseYear');
  const [sortDir, setSortDir] = React.useState('desc');
  const [filterGenre, setFilterGenre] = React.useState('all');
  const [filterScoreMin, setFilterScoreMin] = React.useState(0);
  const [filterScoreMax, setFilterScoreMax] = React.useState(10);
  const [filterRevenueMin, setFilterRevenueMin] = React.useState(0);
  const [selectedGame, setSelectedGame] = React.useState(null);
  const [detailReport, setDetailReport] = React.useState(null);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const getScoreColor = (score) => {
    if (score >= 9) return '#3fb950';
    if (score >= 7) return '#58a6ff';
    if (score >= 5) return '#d29922';
    return '#f85149';
  };

  // All unique genres from released games
  const genres = [...new Set(state.games.map(g => g.genre))].sort();

  // Filter games
  let filtered = state.games.filter(g => {
    if (filterGenre !== 'all' && g.genre !== filterGenre) return false;
    if (g.reviewAvg < filterScoreMin || g.reviewAvg > filterScoreMax) return false;
    if (g.totalRevenue < filterRevenueMin) return false;
    return true;
  });

  // Sort games
  filtered.sort((a, b) => {
    let av = a[sortField];
    let bv = b[sortField];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ^' : ' v';
  };

  // Stats summary
  const totalGames = state.games.length;
  const avgScore = totalGames > 0 ? (state.games.reduce((s, g) => s + g.reviewAvg, 0) / totalGames) : 0;
  const totalRevenue = state.games.reduce((s, g) => s + g.totalRevenue, 0);
  const bestGame = totalGames > 0 ? state.games.reduce((best, g) => g.reviewAvg > best.reviewAvg ? g : best, state.games[0]) : null;
  const worstGame = totalGames > 0 ? state.games.reduce((worst, g) => g.reviewAvg < worst.reviewAvg ? g : worst, state.games[0]) : null;

  // Score trend data (for simple line visualization)
  const scoreTrend = state.games.map((g, i) => ({
    index: i,
    score: g.reviewAvg,
    title: g.title,
  }));

  // Clear report when switching games
  React.useEffect(() => { setDetailReport(null); }, [selectedGame]);

  // Detail view for selected game
  if (selectedGame) {
    const g = selectedGame;
    const reviewerNames = ['GamePro Weekly', 'Digital Arts Magazine', 'IndieScope', 'TechGamer'];
    const platformName = (typeof PLATFORMS !== 'undefined' && PLATFORMS.find(p => p.id === g.platformId))
      ? PLATFORMS.find(p => p.id === g.platformId).name : g.platformId;

    // Check for franchise/sequel info
    const sameTopicGenre = state.games.filter(
      og => og.topic === g.topic && og.genre === g.genre && og.title !== g.title
    );

    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '600px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div className="panel-header" style={{ marginBottom: '4px' }}>
                Game Detail
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>{g.title}</h2>
              <div style={{ fontSize: '13px', color: '#8b949e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {g.topic} / {g.genre} / {g.size} on
                {(() => {
                  const icon = typeof getPlatformIcon !== 'undefined' ? getPlatformIcon(g.platformId) : null;
                  return icon ? <img src={icon} alt="" style={{ width: '14px', height: '14px', opacity: 0.8 }} /> : null;
                })()}
                {platformName}
              </div>
              <div style={{ fontSize: '12px', color: '#484f58', marginTop: '2px' }}>
                Released Y{g.releaseYear} M{g.releaseMonth} -- {g.devWeeks} weeks dev
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: getScoreColor(g.reviewAvg) }}>
                {g.reviewAvg.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#8b949e' }}>Average</div>
            </div>
          </div>

          {/* 4 Review Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {g.reviews.map((score, i) => (
              <div key={i} className="glass-card" style={{ padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>{reviewerNames[i]}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: getScoreColor(score) }}>{score.toFixed(1)}</div>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Total Revenue</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#3fb950' }}>{formatCash(g.totalRevenue)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Units Sold</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>{g.unitsSold.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Fans Gained</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#58a6ff' }}>+{g.fansGained.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Design / Tech Points</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>
                  <span style={{ color: '#da7cff' }}>{g.designPoints}</span> / <span style={{ color: '#58a6ff' }}>{g.techPoints}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Publisher deal info */}
          {g.publisherDeal && (
            <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
              <div className="panel-header" style={{ color: '#da7cff', marginBottom: '6px' }}>
                Publisher Deal
              </div>
              <div style={{ fontSize: '13px', color: '#e6edf3' }}>
                Published by <strong>{g.publisherDeal.publisherName}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
                Advance: {formatCash(g.publisherDeal.advance)} | Publisher cut: {formatCash(g.publisherDeal.publisherCut)} | Your revenue: {formatCash(g.publisherDeal.playerRevenue)}
              </div>
            </div>
          )}

          {/* Franchise / sequel info */}
          {sameTopicGenre.length > 0 && (
            <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
              <div className="panel-header" style={{ color: '#58a6ff', marginBottom: '6px' }}>
                Related Games ({g.topic} / {g.genre})
              </div>
              {sameTopicGenre.map((og, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#8b949e', padding: '2px 0' }}>
                  {og.title} -- {og.reviewAvg.toFixed(1)}/10 -- {formatCash(og.totalRevenue)}
                </div>
              ))}
            </div>
          )}

          {/* Post-game report */}
          {detailReport && (
            <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
              <div className="panel-header" style={{ color: '#d29922', marginBottom: '8px' }}>
                Research Report
              </div>
              <div style={{ fontSize: '11px', color: '#484f58', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {detailReport.detail} analysis — game #{state.games.length}
              </div>
              {detailReport.insights.map((insight, i) => (
                <div key={i} style={{ fontSize: '13px', color: '#e6edf3', padding: '4px 0', borderBottom: i < detailReport.insights.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* DLC History */}
          {typeof dlcSystem !== 'undefined' && dlcSystem.getDLCsForGame(g.title).length > 0 && (
            <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
              <div className="panel-header" style={{ color: '#ffa657', marginBottom: '6px' }}>DLC History</div>
              {dlcSystem.getDLCsForGame(g.title).map((dlc, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#8b949e', padding: '2px 0' }}>
                  {dlc.name} — {dlc.score.toFixed(1)}/10 — ${dlc.revenue.toLocaleString()}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setSelectedGame(null)} style={{ flex: 1 }}>
              Back to History
            </button>
            {g.breakdown && (
              <button
                className="btn-secondary"
                onClick={() => {
                  const report = typeof gameReportGenerator !== 'undefined'
                    ? gameReportGenerator.generateReport(g, state.games.length)
                    : null;
                  if (report) setDetailReport(report);
                }}
                style={{ flex: 1 }}
              >
                View Report
              </button>
            )}
            {onRemaster && !state.currentGame && (state.year - g.releaseYear) >= 5 && (
              <button
                className="btn-secondary"
                onClick={() => { onRemaster(g); onClose(); }}
                style={{ flex: 1, color: '#da7cff', borderColor: 'rgba(218,124,255,0.3)' }}
                title={`Remaster: ~${Math.round(30)}% of original dev cost, targets new platforms`}
              >
                Remaster
              </button>
            )}
            {typeof dlcSystem !== 'undefined' && dlcSystem.canCreateDLC(g) && !state.activeDLC && !state.currentGame && (
              <button className="btn-secondary" onClick={() => {
                const name = prompt('Name your DLC:');
                if (name) {
                  const result = dlcSystem.startDLC(g, name, state);
                  if (result.success) { engine._emit(); engine._save(); }
                }
              }} style={{ flex: 1, color: '#ffa657' }}>
                Create DLC (${dlcSystem.getDLCCost(g).toLocaleString()})
              </button>
            )}
            <button className="btn-accent" onClick={onClose} style={{ flex: 1 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main history view
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div className="panel-header" style={{ marginBottom: '4px' }}>
              Studio Archive
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>Game History</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Stats summary */}
        {totalGames > 0 && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Total Games</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>{totalGames}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Avg Score</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: getScoreColor(avgScore) }}>{avgScore.toFixed(1)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Total Revenue</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#3fb950' }}>{formatCash(totalRevenue)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Best Game</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#3fb950' }} title={bestGame ? bestGame.title : ''}>
                  {bestGame ? bestGame.reviewAvg.toFixed(1) : '-'}
                </div>
                <div style={{ fontSize: '10px', color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bestGame ? bestGame.title : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Worst Game</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f85149' }} title={worstGame ? worstGame.title : ''}>
                  {worstGame ? worstGame.reviewAvg.toFixed(1) : '-'}
                </div>
                <div style={{ fontSize: '10px', color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {worstGame ? worstGame.title : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score trend line (CSS-based) */}
        {scoreTrend.length >= 2 && (
          <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
            <div className="panel-header" style={{ marginBottom: '8px' }}>
              Score Trend
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '60px' }}>
              {scoreTrend.map((pt, i) => {
                const heightPct = (pt.score / 10) * 100;
                return (
                  <div
                    key={i}
                    title={`${pt.title}: ${pt.score.toFixed(1)}`}
                    style={{
                      flex: 1,
                      height: `${heightPct}%`,
                      background: getScoreColor(pt.score),
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.7,
                      transition: 'height 0.3s ease',
                      minWidth: '4px',
                      maxWidth: '20px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedGame(state.games[i])}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#484f58', marginTop: '4px' }}>
              <span>First</span>
              <span>Latest</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#8b949e', display: 'block', marginBottom: '2px' }}>Genre</label>
            <select
              value={filterGenre}
              onChange={e => setFilterGenre(e.target.value)}
            >
              <option value="all">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#8b949e', display: 'block', marginBottom: '2px' }}>Min Score</label>
            <input
              type="number" min="0" max="10" step="0.5"
              value={filterScoreMin}
              onChange={e => setFilterScoreMin(parseFloat(e.target.value) || 0)}
              style={{ width: '70px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#8b949e', display: 'block', marginBottom: '2px' }}>Max Score</label>
            <input
              type="number" min="0" max="10" step="0.5"
              value={filterScoreMax}
              onChange={e => setFilterScoreMax(parseFloat(e.target.value) || 10)}
              style={{ width: '70px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#8b949e', display: 'block', marginBottom: '2px' }}>Min Revenue</label>
            <select
              value={filterRevenueMin}
              onChange={e => setFilterRevenueMin(parseInt(e.target.value))}
            >
              <option value="0">Any</option>
              <option value="10000">$10K+</option>
              <option value="100000">$100K+</option>
              <option value="1000000">$1M+</option>
              <option value="10000000">$10M+</option>
            </select>
          </div>
          <div style={{ fontSize: '11px', color: '#484f58', alignSelf: 'flex-end', paddingBottom: '4px' }}>
            {filtered.length} of {totalGames} games
          </div>
        </div>

        {/* Sortable table */}
        {state.games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#484f58', fontSize: '14px' }}>
            No games released yet. Go make history!
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { field: 'title', label: 'Title' },
                    { field: 'topic', label: 'Topic' },
                    { field: 'genre', label: 'Genre' },
                    { field: 'platformId', label: 'Platform' },
                    { field: 'reviewAvg', label: 'Score' },
                    { field: 'totalRevenue', label: 'Revenue' },
                    { field: 'fansGained', label: 'Fans' },
                    { field: 'releaseYear', label: 'Date' },
                  ].map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      style={{
                        padding: '8px 6px',
                        textAlign: 'left',
                        color: sortField === col.field ? '#58a6ff' : '#8b949e',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {col.label}{sortIndicator(col.field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => {
                  const platformName = (typeof PLATFORMS !== 'undefined' && PLATFORMS.find(p => p.id === g.platformId))
                    ? PLATFORMS.find(p => p.id === g.platformId).name : g.platformId;
                  return (
                    <tr
                      key={i}
                      className="table-row-hover"
                      onClick={() => setSelectedGame(g)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '8px 6px', color: '#e6edf3', fontWeight: 500 }}>{g.title}</td>
                      <td style={{ padding: '8px 6px', color: '#8b949e' }}>{g.topic}</td>
                      <td style={{ padding: '8px 6px', color: '#8b949e' }}>{g.genre}</td>
                      <td style={{ padding: '8px 6px', color: '#8b949e' }}>
                        {(() => {
                          const icon = typeof getPlatformIcon !== 'undefined' ? getPlatformIcon(g.platformId) : null;
                          return (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {icon && <img src={icon} alt="" style={{ width: '12px', height: '12px', opacity: 0.7 }} />}
                              {platformName}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '8px 6px', fontWeight: 700, color: getScoreColor(g.reviewAvg) }}>{g.reviewAvg.toFixed(1)}</td>
                      <td style={{ padding: '8px 6px', color: '#3fb950' }}>{formatCash(g.totalRevenue)}</td>
                      <td style={{ padding: '8px 6px', color: '#58a6ff' }}>+{g.fansGained.toLocaleString()}</td>
                      <td style={{ padding: '8px 6px', color: '#8b949e' }}>Y{g.releaseYear} M{g.releaseMonth}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Close button */}
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button className="btn-accent" onClick={onClose} style={{ padding: '10px 24px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
