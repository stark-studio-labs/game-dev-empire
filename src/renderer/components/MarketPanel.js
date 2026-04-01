/**
 * MarketPanel — Market sentiment display, trending genres, history chart
 */
function MarketPanel({ state, onClose }) {
  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (!state) return null;

  const label = typeof marketSim !== 'undefined' && marketSim ? marketSim.getLabel() : { color: '#8b949e', label: 'Unknown' };
  const multiplier = typeof marketSim !== 'undefined' && marketSim ? marketSim.getSalesMultiplier() : 1.0;
  const history = typeof marketSim !== 'undefined' && marketSim ? marketSim.history : [];
  const trending = typeof marketSim !== 'undefined' && marketSim ? marketSim.trendingGenres : [];

  // Simple bar chart rendering
  const chartHeight = 120;
  const barWidth = Math.max(4, Math.min(16, Math.floor(500 / Math.max(history.length, 1))));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px', width: '90%', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3', marginBottom: '4px' }}>
              Market Intelligence
            </h2>
            <div style={{ fontSize: '13px', color: '#8b949e' }}>
              Gaming industry overview
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#8b949e', fontSize: '20px',
              cursor: 'pointer', padding: '4px 8px',
            }}
          >
            x
          </button>
        </div>

        {/* Market Sentiment Card */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Market Sentiment
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: label.color }}>
                {label.label}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Sales Multiplier
              </div>
              <div style={{
                fontSize: '28px', fontWeight: 700,
                color: multiplier >= 1.0 ? '#3fb950' : '#f85149',
              }}>
                {multiplier.toFixed(2)}x
              </div>
            </div>
          </div>

          {/* Sentiment gauge */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              height: '8px', borderRadius: '4px', position: 'relative',
              background: 'linear-gradient(90deg, #f85149 0%, #d29922 25%, #8b949e 50%, #58a6ff 75%, #3fb950 100%)',
            }}>
              {/* Indicator */}
              <div style={{
                position: 'absolute',
                left: `${(((typeof marketSim !== 'undefined' && marketSim ? marketSim.sentiment : 1.0) - 0.5) / 1.0) * 100}%`,
                top: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff',
                border: `3px solid ${label.color}`,
                transform: 'translateX(-50%)',
                boxShadow: `0 0 8px ${label.color}88`,
                transition: 'left 0.3s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#484f58' }}>
              <span>Recession</span>
              <span>Stable</span>
              <span>Boom</span>
            </div>
          </div>
        </div>

        {/* Trending Genres */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Trending Genres (1.15x sales bonus)
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {trending.map(genre => (
              <div key={genre} style={{
                padding: '10px 20px', borderRadius: '8px',
                background: 'rgba(63, 185, 80, 0.1)',
                border: '1px solid rgba(63, 185, 80, 0.3)',
                fontSize: '15px', fontWeight: 600, color: '#3fb950',
              }}>
                {genre}
              </div>
            ))}
            {GENRES.filter(g => !trending.includes(g)).map(genre => (
              <div key={genre} style={{
                padding: '10px 20px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '14px', color: '#484f58',
              }}>
                {genre}
              </div>
            ))}
          </div>
        </div>

        {/* Market History Chart */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Market History (3 years)
          </div>

          {history.length < 2 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#484f58', fontSize: '13px' }}>
              Not enough data yet. Check back soon.
            </div>
          ) : (
            <div style={{ position: 'relative', height: `${chartHeight + 30}px` }}>
              {/* Chart area */}
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '2px',
                height: `${chartHeight}px`,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '1px',
              }}>
                {history.map((point, i) => {
                  // Normalize sentiment (0.5-1.5) to 0-100%
                  const pct = ((point.sentiment - 0.5) / 1.0) * 100;
                  const barColor = point.sentiment >= 1.15 ? '#3fb950'
                    : point.sentiment >= 0.85 ? '#58a6ff'
                    : point.sentiment >= 0.65 ? '#d29922'
                    : '#f85149';

                  return (
                    <div
                      key={i}
                      style={{
                        width: `${barWidth}px`,
                        height: `${Math.max(4, pct)}%`,
                        background: barColor,
                        borderRadius: '2px 2px 0 0',
                        opacity: 0.7 + (i / history.length) * 0.3,
                        transition: 'height 0.3s ease',
                      }}
                      title={`Sentiment: ${point.sentiment.toFixed(2)}`}
                    />
                  );
                })}
              </div>

              {/* Reference lines */}
              <div style={{
                position: 'absolute', top: `${chartHeight * 0.5}px`, left: 0, right: 0,
                borderTop: '1px dashed rgba(255,255,255,0.1)',
              }}>
                <span style={{ position: 'absolute', right: 0, top: '-10px', fontSize: '9px', color: '#484f58' }}>
                  1.0x
                </span>
              </div>

              {/* X-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#484f58' }}>
                <span>Older</span>
                <span>Recent</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
