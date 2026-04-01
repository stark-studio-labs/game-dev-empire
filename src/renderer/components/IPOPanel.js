/**
 * IPOPanel -- IPO eligibility, go public button, stock price, board rating, stock chart.
 */
function IPOPanel({ state, onClose, bellRing }) {
  if (!state) return null;

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const isPublic = ipoSystem.isPublic;
  const eligible = ipoSystem.isEligible(state);
  const stockPrice = ipoSystem.stockPrice;
  const history = ipoSystem.stockPriceHistory || [];
  const marketCap = ipoSystem.getMarketCap ? ipoSystem.getMarketCap() : 0;
  const playerValue = ipoSystem.getPlayerValue ? ipoSystem.getPlayerValue() : 0;
  const boardRating = ipoSystem.boardApprovalRating;

  const formatCash = (n) => {
    if (n >= 1000000000) return '$' + (n / 1000000000).toFixed(2) + 'B';
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const handleGoPublic = () => {
    engine.goPublic();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {bellRing && <span className="animate-bell-ring" style={{ display: 'inline-block', transformOrigin: 'top center' }}>&#128276;</span>}
            {isPublic ? 'Stock Market' : 'IPO'}
          </h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '13px' }}>Close</button>
        </div>

        {!isPublic && !eligible && (
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '8px' }}>IPO Requirements</div>
            <div style={{ fontSize: '13px', color: '#c9d1d9', lineHeight: '1.8' }}>
              Total revenue: {formatCash(typeof finance !== 'undefined' ? finance.totalRevenue() : 0)} / $50M<br/>
              Company age: Year {state.year} / 5 years
            </div>
            <div style={{ fontSize: '12px', color: '#484f58', marginTop: '12px' }}>
              Reach $50M total revenue and 5 years to go public.
            </div>
          </div>
        )}

        {!isPublic && eligible && (
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="animate-glow" style={{ fontSize: '16px', fontWeight: 600, color: '#3fb950', marginBottom: '12px' }}>
              IPO Eligible!
            </div>
            <div style={{ fontSize: '13px', color: '#c9d1d9', marginBottom: '16px' }}>
              Your company qualifies to go public. You'll sell 49% of shares and receive
              the proceeds. After IPO, you'll face quarterly board meetings and guidance targets.
            </div>
            <button className="btn-accent" onClick={handleGoPublic} style={{ padding: '12px 32px', fontSize: '15px' }}>
              Go Public
            </button>
          </div>
        )}

        {isPublic && (
          <>
            {/* Stock price + stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Stock Price</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#58a6ff' }}>${stockPrice.toFixed(2)}</div>
              </div>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Market Cap</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#e6edf3' }}>{formatCash(marketCap)}</div>
              </div>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Your Stake</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3fb950' }}>{formatCash(playerValue)}</div>
              </div>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Board Approval</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: boardRating >= 50 ? '#3fb950' : '#f85149' }}>
                  {boardRating}%
                </div>
              </div>
            </div>

            {/* Mini stock chart */}
            {history.length > 1 && (
              <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '8px' }}>Price History</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '60px' }}>
                  {(() => {
                    const prices = history.map(h => h.price);
                    const maxP = Math.max(...prices);
                    const minP = Math.min(...prices);
                    const range = maxP - minP || 1;
                    return prices.slice(-40).map((p, i) => {
                      const pct = ((p - minP) / range) * 100;
                      const prev = i > 0 ? prices.slice(-40)[i - 1] : p;
                      const color = p >= prev ? '#3fb950' : '#f85149';
                      return (
                        <div key={i} style={{
                          flex: 1,
                          height: `${Math.max(4, pct)}%`,
                          background: color,
                          borderRadius: '2px 2px 0 0',
                          minWidth: '3px',
                        }} />
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Guidance info */}
            {ipoSystem.quarterlyGuidance && (
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '6px' }}>
                  Q{ipoSystem.quarterlyGuidance.quarter} Guidance
                </div>
                <div style={{ fontSize: '13px', color: '#c9d1d9' }}>
                  Revenue target: {formatCash(ipoSystem.quarterlyGuidance.revenue)}<br/>
                  Missed guidance: {ipoSystem.missedGuidanceCount} times
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
