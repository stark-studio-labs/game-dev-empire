/**
 * TutorialOverlay — Semi-transparent overlay with spotlight on target element,
 * speech bubble with tutorial text, step indicator, nav buttons.
 */
function TutorialOverlay() {
  const [tutorialState, setTutorialState] = React.useState({
    active: false,
    currentStep: 0,
    totalSteps: 0,
    step: null,
    completed: false,
  });
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const [targetRect, setTargetRect] = React.useState(null);

  React.useEffect(() => {
    const unsub = tutorialSystem.subscribe(state => {
      setTutorialState(state);
    });
    return () => unsub();
  }, []);

  // Find and measure the target element
  React.useEffect(() => {
    if (!tutorialState.active || !tutorialState.step || !tutorialState.step.target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(tutorialState.step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 500);
    return () => clearInterval(interval);
  }, [tutorialState.active, tutorialState.currentStep]);

  if (!tutorialState.active || !tutorialState.step) return null;

  const step = tutorialState.step;
  const progress = tutorialSystem.getProgress();
  const position = step.position || 'center';
  const hasPadding = 12;

  // Calculate bubble position
  let bubbleStyle = {};
  if (targetRect && position !== 'center') {
    const spotTop = targetRect.top - hasPadding;
    const spotLeft = targetRect.left - hasPadding;
    const spotWidth = targetRect.width + hasPadding * 2;
    const spotHeight = targetRect.height + hasPadding * 2;

    switch (position) {
      case 'bottom':
        bubbleStyle = {
          position: 'fixed',
          top: `${spotTop + spotHeight + 16}px`,
          left: `${spotLeft + spotWidth / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'top':
        bubbleStyle = {
          position: 'fixed',
          bottom: `${window.innerHeight - spotTop + 16}px`,
          left: `${spotLeft + spotWidth / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'left':
        bubbleStyle = {
          position: 'fixed',
          top: `${spotTop + spotHeight / 2}px`,
          right: `${window.innerWidth - spotLeft + 16}px`,
          transform: 'translateY(-50%)',
        };
        break;
      case 'right':
        bubbleStyle = {
          position: 'fixed',
          top: `${spotTop + spotHeight / 2}px`,
          left: `${spotLeft + spotWidth + 16}px`,
          transform: 'translateY(-50%)',
        };
        break;
    }
  } else {
    // Center position
    bubbleStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
    }}>
      {/* Semi-transparent overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
      }} />

      {/* Spotlight cutout on target element */}
      {targetRect && (
        <div style={{
          position: 'fixed',
          top: `${targetRect.top - hasPadding}px`,
          left: `${targetRect.left - hasPadding}px`,
          width: `${targetRect.width + hasPadding * 2}px`,
          height: `${targetRect.height + hasPadding * 2}px`,
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          background: 'transparent',
          zIndex: 1001,
          pointerEvents: 'none',
          border: '2px solid rgba(88, 166, 255, 0.5)',
        }} />
      )}

      {/* Speech bubble */}
      <div style={{
        ...bubbleStyle,
        zIndex: 1002,
        maxWidth: '420px',
        width: '90%',
      }}>
        <div style={{
          background: '#161b22',
          border: '1px solid rgba(88, 166, 255, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Step indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              color: '#58a6ff',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Tutorial
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>
              {progress.current} / {progress.total}
            </div>
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            {Array.from({ length: progress.total }).map((_, i) => (
              <div key={i} style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                background: i < progress.current
                  ? '#58a6ff'
                  : i === tutorialState.currentStep
                    ? 'rgba(88, 166, 255, 0.5)'
                    : 'rgba(255, 255, 255, 0.08)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>

          {/* Message */}
          <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#e6edf3',
            marginBottom: '20px',
          }}>
            {step.message}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Don't show again checkbox */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '11px', color: '#8b949e', cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                style={{ accentColor: '#58a6ff' }}
              />
              Don't show again
            </label>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Skip button */}
              <button
                onClick={() => tutorialSystem.skip(dontShowAgain)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#8b949e',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                Skip
              </button>

              {/* Next button */}
              <button
                className="btn-accent"
                onClick={() => tutorialSystem.next()}
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                {progress.current >= progress.total ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
