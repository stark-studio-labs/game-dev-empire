/**
 * ContractPanel — Publisher contract offers + active contract tracker
 */
function ContractPanel({ state, onClose }) {
  if (!state) return null;

  const available = contractSystem.getAvailable();
  const active = contractSystem.getActiveContract();
  const isDeveloping = !!(state.currentGame && state.devPhase !== null);

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  const handleAccept = (contractId) => {
    const contract = available.find(c => c.id === contractId);
    if (contract && contractSystem.acceptContract(contractId)) {
      contractSystem.activeContract.acceptedWeek = state.totalWeeks;
      engine._emit();
      engine._save();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
            Contracts
          </h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Close
          </button>
        </div>

        {/* Active contract tracker */}
        {active && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', border: '1px solid rgba(88,166,255,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#58a6ff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Active Contract
              </span>
              <span style={{ fontSize: '11px', color: '#8b949e' }}>
                from {active.publisher}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#8b949e' }}>Required: </span>
                <span style={{ color: '#e6edf3', fontWeight: 600 }}>{active.topic} / {active.genre}</span>
              </div>
              <div>
                <span style={{ color: '#8b949e' }}>Platform: </span>
                <span style={{ color: '#e6edf3' }}>{active.platformName}</span>
              </div>
              <div>
                <span style={{ color: '#8b949e' }}>Payment: </span>
                <span style={{ color: '#3fb950', fontWeight: 600 }}>{formatCash(active.payment)}</span>
              </div>
              <div>
                <span style={{ color: '#8b949e' }}>RP Reward: </span>
                <span style={{ color: '#da7cff', fontWeight: 600 }}>+{active.rpReward}</span>
              </div>
              <div>
                <span style={{ color: '#8b949e' }}>Min Score: </span>
                <span style={{ color: '#d29922' }}>{active.minScore}/10</span>
              </div>
              <div>
                <span style={{ color: '#8b949e' }}>Deadline: </span>
                <span style={{ color: active.acceptedWeek && (state.totalWeeks - active.acceptedWeek) > active.deadline ? '#f85149' : '#e6edf3' }}>
                  {active.deadline}w
                  {active.acceptedWeek ? ` (${Math.max(0, active.deadline - (state.totalWeeks - active.acceptedWeek))}w left)` : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Available contracts */}
        <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '12px' }}>
          {available.length > 0
            ? `${available.length} contract${available.length !== 1 ? 's' : ''} available`
            : 'No contracts available. Check back next week.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {available.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{c.publisher}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3fb950' }}>{formatCash(c.payment)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '12px', marginBottom: '10px' }}>
                <div>
                  <span style={{ color: '#8b949e' }}>Topic: </span>
                  <span style={{ color: '#e6edf3' }}>{c.topic}</span>
                </div>
                <div>
                  <span style={{ color: '#8b949e' }}>Genre: </span>
                  <span style={{ color: '#e6edf3' }}>{c.genre}</span>
                </div>
                <div>
                  <span style={{ color: '#8b949e' }}>Platform: </span>
                  <span style={{ color: '#e6edf3' }}>{c.platformName}</span>
                </div>
                <div>
                  <span style={{ color: '#8b949e' }}>Min Score: </span>
                  <span style={{ color: '#d29922' }}>{c.minScore}/10</span>
                </div>
                <div>
                  <span style={{ color: '#8b949e' }}>RP: </span>
                  <span style={{ color: '#da7cff' }}>+{c.rpReward}</span>
                </div>
                <div>
                  <span style={{ color: '#8b949e' }}>Deadline: </span>
                  <span style={{ color: '#e6edf3' }}>{c.deadline}w</span>
                </div>
              </div>
              <button
                className="btn-accent"
                style={{ width: '100%', padding: '8px', fontSize: '13px' }}
                disabled={!!active || isDeveloping}
                onClick={() => handleAccept(c.id)}
              >
                {active ? 'Contract Active' : isDeveloping ? 'Developing...' : 'Accept Contract'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
