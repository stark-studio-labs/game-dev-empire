/**
 * ReviewScreen — Shows 4 reviewer scores after game release
 */
function ReviewScreen({ game, onClose }) {
  if (!game) return null;

  const [revealed, setRevealed] = React.useState(0);

  React.useEffect(() => {
    // Reveal scores one at a time
    if (revealed < 4) {
      const timer = setTimeout(() => setRevealed(r => r + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [revealed]);

  const reviewerNames = ['GamePro Weekly', 'Digital Arts Magazine', 'IndieScope', 'TechGamer'];
  const reviewerAvatars = ['GP', 'DA', 'IS', 'TG'];

  const getScoreColor = (score) => {
    if (score >= 9) return '#3fb950';
    if (score >= 7) return '#58a6ff';
    if (score >= 5) return '#d29922';
    return '#f85149';
  };

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Game Review
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#e6edf3', marginBottom: '4px' }}>
          {game.title}
        </h2>
        <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '24px' }}>
          {game.topic} / {game.genre} on {PLATFORMS.find(p => p.id === game.platformId)?.name || game.platformId}
        </div>

        {/* Reviewer cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {game.reviews.map((score, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: '16px',
                opacity: i < revealed ? 1 : 0.3,
                transform: i < revealed ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(88,166,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#58a6ff',
                }}>
                  {reviewerAvatars[i]}
                </div>
                <div style={{ fontSize: '12px', color: '#8b949e', textAlign: 'left' }}>
                  {reviewerNames[i]}
                </div>
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 700,
                color: i < revealed ? getScoreColor(score) : '#30363d',
              }}>
                {i < revealed ? score.toFixed(1) : '?'}
              </div>
            </div>
          ))}
        </div>

        {/* Average score */}
        {revealed >= 4 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Average Score</div>
            <div className="review-score">{game.reviewAvg.toFixed(1)}</div>
          </div>
        )}

        {/* Game stats */}
        {revealed >= 4 && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Expected Revenue</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#3fb950' }}>{formatCash(game.totalRevenue)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Units Sold</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>{game.unitsSold.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>New Fans</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#58a6ff' }}>+{game.fansGained.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Dev Time</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>{game.devWeeks} weeks</div>
              </div>
            </div>
          </div>
        )}

        {revealed >= 4 && (
          <button className="btn-accent" onClick={onClose} style={{ width: '100%', padding: '12px' }}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
