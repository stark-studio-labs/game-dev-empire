function GameReportPanel({ game, report, onClose }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!report) return null;

  const getScoreColor = (score) => {
    if (score >= 9) return 'var(--color-success)';
    if (score >= 7) return 'var(--color-accent)';
    if (score >= 5) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div className="panel-header" style={{ marginBottom: '4px' }}>Game Report</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              {game.title}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {game.topic} / {game.genre} — Score: <span style={{ color: getScoreColor(game.reviewAvg), fontWeight: 600 }}>{game.reviewAvg.toFixed(1)}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div className="panel-header" style={{ marginBottom: '12px', color: 'var(--color-accent)' }}>
            Research Insights ({report.detail === 'vague' ? 'Basic' : report.detail === 'moderate' ? 'Intermediate' : 'Advanced'})
          </div>
          {report.insights.map((insight, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < report.insights.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: '13px', color: 'var(--color-text-body)' }}>
              {insight}
            </div>
          ))}
        </div>

        {report.aspectRatings && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div className="panel-header" style={{ marginBottom: '12px' }}>Aspect Breakdown</div>
            {report.aspectRatings.map((ar, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <span style={{ width: '100px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{ar.name}</span>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${ar.importance * 100}%`,
                    background: ar.rating === 'good' ? 'var(--color-success)' : ar.rating === 'bad' ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
                  }} />
                </div>
                <span style={{ fontSize: '11px', color: ar.rating === 'good' ? 'var(--color-success)' : ar.rating === 'bad' ? 'var(--color-danger)' : 'var(--color-text-tertiary)', width: '20px' }}>
                  {ar.rating === 'good' ? '\u2713' : ar.rating === 'bad' ? '\u2717' : '\u2013'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginBottom: '16px' }}>
          {report.detail === 'vague' ? 'Ship more games to unlock deeper analysis' :
           report.detail === 'moderate' ? 'Ship 9+ games to unlock full aspect breakdown' :
           'Full analysis unlocked'}
        </div>

        <button className="btn-accent" onClick={onClose} style={{ width: '100%', padding: '12px' }}>
          Continue
        </button>
      </div>
    </div>
  );
}
