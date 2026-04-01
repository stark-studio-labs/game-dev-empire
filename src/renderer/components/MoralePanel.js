/**
 * MoralePanel -- Morale bar, active perks, buy perks, morale history
 */
function MoralePanel({ state, onClose }) {
  if (!state) return null;

  const [tab, setTab] = React.useState('overview'); // overview | perks | history

  const morale = moraleSystem.getMorale();
  const status = moraleSystem.getMoraleStatus();
  const qualityMult = moraleSystem.getQualityMultiplier();
  const activePerks = moraleSystem.getActivePerks();
  const availablePerks = moraleSystem.getAvailablePerks();
  const history = moraleSystem.history.slice().reverse().slice(0, 20);

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const handleBuyPerk = (perkId) => {
    const perk = CULTURE_PERKS.find(p => p.id === perkId);
    if (!perk) return;
    if (state.cash < perk.cost) {
      return; // Not enough cash -- button is disabled
    }
    const cost = moraleSystem.purchasePerk(perkId);
    if (cost >= 0) {
      // Deduct cost from engine state
      engine.state.cash -= cost;
      if (cost > 0) {
        finance.record('perk', -cost, perk.name, engine._dateStr());
      }
      moraleSystem.applyEvent('custom', state.totalWeeks, 0); // Log to history
      engine._emit();
      engine._save();
    }
  };

  const eventLabels = {
    game_success: { label: 'Game Success', color: '#3fb950' },
    game_failure: { label: 'Game Flopped', color: '#f85149' },
    crunch:       { label: 'Crunch Period', color: '#f85149' },
    hire:         { label: 'New Hire', color: '#58a6ff' },
    fire:         { label: 'Fired Staff', color: '#d29922' },
    pay_raise:    { label: 'Pay Raise', color: '#3fb950' },
    drift:        { label: 'Natural Drift', color: '#8b949e' },
    custom:       { label: 'Event', color: '#8b949e' },
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
            Studio Culture
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer' }}
          >x</button>
        </div>

        {/* Morale overview */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{status.emoji}</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: status.color }}>{status.label}</div>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>Team Morale</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: status.color }}>{morale}</div>
              <div style={{ fontSize: '11px', color: '#8b949e' }}>/ 100</div>
            </div>
          </div>

          {/* Morale bar */}
          <div style={{
            height: '12px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              height: '100%', width: `${morale}%`,
              background: `linear-gradient(90deg, #f85149, #d29922, #3fb950)`,
              backgroundSize: '200% 100%',
              backgroundPosition: `${100 - morale}% 0`,
              borderRadius: '6px',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Quality multiplier */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#8b949e' }}>Game Quality Effect</span>
            <span style={{
              fontWeight: 600,
              color: qualityMult >= 1.05 ? '#3fb950' : qualityMult >= 1.0 ? '#8b949e' : '#f85149',
            }}>
              x{qualityMult.toFixed(2)} {qualityMult > 1 ? '\u2191' : qualityMult < 1 ? '\u2193' : ''}
            </span>
          </div>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'overview', label: `Active Perks (${activePerks.length})` },
            { id: 'perks', label: `Buy Perks (${availablePerks.length})` },
            { id: 'history', label: 'History' },
          ].map(t => (
            <button
              key={t.id}
              className="btn-secondary"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, fontSize: '12px', padding: '8px',
                ...(tab === t.id ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active Perks tab */}
        {tab === 'overview' && (
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {activePerks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#484f58', fontSize: '13px' }}>
                No perks purchased yet
              </div>
            )}
            {activePerks.map(perk => (
              <div key={perk.id} className="glass-card" style={{ padding: '12px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{perk.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{perk.name}</div>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>{perk.description}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#3fb950', fontWeight: 600 }}>
                    +{perk.moraleBoost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buy Perks tab */}
        {tab === 'perks' && (
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {availablePerks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#3fb950', fontSize: '13px' }}>
                All perks purchased!
              </div>
            )}
            {availablePerks.map(perk => {
              const canAfford = state.cash >= perk.cost;
              return (
                <div key={perk.id} className="glass-card" style={{
                  padding: '12px', marginBottom: '6px',
                  opacity: canAfford ? 1 : 0.5,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{perk.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{perk.name}</div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>{perk.description}</div>
                      <div style={{ fontSize: '11px', color: '#3fb950', marginTop: '2px' }}>
                        +{perk.moraleBoost} morale
                      </div>
                    </div>
                    <button
                      className="btn-accent"
                      onClick={() => handleBuyPerk(perk.id)}
                      disabled={!canAfford}
                      style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {perk.cost === 0 ? 'Free' : formatCash(perk.cost)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#484f58', fontSize: '13px' }}>
                No morale events yet
              </div>
            )}
            {history.map((entry, i) => {
              const ev = eventLabels[entry.event] || eventLabels.custom;
              return (
                <div key={i} style={{
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: ev.color, fontWeight: 500 }}>{ev.label}</div>
                    <div style={{ fontSize: '10px', color: '#484f58' }}>Week {entry.week}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: 600,
                      color: entry.delta > 0 ? '#3fb950' : entry.delta < 0 ? '#f85149' : '#8b949e',
                    }}>
                      {entry.delta > 0 ? '+' : ''}{entry.delta}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8b949e', minWidth: '24px', textAlign: 'right' }}>
                      {entry.morale}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
