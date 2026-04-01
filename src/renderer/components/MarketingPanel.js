/**
 * MarketingPanel -- Marketing campaign management UI
 * Shows available campaigns, active campaigns, hype meter, and history.
 */
function MarketingPanel({ state, onClose }) {
  const [tab, setTab] = React.useState('campaigns'); // campaigns | history

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const campaignTypes = marketingSystem.getCampaignTypes();
  const activeCampaigns = marketingSystem.getActiveCampaigns();
  const currentHype = marketingSystem.getHype();
  const salesMult = marketingSystem.getSalesMultiplier();

  const gameTitle = state.currentGame ? state.currentGame.title : 'Next Game';
  const canLaunch = state.currentGame || state.sellingGame;

  const handleLaunch = (campaignId) => {
    const type = CAMPAIGN_TYPES.find(c => c.id === campaignId);
    if (!type) return;

    if (state.cash < type.cost) {
      return; // Not enough cash (button should be disabled)
    }

    const result = marketingSystem.launchCampaign(campaignId, gameTitle);
    if (result.success) {
      engine.state.cash -= result.cost;
      finance.record('marketing', -result.cost, `${type.name} campaign`, engine._dateStr());
      engine._emit();
      engine._save();
    }
  };

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + n.toLocaleString();
  };

  // Hype bar color
  const hypeColor = currentHype >= 80 ? '#3fb950' : currentHype >= 40 ? '#d29922' : '#58a6ff';
  const hypePercent = Math.min(100, (currentHype / 150) * 100);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>Marketing</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={tab === 'campaigns' ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}}
              onClick={() => setTab('campaigns')}
            >
              Campaigns
            </button>
            <button
              className="btn-secondary"
              style={tab === 'history' ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}}
              onClick={() => setTab('history')}
            >
              History
            </button>
          </div>
        </div>

        {/* Hype Meter */}
        <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
              Total Hype
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: hypeColor }}>
                {currentHype}
              </span>
              <span style={{ fontSize: '12px', color: '#8b949e', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                {salesMult.toFixed(2)}x sales
              </span>
            </div>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${hypePercent}%`,
              background: `linear-gradient(90deg, ${hypeColor}, ${hypeColor}88)`,
              borderRadius: '3px', transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#484f58', marginTop: '4px' }}>
            Hype boosts first-week sales when your game releases
          </div>
        </div>

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Active Campaigns
            </div>
            {activeCampaigns.map((campaign, i) => {
              const progress = ((campaign.totalWeeks - campaign.weeksLeft) / campaign.totalWeeks) * 100;
              return (
                <div key={i} className="glass-card" style={{ padding: '10px 14px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{campaign.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{campaign.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#3fb950' }}>+{campaign.hypeGenerated} hype</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #da7cff, #58a6ff)' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#484f58', marginTop: '3px' }}>
                    {campaign.weeksLeft} week{campaign.weeksLeft !== 1 ? 's' : ''} remaining
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'campaigns' && (
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Available Campaigns
            </div>
            {campaignTypes.map(type => {
              const isRunning = activeCampaigns.some(c => c.campaignId === type.id);
              const canAfford = state.cash >= type.cost;
              const disabled = isRunning || !canAfford || !canLaunch;
              const hypeLabel = type.random ? `${type.hype}-${type.hypeMax}` : `${type.hype}`;

              return (
                <div key={type.id} className="glass-card glass-card-hover" style={{ padding: '12px 14px', marginBottom: '8px', opacity: disabled ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px' }}>{type.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{type.name}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '6px' }}>
                        {type.description}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                        <span style={{ color: '#d29922' }}>Cost: {formatCash(type.cost)}</span>
                        <span style={{ color: '#3fb950' }}>Hype: +{hypeLabel}</span>
                        <span style={{ color: '#8b949e' }}>{type.duration} weeks</span>
                        {type.fanBonus && <span style={{ color: '#58a6ff' }}>+{type.fanBonus.toLocaleString()} fans</span>}
                      </div>
                    </div>
                    <button
                      className="btn-accent"
                      style={{ padding: '6px 14px', fontSize: '12px', marginLeft: '12px', whiteSpace: 'nowrap' }}
                      onClick={() => handleLaunch(type.id)}
                      disabled={disabled}
                    >
                      {isRunning ? 'Running' : !canAfford ? 'No Funds' : 'Launch'}
                    </button>
                  </div>
                </div>
              );
            })}
            {!canLaunch && (
              <div style={{ fontSize: '12px', color: '#484f58', textAlign: 'center', padding: '12px' }}>
                Start developing a game to launch marketing campaigns
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Campaign History
            </div>
            {marketingSystem.campaignHistory.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#484f58', textAlign: 'center', padding: '20px 0' }}>
                No campaigns run yet
              </div>
            ) : (
              marketingSystem.campaignHistory.slice().reverse().map((entry, i) => (
                <div key={i} className="glass-card" style={{ padding: '10px 14px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{entry.name}</div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>for "{entry.gameTitle}"</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#3fb950' }}>+{entry.hypeGenerated} hype</div>
                      <div style={{ fontSize: '11px', color: '#d29922' }}>{formatCash(entry.cost)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
