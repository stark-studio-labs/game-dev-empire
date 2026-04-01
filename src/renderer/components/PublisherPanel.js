/**
 * PublisherPanel -- Shows available publisher deals before releasing a game.
 * Appears after review scores are shown, before sales begin.
 */
function PublisherPanel({ state, game, onSelectDeal, onSelfPublish, onClose }) {
  if (!state || !game) return null;

  const [selectedId, setSelectedId] = React.useState(null);

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
            <div style={{ fontSize: '11px', color: '#8b949e' }}>Expected Revenue</div>
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
              <div style={{ fontSize: '11px', color: '#8b949e' }}>You Keep</div>
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
          {deals.map(deal => (
            <div
              key={deal.id}
              className={`glass-card ${selectedId === deal.id ? 'glass-card-selected' : 'glass-card-hover'}`}
              onClick={() => setSelectedId(deal.id)}
              style={{
                padding: '14px 16px',
                marginBottom: '8px',
                cursor: 'pointer',
                border: selectedId === deal.id ? `1px solid ${deal.color}` : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: deal.color,
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                      {deal.name}
                    </span>
                    {deal.genreMatch && (
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: 'rgba(63,185,80,0.15)', color: '#3fb950',
                      }}>
                        Genre Match
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px' }}>
                    {deal.tagline}
                  </div>

                  {/* Deal terms */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#8b949e' }}>Advance</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#d29922' }}>
                        {formatCash(deal.advance)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#8b949e' }}>Their Cut</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f85149' }}>
                        {Math.round(deal.effectiveRoyaltyCut * 100)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#8b949e' }}>You Keep</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#3fb950' }}>
                        {Math.round(deal.playerRevShare * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontSize: '10px', color: '#8b949e' }}>Est. Your Rev</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#3fb950' }}>
                    {formatCash(deal.estimatedPlayerRevenue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
