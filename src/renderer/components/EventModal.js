/**
 * EventModal — Full-screen modal for random events
 * Shows event story, options, and consequence feedback.
 */
function EventModal({ event, onChoice, consequence }) {
  if (!event && !consequence) return null;

  // Consequence feedback screen
  if (consequence) {
    const cashChange = consequence.adjustCash || 0;
    const fanChange = consequence.adjustFans || 0;

    return (
      <div className="modal-overlay" style={{ zIndex: 200 }}>
        <div className="modal-content" style={{ maxWidth: '550px', textAlign: 'center' }}>
          {/* Header */}
          <div style={{
            fontSize: '13px',
            color: '#58a6ff',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px',
          }}>
            Event Outcome
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#e6edf3',
            marginBottom: '24px',
          }}>
            {consequence.eventTitle}
          </div>

          {/* Outcome message */}
          <div style={{
            fontSize: '15px',
            color: '#c9d1d9',
            lineHeight: 1.7,
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {consequence.message}
          </div>

          {/* Consequence stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '28px' }}>
            {cashChange !== 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: cashChange > 0 ? '#3fb950' : '#f85149',
                }}>
                  {cashChange > 0 ? '+' : ''}{cashChange >= 1000 ? `$${(cashChange / 1000).toFixed(0)}K` : `$${cashChange}`}
                </div>
              </div>
            )}
            {fanChange !== 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fans</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: fanChange > 0 ? '#3fb950' : '#f85149',
                }}>
                  {fanChange > 0 ? '+' : ''}{Math.abs(fanChange) >= 1000 ? `${(fanChange / 1000).toFixed(1)}K` : fanChange}
                </div>
              </div>
            )}
          </div>

          {/* Continue button */}
          <button
            className="btn-accent"
            onClick={() => onChoice(-1)}
            style={{ padding: '12px 40px', fontSize: '15px' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Event choice screen
  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        {/* Header badge */}
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(88, 166, 255, 0.15)',
          border: '1px solid rgba(88, 166, 255, 0.3)',
          fontSize: '11px',
          color: '#58a6ff',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginBottom: '16px',
        }}>
          Breaking Event
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '26px',
          fontWeight: 700,
          color: '#e6edf3',
          marginBottom: '16px',
          lineHeight: 1.3,
        }}>
          {event.title}
        </h2>

        {/* Story text */}
        <div style={{
          fontSize: '15px',
          color: '#c9d1d9',
          lineHeight: 1.8,
          marginBottom: '28px',
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '10px',
          borderLeft: '3px solid #58a6ff',
        }}>
          {event.text}
        </div>

        {/* Options */}
        <div style={{ fontSize: '13px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          What do you do?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {event.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onChoice(i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '16px 20px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: '#e6edf3',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(88, 166, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(88, 166, 255, 0.3)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                {option.label}
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e' }}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
