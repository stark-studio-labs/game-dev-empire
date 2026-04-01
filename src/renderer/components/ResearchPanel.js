/**
 * ResearchPanel — Tech tree grid with categories
 * Shows research items, status, and allows starting research.
 */
function ResearchPanel({ state, onClose }) {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [notification, setNotification] = React.useState(null);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (!state) return null;

  const labUnlocked = researchSystem.isLabUnlocked(state.level);
  const grouped = researchSystem.getByCategory(state.level);
  const completedCount = researchSystem.completedCount();
  const totalCount = RESEARCH_ITEMS.length;
  const scoreBonus = researchSystem.getScoreBonus();

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + n.toLocaleString();
  };

  const handleStartResearch = (itemId) => {
    const result = researchSystem.startResearch(itemId, state);
    setNotification(result.message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelResearch = () => {
    researchSystem.cancelResearch();
    setNotification('Research cancelled. No refund.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter items
  const displayCategories = selectedCategory === 'All'
    ? RESEARCH_CATEGORIES
    : [selectedCategory];

  const categoryColors = {
    AI: '#da7cff',
    Networking: '#58a6ff',
    Graphics: '#3fb950',
    Audio: '#d29922',
    UX: '#f78166',
    Monetization: '#79c0ff',
    Engine: '#f85149',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '900px', width: '95%', maxHeight: '85vh', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3', marginBottom: '4px' }}>
              R&D Laboratory
            </h2>
            <div style={{ fontSize: '13px', color: '#8b949e' }}>
              {completedCount}/{totalCount} researched | Score bonus: +{(scoreBonus * 100).toFixed(1)}%
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            ×
          </button>
        </div>

        {/* Lab not unlocked warning */}
        {!labUnlocked && (
          <div className="alert alert--danger">
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#f85149', marginBottom: '4px' }}>
              R&D Lab Locked
            </div>
            <div style={{ fontSize: '13px', color: '#8b949e' }}>
              Upgrade to Medium Office to unlock the R&D Laboratory.
            </div>
          </div>
        )}

        {/* Current research progress */}
        {researchSystem.currentResearch && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div className="panel-header">
                  Currently Researching
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>
                  {researchSystem.currentResearch.name}
                </div>
              </div>
              <button className="btn-secondary" onClick={handleCancelResearch} style={{ padding: '4px 12px', fontSize: '12px' }}>
                Cancel
              </button>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${((researchSystem.currentResearch.totalWeeks - researchSystem.currentResearch.weeksLeft) / researchSystem.currentResearch.totalWeeks) * 100}%`,
                  background: 'linear-gradient(90deg, #da7cff, #58a6ff)',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px' }}>
              ~{Math.max(1, Math.ceil(researchSystem.currentResearch.weeksLeft))} weeks remaining
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            className={`btn-tab${selectedCategory === 'All' ? ' btn-tab--active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {RESEARCH_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn-tab${selectedCategory === cat ? ' btn-tab--active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({grouped[cat].filter(i => i.completed).length}/{grouped[cat].length})
            </button>
          ))}
        </div>

        {/* Research items grid */}
        <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
          {displayCategories.map(cat => (
            <div key={cat} style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, color: categoryColors[cat] || '#8b949e',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
                paddingBottom: '6px', borderBottom: `1px solid ${categoryColors[cat] || '#8b949e'}33`,
              }}>
                {cat}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                {grouped[cat].map(item => {
                  const isLocked = !item.unlocked && !item.completed;
                  const isActive = item.inProgress;
                  const isDone = item.completed;

                  return (
                    <div
                      key={item.id}
                      className={`research-item${isActive ? ' research-item--active' : ''}${isDone ? ' research-item--done' : ''}${isLocked ? ' research-item--locked' : ''}`}
                      onClick={() => {
                        if (!isLocked && !isDone && !isActive && labUnlocked) {
                          handleStartResearch(item.id);
                        }
                      }}
                    >
                      {/* Completed badge */}
                      {isDone && (
                        <div className="research-item__badge">
                          +
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: isDone ? '#3fb950' : '#e6edf3', marginBottom: '2px' }}>
                          {item.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px', lineHeight: 1.4 }}>
                        {item.description}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#484f58' }}>
                        {!isDone && <span>Lv{item.techLevel}</span>}
                        {!isDone && <span>{formatCash(item.cost)}</span>}
                        {!isDone && <span>{item.durationWeeks}w</span>}
                        {isDone && <span style={{ color: '#3fb950' }}>Completed</span>}
                      </div>

                      {/* Progress bar if in progress */}
                      {isActive && (
                        <div className="progress-bar" style={{ marginTop: '6px', height: '4px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${((item.durationWeeks - item.weeksLeft) / item.durationWeeks) * 100}%`,
                              background: 'linear-gradient(90deg, #da7cff, #58a6ff)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Notification toast */}
        {notification && (
          <div className="toast" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)', right: 'auto' }}>
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}
