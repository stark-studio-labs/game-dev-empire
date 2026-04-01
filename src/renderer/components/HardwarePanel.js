/**
 * HardwarePanel -- Custom console designer, cost calculator, sales tracker
 */
function HardwarePanel({ state, onClose }) {
  const [tab, setTab] = React.useState('design'); // design | consoles
  const [consoleName, setConsoleName] = React.useState('');
  const [cpuTier, setCpuTier] = React.useState(1);
  const [gpuTier, setGpuTier] = React.useState(1);
  const [ramTier, setRamTier] = React.useState(1);
  const [storageTier, setStorageTier] = React.useState(1);
  const [controllerTier, setControllerTier] = React.useState(1);
  const [retailPrice, setRetailPrice] = React.useState(299);

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

  const formatUnits = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const componentTiers = { cpu: cpuTier, gpu: gpuTier, ram: ramTier, storage: storageTier, controller: controllerTier };
  const mfgCost = hardwareSystem.calculateCost(componentTiers);
  const techLevel = hardwareSystem.calculateTechLevel(componentTiers);
  const allConsoles = hardwareSystem.getConsoles();
  const activeConsoles = hardwareSystem.getActiveConsoles();

  // Performance rating (1-100)
  const perfRating = Math.round(techLevel * 25);
  // Value rating based on price/performance
  const valueRating = Math.min(100, Math.round((perfRating / Math.max(1, retailPrice / 100)) * 10));

  const handleLaunch = () => {
    if (state.cash < mfgCost) return;

    const result = hardwareSystem.designConsole(consoleName, componentTiers, retailPrice, state.totalWeeks);
    if (result.success) {
      engine.state.cash -= mfgCost;
      finance.record('hardware', -mfgCost, `Console: ${consoleName}`, engine._dateStr());
      engine._emit();
      engine._save();
      setConsoleName('');
      setCpuTier(1);
      setGpuTier(1);
      setRamTier(1);
      setStorageTier(1);
      setControllerTier(1);
      setRetailPrice(299);
      setTab('consoles');
    }
  };

  const handleDiscontinue = (consoleId) => {
    hardwareSystem.discontinue(consoleId);
    engine._emit();
    engine._save();
  };

  const ComponentSelector = ({ label, type, value, onChange }) => {
    const options = HARDWARE_COMPONENTS[type];
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <span style={{ color: '#8b949e' }}>{label}</span>
          <span style={{ color: '#c9d1d9' }}>{formatCash(options.find(o => o.tier === value)?.cost || 0)}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {options.map(opt => (
            <button
              key={opt.tier}
              className="btn-secondary"
              style={{
                flex: 1, padding: '6px 4px', fontSize: '11px',
                ...(value === opt.tier ? { borderColor: '#58a6ff', color: '#58a6ff', background: 'rgba(88,166,255,0.1)' } : {}),
              }}
              onClick={() => onChange(opt.tier)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const TechMeter = ({ value, max, label, color }) => (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
        <span style={{ color: '#8b949e' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}/{max}</span>
      </div>
      <div className="stat-bar">
        <div className="stat-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>
            {'\uD83D\uDDA5\uFE0F'} Hardware Lab
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn-secondary"
              style={tab === 'design' ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}}
              onClick={() => setTab('design')}
            >
              Design
            </button>
            <button
              className="btn-secondary"
              style={tab === 'consoles' ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}}
              onClick={() => setTab('consoles')}
            >
              Consoles ({allConsoles.length})
            </button>
          </div>
        </div>

        {state.level < 3 && (
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: '#d29922' }}>
            {'\uD83D\uDD12'} Hardware Lab requires Large Office (Level 3). Keep growing your studio!
          </div>
        )}

        {state.level >= 3 && tab === 'design' && (
          <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Left: Component selection */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>Console Name</label>
                  <input
                    type="text"
                    value={consoleName}
                    onChange={e => setConsoleName(e.target.value)}
                    placeholder="Name your console..."
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e6edf3', fontSize: '13px', outline: 'none',
                    }}
                  />
                </div>

                <ComponentSelector label="CPU" type="cpu" value={cpuTier} onChange={setCpuTier} />
                <ComponentSelector label="GPU" type="gpu" value={gpuTier} onChange={setGpuTier} />
                <ComponentSelector label="RAM" type="ram" value={ramTier} onChange={setRamTier} />
                <ComponentSelector label="Storage" type="storage" value={storageTier} onChange={setStorageTier} />
                <ComponentSelector label="Controller" type="controller" value={controllerTier} onChange={setControllerTier} />

                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>
                    Retail Price: {formatCash(retailPrice)}
                  </label>
                  <input
                    type="range"
                    min={99}
                    max={999}
                    step={10}
                    value={retailPrice}
                    onChange={e => setRetailPrice(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#58a6ff' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#484f58' }}>
                    <span>$99</span>
                    <span>$999</span>
                  </div>
                </div>
              </div>

              {/* Right: Performance preview */}
              <div style={{ width: '200px' }}>
                <div className="glass-card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    Preview
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#58a6ff' }}>
                      {techLevel.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase' }}>Tech Level</div>
                  </div>

                  <TechMeter value={perfRating} max={100} label="Performance" color="#58a6ff" />
                  <TechMeter value={valueRating} max={100} label="Value Rating" color="#3fb950" />

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '12px', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#8b949e' }}>Mfg Cost</span>
                      <span style={{ color: '#f85149', fontWeight: 600 }}>{formatCash(mfgCost)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#8b949e' }}>Retail</span>
                      <span style={{ color: '#3fb950', fontWeight: 600 }}>{formatCash(retailPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#8b949e' }}>Margin/unit</span>
                      <span style={{
                        color: retailPrice > mfgCost * 0.3 ? '#3fb950' : '#f85149',
                        fontWeight: 600,
                      }}>
                        {formatCash(Math.max(0, retailPrice - mfgCost * 0.3))}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-accent"
                  style={{ width: '100%', marginTop: '12px', padding: '10px' }}
                  onClick={handleLaunch}
                  disabled={!consoleName.trim() || state.cash < mfgCost}
                >
                  {state.cash < mfgCost
                    ? 'Not Enough Cash'
                    : `Launch \u2014 ${formatCash(mfgCost)}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {state.level >= 3 && tab === 'consoles' && (
          <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
            {allConsoles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#484f58', fontSize: '14px' }}>
                No consoles designed yet. Open the Design tab to create one!
              </div>
            )}

            {/* Summary stats */}
            {allConsoles.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className="glass-card" style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Total Revenue</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#3fb950' }}>
                    {formatCash(hardwareSystem.totalRevenue())}
                  </div>
                </div>
                <div className="glass-card" style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Units Sold</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#58a6ff' }}>
                    {formatUnits(hardwareSystem.totalUnitsSold())}
                  </div>
                </div>
                <div className="glass-card" style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Active</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#e6edf3' }}>
                    {activeConsoles.length}
                  </div>
                </div>
              </div>
            )}

            {allConsoles.slice().reverse().map(console => {
              const age = state.totalWeeks - console.weekLaunched;
              const ageYears = Math.floor(age / 52);
              const ageWeeks = age % 52;

              return (
                <div key={console.id} className="glass-card" style={{ padding: '14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#e6edf3' }}>
                          {console.name}
                        </div>
                        <span style={{
                          fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                          background: console.active ? 'rgba(63,185,80,0.15)' : 'rgba(139,148,158,0.15)',
                          color: console.active ? '#3fb950' : '#8b949e',
                        }}>
                          {console.active ? 'ACTIVE' : 'RETIRED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                        Tech {console.techLevel.toFixed(1)} | Retail {formatCash(console.retailPrice)} | Age: {ageYears > 0 ? `${ageYears}y ` : ''}{ageWeeks}w
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#3fb950' }}>
                        {formatCash(console.revenue)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>
                        {formatUnits(console.unitsSold)} units
                      </div>
                    </div>
                  </div>

                  {/* Component breakdown */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(console.components).map(([type, comp]) => (
                      <span key={type} style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: 'rgba(88,166,255,0.1)', color: '#58a6ff',
                      }}>
                        {type.toUpperCase()}: {comp.label}
                      </span>
                    ))}
                  </div>

                  {console.active && (
                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11px', color: '#d29922', borderColor: 'rgba(210,153,34,0.3)' }}
                        onClick={() => handleDiscontinue(console.id)}
                      >
                        Discontinue
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
