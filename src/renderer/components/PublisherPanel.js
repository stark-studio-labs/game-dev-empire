/**
 * PublisherPanel -- Shows available publisher deals before releasing a game.
 * Appears after review scores are shown, before sales begin.
 */
function PublisherPanel({ state, game, onSelectDeal, onSelfPublish, onClose }) {
  const [selectedId, setSelectedId] = React.useState(null);
  const [negotiatingId, setNegotiatingId] = React.useState(null);
  const [negRound, setNegRound] = React.useState(0);       // 0 = making offer, 1 = counter shown
  const [negSlider, setNegSlider] = React.useState(0);     // -3 to +3: advance tilt
  const [counterSlider, setCounterSlider] = React.useState(0); // publisher's counter position

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (!state || !game) return null;

  const expectedRevenue = game.totalRevenue || 0;
  const deals = PublisherSystem.getAvailableDeals(state.games, game.genre, expectedRevenue);
  const canSelfPublish = PublisherSystem.canSelfPublish(state.fans);

  const formatCash = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1000000) return '$' + (abs / 1000000).toFixed(2) + 'M';
    if (abs >= 1000) return '$' + (abs / 1000).toFixed(1) + 'K';
    return '$' + abs.toLocaleString();
  };

  const handleConfirm = () => {
    if (selectedId === 'self') {
      onSelfPublish();
    } else {
      const deal = deals.find(d => d.id === selectedId);
      if (deal) onSelectDeal(deal);
    }
  };

  // Negotiation helpers
  const getNegotiatedTerms = (deal, sliderVal) => {
    const advanceMult = 1 + sliderVal * 0.15; // each step ±15% advance
    const royaltyDelta = sliderVal * 0.03;     // each step ±3% royalty cut
    const newAdvance = Math.round(deal.advance * advanceMult);
    const newRoyalty = Math.min(0.75, Math.max(0.05, deal.effectiveRoyaltyCut + royaltyDelta));
    const newPlayerShare = 1 - newRoyalty;
    const newPlayerRev = Math.round(expectedRevenue * newPlayerShare);
    return { advance: newAdvance, royaltyCut: newRoyalty, playerShare: newPlayerShare, playerRev: newPlayerRev };
  };

  const handleMakeOffer = (deal) => {
    if (negRound === 0) {
      // Publisher counters: pushes slider halfway back toward 0
      const counter = Math.round(negSlider * 0.5);
      setCounterSlider(counter);
      setNegRound(1);
    } else {
      // Round 2: accept final negotiated terms
      const terms = getNegotiatedTerms(deal, negSlider);
      const finalDeal = {
        ...deal,
        advance: terms.advance,
        effectiveRoyaltyCut: terms.royaltyCut,
        playerRevShare: terms.playerShare,
        estimatedPlayerRevenue: terms.playerRev,
      };
      onSelectDeal(finalDeal);
    }
  };

  const acceptCounter = (deal) => {
    const terms = getNegotiatedTerms(deal, counterSlider);
    const finalDeal = {
      ...deal,
      advance: terms.advance,
      effectiveRoyaltyCut: terms.royaltyCut,
      playerRevShare: terms.playerShare,
      estimatedPlayerRevenue: terms.playerRev,
    };
    onSelectDeal(finalDeal);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
              Publisher Deals
            </h2>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
              Choose a publisher for "{game.title}" or self-publish
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="panel-header">Expected Revenue</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#3fb950' }}>{formatCash(expectedRevenue)}</div>
          </div>
        </div>

        {/* Self-publish option */}
        <div
          className={`glass-card ${selectedId === 'self' ? 'glass-card-selected' : 'glass-card-hover'}`}
          onClick={() => canSelfPublish && setSelectedId('self')}
          style={{
            padding: '14px 16px',
            marginBottom: '12px',
            cursor: canSelfPublish ? 'pointer' : 'not-allowed',
            opacity: canSelfPublish ? 1 : 0.5,
            border: selectedId === 'self' ? '1px solid #58a6ff' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                Self-Publish
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e' }}>
                {canSelfPublish
                  ? 'Keep 100% of revenue -- no advance'
                  : `Need ${(10000).toLocaleString()} fans (you have ${state.fans.toLocaleString()})`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="panel-header">You Keep</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#3fb950' }}>100%</div>
            </div>
          </div>
        </div>

        {/* Publisher deals */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {deals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8b949e', fontSize: '13px' }}>
              No publishers are interested yet. Build your reputation!
            </div>
          )}
          {deals.map(deal => {
            const isNeg = negotiatingId === deal.id;
            const negTerms = isNeg ? getNegotiatedTerms(deal, negSlider) : null;
            const counterTerms = isNeg && negRound === 1 ? getNegotiatedTerms(deal, counterSlider) : null;
            return (
              <div key={deal.id} style={{ marginBottom: '8px' }}>
                <div
                  className={`glass-card ${selectedId === deal.id && !isNeg ? 'glass-card-selected' : 'glass-card-hover'}`}
                  onClick={() => { if (!isNeg) setSelectedId(deal.id); }}
                  style={{
                    padding: '14px 16px',
                    cursor: isNeg ? 'default' : 'pointer',
                    border: selectedId === deal.id ? `1px solid ${deal.color}` : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: deal.color }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{deal.name}</span>
                        {deal.genreMatch && (
                          <span className="badge badge--green">
                            Genre Match
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px' }}>{deal.tagline}</div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div>
                          <div className="panel-header">Advance</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#d29922' }}>{formatCash(deal.advance)}</div>
                        </div>
                        <div>
                          <div className="panel-header">Their Cut</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f85149' }}>{Math.round(deal.effectiveRoyaltyCut * 100)}%</div>
                        </div>
                        <div>
                          <div className="panel-header">You Keep</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#3fb950' }}>{Math.round(deal.playerRevShare * 100)}%</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '90px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="panel-header">Est. Your Rev</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#3fb950' }}>{formatCash(deal.estimatedPlayerRevenue)}</div>
                      </div>
                      {!isNeg && (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: '11px', padding: '3px 10px', color: '#58a6ff', borderColor: 'rgba(88,166,255,0.3)' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedId(deal.id); setNegotiatingId(deal.id); setNegRound(0); setNegSlider(0); }}
                        >
                          Negotiate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Negotiation UI */}
                  {isNeg && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(88,166,255,0.05)', borderRadius: '8px', border: '1px solid rgba(88,166,255,0.15)' }}>
                      <div style={{ fontSize: '12px', color: '#58a6ff', fontWeight: 600, marginBottom: '8px' }}>
                        {negRound === 0 ? 'Round 1: Make Your Offer' : `Round 2: Counter-Offer — ${deal.name} wants:`}
                      </div>

                      {negRound === 1 && counterTerms && (
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                          <div><div className="panel-header">Counter Advance</div><div style={{ fontSize: '13px', color: '#d29922', fontWeight: 600 }}>{formatCash(counterTerms.advance)}</div></div>
                          <div><div className="panel-header">Their Cut</div><div style={{ fontSize: '13px', color: '#f85149', fontWeight: 600 }}>{Math.round(counterTerms.royaltyCut * 100)}%</div></div>
                          <div><div className="panel-header">You Keep</div><div style={{ fontSize: '13px', color: '#3fb950', fontWeight: 600 }}>{Math.round(counterTerms.playerShare * 100)}%</div></div>
                          <button className="btn-accent" style={{ fontSize: '11px', padding: '4px 12px', alignSelf: 'center' }} onClick={() => acceptCounter(deal)}>Accept Counter</button>
                        </div>
                      )}

                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>
                        Tilt: {negSlider < 0 ? 'Less advance, lower royalty' : negSlider > 0 ? 'More advance, higher royalty' : 'Base terms'}
                      </div>
                      <input type="range" min="-3" max="3" step="1" value={negSlider} onChange={e => setNegSlider(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '8px' }} />
                      {negTerms && (
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                          <div><div className="panel-header">Your Offer: Advance</div><div style={{ fontSize: '13px', color: '#d29922', fontWeight: 600 }}>{formatCash(negTerms.advance)}</div></div>
                          <div><div className="panel-header">Their Cut</div><div style={{ fontSize: '13px', color: '#f85149', fontWeight: 600 }}>{Math.round(negTerms.royaltyCut * 100)}%</div></div>
                          <div><div className="panel-header">You Keep</div><div style={{ fontSize: '13px', color: '#3fb950', fontWeight: 600 }}>{Math.round(negTerms.playerShare * 100)}%</div></div>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => { setNegotiatingId(null); setNegRound(0); setNegSlider(0); }}>Cancel</button>
                        <button className="btn-accent" style={{ fontSize: '11px', padding: '4px 12px' }} onClick={() => handleMakeOffer(deal)}>
                          {negRound === 0 ? 'Send Offer' : 'Final Counter'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '8px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Skip (Self-Publish)
          </button>
          <button
            className="btn-accent"
            onClick={handleConfirm}
            disabled={!selectedId}
            style={{ padding: '10px 24px' }}
          >
            {selectedId === 'self' ? 'Self-Publish' : selectedId ? 'Sign Deal' : 'Select a Publisher'}
          </button>
        </div>
      </div>
    </div>
  );
}
