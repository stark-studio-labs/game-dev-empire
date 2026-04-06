/**
 * EngineBuilderPanel — Modal for viewing and creating custom game engines.
 * Compose engines from completed research components for quality bonuses.
 */
function EngineBuilderPanel({ state, onClose }) {
  const [creating, setCreating] = React.useState(false);
  const [engineName, setEngineName] = React.useState('');
  const [selectedComponents, setSelectedComponents] = React.useState([]);
  const [notification, setNotification] = React.useState(null);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (!state) return null;

  const engines = engineBuilderSystem.getEngines();
  const available = engineBuilderSystem.getAvailableComponents();

  // Group available components by category
  const grouped = {};
  for (const comp of available) {
    if (!grouped[comp.category]) grouped[comp.category] = [];
    grouped[comp.category].push(comp);
  }

  const toggleComponent = (id) => {
    setSelectedComponents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Preview calculations for the creation form
  const previewTechLevel = (() => {
    if (selectedComponents.length === 0) return 0;
    let total = 0;
    for (const id of selectedComponents) {
      const item = RESEARCH_ITEMS.find(r => r.id === id);
      total += item ? item.techLevel : 0;
    }
    return Math.round(total / selectedComponents.length);
  })();

  const previewBonus = 1 + (previewTechLevel * 0.02);

  const handleBuild = () => {
    if (!engineName.trim() || selectedComponents.length === 0) return;
    const result = engineBuilderSystem.createEngine(engineName.trim(), selectedComponents);
    if (result) {
      result.createdWeek = state.totalWeeks || 0;
      setNotification(`Engine "${result.name}" built! Tech Level ${result.techLevel}`);
      setTimeout(() => setNotification(null), 3000);
      setCreating(false);
      setEngineName('');
      setSelectedComponents([]);
    } else {
      setNotification('Failed to build engine. Check components.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

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
        style={{ maxWidth: '800px', width: '95%', maxHeight: '85vh', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
              Engine Builder
            </h2>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
              Compose custom engines from researched tech for quality bonuses
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 14px' }}>
            ESC
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div style={{
            padding: '10px 14px', marginBottom: '16px', borderRadius: '8px',
            background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)',
            color: '#3fb950', fontSize: '13px',
          }}>
            {notification}
          </div>
        )}

        {/* Existing Engines List */}
        {!creating && (
          <div>
            {engines.length === 0 ? (
              <div style={{
                padding: '40px', textAlign: 'center', color: '#8b949e',
                background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                border: '1px dashed rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>No custom engines yet</div>
                <div style={{ fontSize: '12px', color: '#484f58' }}>
                  Research technologies in the R&D Lab, then combine them into powerful engines
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                {engines.map(eng => {
                  const bonus = engineBuilderSystem.getEngineBonus(eng.id);
                  return (
                    <div key={eng.id} className="glass-card" style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e6edf3' }}>
                            {eng.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
                            {eng.components.length} component{eng.components.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#58a6ff' }}>
                            Tech Lv {eng.techLevel}
                          </div>
                          <div style={{ fontSize: '12px', color: '#3fb950', marginTop: '2px' }}>
                            +{Math.round((bonus - 1) * 100)}% quality
                          </div>
                        </div>
                      </div>
                      {/* Component tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {eng.components.map(cid => {
                          const item = RESEARCH_ITEMS.find(r => r.id === cid);
                          if (!item) return null;
                          return (
                            <span key={cid} style={{
                              fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                              background: `${categoryColors[item.category] || '#8b949e'}15`,
                              color: categoryColors[item.category] || '#8b949e',
                              border: `1px solid ${categoryColors[item.category] || '#8b949e'}30`,
                            }}>
                              {item.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Create button */}
            <button
              className="btn-accent"
              onClick={() => setCreating(true)}
              disabled={available.length === 0}
              style={{ width: '100%', padding: '12px' }}
            >
              {available.length === 0
                ? 'Complete research to unlock components'
                : `Create New Engine (${available.length} component${available.length !== 1 ? 's' : ''} available)`
              }
            </button>
          </div>
        )}

        {/* Creation Form */}
        {creating && (
          <div>
            {/* Engine name */}
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              Engine Name
            </label>
            <input
              type="text"
              value={engineName}
              onChange={e => setEngineName(e.target.value)}
              placeholder="e.g. Phoenix Engine, Titan Core..."
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e6edf3', fontSize: '14px', outline: 'none', marginBottom: '16px',
              }}
            />

            {/* Component grid by category */}
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '10px' }}>
              Select Components
            </label>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, marginBottom: '6px',
                    color: categoryColors[cat] || '#8b949e',
                  }}>
                    {cat}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {items.map(comp => {
                      const selected = selectedComponents.includes(comp.id);
                      return (
                        <div
                          key={comp.id}
                          className={`selection-item ${selected ? 'selected' : ''}`}
                          onClick={() => toggleComponent(comp.id)}
                          style={{ padding: '10px', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#e6edf3' }}>
                              {comp.name}
                            </span>
                            <span style={{
                              fontSize: '11px', fontWeight: 600,
                              color: categoryColors[comp.category] || '#8b949e',
                            }}>
                              Lv {comp.techLevel}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                            {comp.category}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(grouped).length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#484f58', fontSize: '13px' }}>
                  No components available. Complete research first.
                </div>
              )}
            </div>

            {/* Preview */}
            {selectedComponents.length > 0 && (
              <div className="glass-card" style={{ padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '6px' }}>Preview</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>Components: </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                      {selectedComponents.length}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>Tech Level: </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#58a6ff' }}>
                      {previewTechLevel}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>Quality Bonus: </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#3fb950' }}>
                      +{Math.round((previewBonus - 1) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => { setCreating(false); setSelectedComponents([]); setEngineName(''); }}>
                Cancel
              </button>
              <button
                className="btn-accent"
                onClick={handleBuild}
                disabled={!engineName.trim() || selectedComponents.length === 0}
              >
                Build Engine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
