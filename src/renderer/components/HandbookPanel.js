/**
 * HandbookPanel — Game Design Handbook with progressive discovery
 */
function HandbookPanel({ state, onClose }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const entries = typeof handbookSystem !== 'undefined' ? handbookSystem.getEntries() : [];
  const categories = typeof handbookSystem !== 'undefined' ? handbookSystem.getCategories() : [];
  const [activeTab, setActiveTab] = React.useState(categories[0] || 'Genre Guides');

  const filtered = entries.filter(e => e.category === activeTab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div className="panel-header" style={{ marginBottom: '4px' }}>📖 Game Design Handbook</div>
            <div style={{ fontSize: '12px', color: '#8b949e' }}>{entries.length} entries discovered</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#484f58' }}>
            Ship games to discover design insights!
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat}
                  className={activeTab === cat ? 'btn-accent' : 'btn-secondary'}
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat} ({entries.filter(e => e.category === cat).length})
                </button>
              ))}
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filtered.map((entry, i) => (
                <div key={i} className="glass-card" style={{ padding: '12px 16px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3', marginBottom: '4px' }}>
                    {entry.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#c9d1d9' }}>{entry.text}</div>
                </div>
              ))}
            </div>
          </React.Fragment>
        )}

        <button className="btn-accent" onClick={onClose} style={{ width: '100%', padding: '10px', marginTop: '16px' }}>
          Close
        </button>
      </div>
    </div>
  );
}
