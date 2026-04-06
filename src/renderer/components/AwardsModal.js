function AwardsModal({ ceremony, onClose }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!ceremony) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#e6edf3', margin: 0 }}>
            Game of the Year Awards
          </h2>
          <div style={{ fontSize: '14px', color: '#8b949e', marginTop: '4px' }}>Year {ceremony.year}</div>
        </div>

        {ceremony.categories.map((cat, i) => (
          <div key={cat.id} className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="panel-header" style={{ color: cat.playerWon ? '#3fb950' : '#8b949e' }}>
                {cat.icon} {cat.name}
              </div>
              {cat.playerWon && <span style={{ fontSize: '11px', color: '#3fb950', fontWeight: 600 }}>YOU WON!</span>}
            </div>
            {cat.nominees.map((nom, j) => (
              <div key={j} style={{
                display: 'flex', justifyContent: 'space-between', padding: '4px 8px',
                borderRadius: '4px', marginBottom: '2px',
                background: nom === cat.winner ? 'rgba(63,185,80,0.1)' : 'transparent',
                border: nom === cat.winner ? '1px solid rgba(63,185,80,0.2)' : '1px solid transparent',
              }}>
                <span style={{ fontSize: '13px', color: nom.isPlayer ? '#e6edf3' : '#8b949e', fontWeight: nom === cat.winner ? 600 : 400 }}>
                  {nom === cat.winner ? '👑 ' : ''}{nom.title}
                  {!nom.isPlayer && <span style={{ fontSize: '10px', color: '#484f58', marginLeft: '4px' }}>(competitor)</span>}
                </span>
                <span style={{ fontSize: '13px', color: nom === cat.winner ? '#3fb950' : '#8b949e', fontWeight: 600 }}>
                  {nom.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        ))}

        <button className="btn-accent" onClick={onClose} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
          Continue
        </button>
      </div>
    </div>
  );
}
