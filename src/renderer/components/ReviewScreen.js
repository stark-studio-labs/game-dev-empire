/**
 * ReviewScreen — Shows 4 critic reviews after game release
 * Now with critic personalities, avatars, and flavor quotes.
 * Micro-animations: score reveal rolls up, camera shake on 10.0,
 * confetti burst on avg > 9.0, quote fades in after number lands.
 */
function ReviewScreen({ game, onClose }) {
  if (!game) return null;

  const [revealed, setRevealed] = React.useState(0);
  const [shaking, setShaking] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  React.useEffect(() => {
    if (revealed < 4) {
      const timer = setTimeout(() => setRevealed(r => r + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [revealed]);

  // Camera shake when a 10.0 is revealed
  React.useEffect(() => {
    if (revealed > 0 && revealed <= 4) {
      const justRevealed = revealed - 1;
      if (game.reviews[justRevealed] >= 10.0) {
        setShaking(true);
        const timer = setTimeout(() => setShaking(false), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [revealed]);

  // Confetti when all scores revealed and average > 9.0
  React.useEffect(() => {
    if (revealed >= 4 && game.reviewAvg > 9.0) {
      setShowConfetti(true);
    }
  }, [revealed]);

  const hasCritics = game.criticReviews && game.criticReviews.length > 0;
  const reviewerNames = hasCritics
    ? game.criticReviews.map(cr => cr.critic.name)
    : ['GamePro Weekly', 'Digital Arts Magazine', 'IndieScope', 'TechGamer'];
  const reviewerAvatars = hasCritics
    ? game.criticReviews.map(cr => cr.critic.avatar)
    : ['GP', 'DA', 'IS', 'TG'];
  const reviewerTitles = hasCritics
    ? game.criticReviews.map(cr => cr.critic.title)
    : ['', '', '', ''];
  const reviewerQuotes = hasCritics
    ? game.criticReviews.map(cr => cr.quote)
    : ['', '', '', ''];

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
      <div
        className={`modal-content ${shaking ? 'animate-shake' : ''}`}
        style={{ maxWidth: '560px', textAlign: 'center' }}
      >
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
          {game.reviews.map((score, i) => {
            const isRevealed = i < revealed;
            const revealDelay = `${i * 0.5}s`;

            return (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: '16px',
                  opacity: isRevealed ? 1 : 0.3,
                  transform: isRevealed ? 'scale(1)' : 'scale(0.95)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(88,166,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: hasCritics ? '18px' : '11px', fontWeight: 700, color: '#58a6ff',
                  }}>
                    {reviewerAvatars[i]}
                  </div>
                  <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#e6edf3', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {reviewerNames[i]}
                    </div>
                    {reviewerTitles[i] && (
                      <div style={{ fontSize: '10px', color: '#8b949e', fontStyle: 'italic' }}>
                        {reviewerTitles[i]}
                      </div>
                    )}
                  </div>
                </div>
                {/* Score with roll-up animation */}
                <div
                  className={isRevealed ? 'animate-score-reveal' : ''}
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: isRevealed ? getScoreColor(score) : '#30363d',
                    marginBottom: reviewerQuotes[i] ? '8px' : '0',
                  }}
                >
                  {isRevealed ? score.toFixed(1) : '?'}
                </div>
                {/* Quote fades in after score lands */}
                {isRevealed && reviewerQuotes[i] && (
                  <div
                    className="animate-fade-slide-up"
                    style={{
                      fontSize: '11px',
                      color: '#8b949e',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      padding: '0 4px',
                      animationDelay: '0.4s',
                    }}
                  >
                    {reviewerQuotes[i]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Average score with confetti */}
        {revealed >= 4 && (
          <div
            className={showConfetti ? 'animate-confetti' : ''}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Average Score</div>
            <div className="review-score animate-score-reveal">{game.reviewAvg.toFixed(1)}</div>
          </div>
        )}

        {/* Game stats */}
        {revealed >= 4 && (
          <div className="glass-card animate-fade-slide-up" style={{ padding: '16px', marginBottom: '20px', textAlign: 'left', animationDelay: '0.2s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Expected Revenue</div>
                <div className="animate-count-up" style={{ fontSize: '16px', fontWeight: 600, color: '#3fb950', animationDelay: '0.3s' }}>{formatCash(game.totalRevenue)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Units Sold</div>
                <div className="animate-count-up" style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3', animationDelay: '0.4s' }}>{game.unitsSold.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>New Fans</div>
                <div className="animate-count-up" style={{ fontSize: '16px', fontWeight: 600, color: '#58a6ff', animationDelay: '0.5s' }}>+{game.fansGained.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>Dev Time</div>
                <div className="animate-count-up" style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3', animationDelay: '0.6s' }}>{game.devWeeks} weeks</div>
              </div>
            </div>
          </div>
        )}

        {revealed >= 4 && (
          <button className="btn-accent animate-fade-slide-up" onClick={onClose} style={{ width: '100%', padding: '12px', animationDelay: '0.4s' }}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
