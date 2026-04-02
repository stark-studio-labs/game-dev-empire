/**
 * VerticalPanel — Shows all 4 verticals with unlock status, revenue, synergies.
 * Accessible from TopBar (building icon). Locked until $10M total revenue + Medium Office.
 */
function VerticalPanel({ state, onClose }) {
  const [selectedVertical, setSelectedVertical] = React.useState(null);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const formatCash = (n) => {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const formatNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const totalRevenue = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
  const activeVerticals = Object.keys(verticalManager.active);
  const activeSynergies = getSynergies(activeVerticals);
  const fullIntegration = hasFullIntegration(activeVerticals);
  const summary = verticalManager.getMonthlySummary();

  const verticals = ['software', 'streaming', 'cloud', 'ai'];

  const VERTICAL_ICONS = {
    software: '../../assets/verticals/software.svg',
    streaming: '../../assets/verticals/streaming.svg',
    cloud: '../../assets/verticals/cloud.svg',
    ai: '../../assets/verticals/ai.svg',
  };

  const handleUnlock = (id) => {
    if (verticalManager.unlock(id, engine.state)) {
      engine._emit();
      engine._save();
    }
  };

  const canUnlock = (id) => {
    const def = VERTICAL_DEFS[id];
    if (!def) return false;
    return !verticalManager.isActive(id)
      && engine.state.cash >= def.unlockCost
      && engine.state.level >= def.minLevel;
  };

  const getUnlockReason = (id) => {
    const def = VERTICAL_DEFS[id];
    if (!def) return '';
    const reasons = [];
    if (engine.state.level < def.minLevel) {
      const officeNames = ['Garage', 'Small Office', 'Medium Office', 'Large Office'];
      reasons.push(`Requires ${officeNames[def.minLevel]}`);
    }
    if (engine.state.cash < def.unlockCost) {
      reasons.push(`Need ${formatCash(def.unlockCost)}`);
    }
    return reasons.join(' + ');
  };

  // ── Vertical Card ──────────────────────────────────────────

  const renderVerticalCard = (id) => {
    const def = VERTICAL_DEFS[id];
    const isActive = verticalManager.isActive(id);
    const canBuy = canUnlock(id);
    const unlockReason = !isActive ? getUnlockReason(id) : '';

    return (
      <div
        key={id}
        className="glass-card"
        style={{
          padding: '16px',
          opacity: isActive ? 1 : 0.5,
          border: isActive ? `1px solid ${def.color}33` : '1px solid var(--color-border)',
          cursor: isActive ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        onClick={() => isActive && setSelectedVertical(selectedVertical === id ? null : id)}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: isActive ? `${def.color}22` : 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: isActive ? def.color : '#484f58',
            border: `1px solid ${isActive ? def.color + '44' : 'rgba(255,255,255,0.06)'}`,
          }}>
            {VERTICAL_ICONS[id] ? (
              <img src={VERTICAL_ICONS[id]} alt={def.name} style={{
                width: '22px', height: '22px', opacity: isActive ? 1 : 0.4,
                filter: isActive ? 'none' : 'grayscale(1)',
              }} />
            ) : def.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px', fontWeight: 700,
              color: isActive ? '#e6edf3' : '#6e7681',
            }}>
              {def.name}
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>{def.tagline}</div>
          </div>
          {isActive && (
            <div style={{
              fontSize: '10px', color: def.color, fontWeight: 600,
              background: `${def.color}15`, padding: '3px 8px', borderRadius: '4px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Active
            </div>
          )}
        </div>

        {/* Active: Show stats */}
        {isActive && summary[id] && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '8px', marginTop: '8px',
            padding: '8px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {id === 'software' && (
              <>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>MRR</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#3fb950' }}>{formatCash(summary.software.mrr)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>Subscribers</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{formatNum(summary.software.subscribers)}</div>
                </div>
              </>
            )}
            {id === 'streaming' && (
              <>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>Subscribers</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{formatNum(summary.streaming.subscribers)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>ARPU</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#3fb950' }}>${summary.streaming.arpu}</div>
                </div>
              </>
            )}
            {id === 'cloud' && (
              <>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>Regions</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{summary.cloud.regions}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>Enterprise Contracts</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{summary.cloud.contracts}</div>
                </div>
              </>
            )}
            {id === 'ai' && (
              <>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>Model Quality</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#da7cff' }}>{summary.ai.quality}/100</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>API Calls/mo</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{formatNum(summary.ai.apiCalls)}</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Locked: Unlock button or reason */}
        {!isActive && (
          <div style={{ marginTop: '8px' }}>
            <button
              className={canBuy ? 'btn-accent' : 'btn-secondary'}
              disabled={!canBuy}
              onClick={(e) => { e.stopPropagation(); handleUnlock(id); }}
              style={{
                width: '100%', padding: '8px', fontSize: '12px',
                opacity: canBuy ? 1 : 0.4,
              }}
            >
              Unlock for {formatCash(def.unlockCost)}
            </button>
            {unlockReason && (
              <div style={{ fontSize: '10px', color: '#6e7681', textAlign: 'center', marginTop: '4px' }}>
                {unlockReason}
              </div>
            )}
          </div>
        )}

        {/* Expanded detail for active vertical */}
        {isActive && selectedVertical === id && (
          <VerticalDetailSection id={id} state={state} />
        )}
      </div>
    );
  };

  // ── Main Render ────────────────────────────────────────────

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: '720px', maxHeight: '85vh', overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
              Tech Verticals
            </h2>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px' }}>
              Expand your empire beyond games
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            ESC
          </button>
        </div>

        {/* Active Vertical Count */}
        <div style={{
          display: 'flex', gap: '16px', marginBottom: '16px',
          padding: '12px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Verticals</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>{activeVerticals.length} / 4</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3fb950' }}>{formatCash(totalRevenue)}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Synergies</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#58a6ff' }}>{activeSynergies.length}</div>
          </div>
        </div>

        {/* Vertical Cards Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '20px',
        }}>
          {verticals.map(id => renderVerticalCard(id))}
        </div>

        {/* Synergies Section */}
        <div style={{
          padding: '16px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{
            fontSize: '13px', fontWeight: 600, color: '#e6edf3',
            marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '14px' }}>&#9889;</span>
            Synergy Bonuses
          </div>

          {activeSynergies.length === 0 && !fullIntegration && (
            <div style={{ fontSize: '12px', color: '#6e7681', fontStyle: 'italic' }}>
              Unlock multiple verticals to activate synergy bonuses
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SYNERGY_DEFS.map(syn => {
              const isActive = activeSynergies.some(s => s.id === syn.id);
              return (
                <div
                  key={syn.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 8px', borderRadius: '6px',
                    background: isActive ? 'rgba(88,166,255,0.06)' : 'transparent',
                    opacity: isActive ? 1 : 0.35,
                  }}
                >
                  <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{syn.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isActive ? '#e6edf3' : '#6e7681' }}>
                      {syn.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8b949e' }}>
                      {syn.description}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      fontSize: '10px', color: '#3fb950', fontWeight: 600,
                      background: 'rgba(63,185,80,0.1)', padding: '2px 6px', borderRadius: '3px',
                    }}>
                      ACTIVE
                    </div>
                  )}
                </div>
              );
            })}

            {/* Full Integration Bonus */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px', borderRadius: '6px', marginTop: '4px',
              background: fullIntegration ? 'rgba(218,124,255,0.08)' : 'transparent',
              border: fullIntegration ? '1px solid rgba(218,124,255,0.2)' : '1px solid transparent',
              opacity: fullIntegration ? 1 : 0.35,
            }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>&#9733;</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: fullIntegration ? '#da7cff' : '#6e7681' }}>
                  Full Integration
                </div>
                <div style={{ fontSize: '10px', color: '#8b949e' }}>
                  All 4 verticals active: +25% all revenue
                </div>
              </div>
              {fullIntegration && (
                <div style={{
                  fontSize: '10px', color: '#da7cff', fontWeight: 600,
                  background: 'rgba(218,124,255,0.12)', padding: '2px 6px', borderRadius: '3px',
                }}>
                  +25% ALL
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detail section that appears when clicking on an active vertical card.
 * Shows controls specific to each vertical.
 */
function VerticalDetailSection({ id, state }) {
  const formatCash = (n) => {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const vState = verticalManager.active[id];
  if (!vState) return null;

  const doAction = (fn) => {
    fn();
    engine._emit();
    engine._save();
  };

  // ── Software Detail ─────────────────────────────────────────

  if (id === 'software') {
    return (
      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <button
            className={`btn-secondary ${vState.model === 'b2c' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.softwareSetModel('b2c')); }}
            style={{ flex: 1, padding: '6px', fontSize: '11px', background: vState.model === 'b2c' ? 'rgba(88,166,255,0.1)' : undefined }}
          >
            B2C Model
          </button>
          <button
            className={`btn-secondary ${vState.model === 'b2b' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.softwareSetModel('b2b')); }}
            style={{ flex: 1, padding: '6px', fontSize: '11px', background: vState.model === 'b2b' ? 'rgba(88,166,255,0.1)' : undefined }}
          >
            B2B Model
          </button>
        </div>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>Launch Products ({vState.products.length}/4)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {SOFTWARE_PRODUCTS.map(p => {
            const launched = vState.products.some(pr => pr.type === p.id);
            return (
              <button
                key={p.id}
                className="btn-secondary"
                disabled={launched || vState.products.length >= 4 || engine.state.cash < p.launchCost}
                onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.softwareLaunchProduct(p.id, engine.state)); }}
                style={{
                  padding: '6px', fontSize: '10px', textAlign: 'left',
                  opacity: launched ? 0.4 : 1,
                  background: launched ? 'rgba(63,185,80,0.05)' : undefined,
                }}
              >
                {p.name}<br />
                <span style={{ color: '#8b949e' }}>{formatCash(p.launchCost)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Streaming Detail ────────────────────────────────────────

  if (id === 'streaming') {
    return (
      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Content Tier</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {['ad', 'premium', 'both'].map(tier => (
            <button
              key={tier}
              className={`btn-secondary ${vState.tier === tier ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.streamingSetTier(tier)); }}
              style={{
                flex: 1, padding: '6px', fontSize: '11px', textTransform: 'capitalize',
                background: vState.tier === tier ? 'rgba(248,81,73,0.1)' : undefined,
              }}
            >
              {tier === 'both' ? 'Dual Tier' : tier}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>
          Content Library: {vState.contentPieces} pieces
        </div>
        <button
          className="btn-secondary"
          disabled={engine.state.cash < 100000}
          onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.streamingCommissionContent(100000, engine.state)); }}
          style={{ padding: '6px', fontSize: '11px', width: '100%' }}
        >
          Commission Content ($100K)
        </button>
      </div>
    );
  }

  // ── Cloud Detail ────────────────────────────────────────────

  if (id === 'cloud') {
    return (
      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>Data Centers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
          {CLOUD_REGIONS.map(r => {
            const built = vState.regions.includes(r.id);
            return (
              <button
                key={r.id}
                className="btn-secondary"
                disabled={built || engine.state.cash < r.buildCost}
                onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.cloudBuildDatacenter(r.id, engine.state)); }}
                style={{
                  padding: '6px 8px', fontSize: '11px', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between',
                  opacity: built ? 0.5 : 1,
                  background: built ? 'rgba(63,185,80,0.05)' : undefined,
                }}
              >
                <span>{r.name} {built && '(Built)'}</span>
                <span style={{ color: '#8b949e' }}>{formatCash(r.buildCost)}</span>
              </button>
            );
          })}
        </div>
        <button
          className="btn-secondary"
          disabled={vState.regions.length === 0 || vState.enterpriseContracts >= vState.regions.length * 3 || engine.state.cash < 10000}
          onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.cloudAddEnterpriseContract(engine.state)); }}
          style={{ padding: '6px', fontSize: '11px', width: '100%' }}
        >
          Add Enterprise Contract ($10K) [{vState.enterpriseContracts}/{vState.regions.length * 3}]
        </button>
      </div>
    );
  }

  // ── AI Detail ──────────────────────────────────────────────

  if (id === 'ai') {
    const budgetOptions = [0, 50000, 100000, 200000, 500000];
    return (
      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Monthly Training Budget</div>
        <div style={{ display: 'flex', gap: '3px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {budgetOptions.map(b => (
            <button
              key={b}
              className={`btn-secondary ${vState.trainingBudget === b ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.aiSetTrainingBudget(b)); }}
              style={{
                padding: '4px 8px', fontSize: '10px',
                background: vState.trainingBudget === b ? 'rgba(218,124,255,0.1)' : undefined,
              }}
            >
              {b === 0 ? 'Off' : formatCash(b)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: '#8b949e' }}>Safety: {Math.round(vState.safety)}/100</span>
          <span style={{ fontSize: '11px', color: vState.isOpen ? '#3fb950' : '#f85149' }}>
            {vState.isOpen ? 'Open Source' : 'Closed Source'}
          </span>
        </div>
        <div style={{
          height: '4px', borderRadius: '2px', marginBottom: '8px',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            width: `${vState.safety}%`,
            background: vState.safety > 60 ? '#3fb950' : vState.safety > 40 ? '#d29922' : '#f85149',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <button
          className="btn-secondary"
          onClick={(e) => { e.stopPropagation(); doAction(() => verticalManager.aiToggleOpenSource()); }}
          style={{ padding: '6px', fontSize: '11px', width: '100%' }}
        >
          {vState.isOpen ? 'Switch to Closed Source (monetize API)' : 'Switch to Open Source (no API revenue)'}
        </button>
      </div>
    );
  }

  return null;
}
