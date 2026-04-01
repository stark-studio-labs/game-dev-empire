/**
 * Tooltip — Hover tooltip with auto-positioning and arrow pointer.
 * Usage: <Tooltip text="Helpful info">child element</Tooltip>
 */

function Tooltip({ text, children, position = 'auto', delay = 300 }) {
  const [visible, setVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, placement: 'top' });
  const [delayDone, setDelayDone] = React.useState(false);
  const wrapperRef = React.useRef(null);
  const timerRef = React.useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      setDelayDone(true);
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const placement = getPlacement(rect, position);
        const pos = calcPosition(rect, placement);
        setCoords({ ...pos, placement });
      }
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setDelayDone(false);
  };

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ display: 'inline-flex', position: 'relative' }}
    >
      {children}

      {visible && delayDone && (
        <div
          className="ui-tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: getTransform(coords.placement),
            zIndex: 9500,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: '#1c2128',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#e6edf3',
            lineHeight: 1.4,
            maxWidth: '240px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            whiteSpace: 'pre-wrap',
          }}>
            {text}
          </div>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            ...getArrowStyle(coords.placement),
          }} />
        </div>
      )}
    </div>
  );
}

// ── Positioning helpers ──────────────────────────────────────────────────

function getPlacement(rect, preferred) {
  if (preferred !== 'auto') return preferred;
  const margin = 60;
  if (rect.top > margin) return 'top';
  if (window.innerHeight - rect.bottom > margin) return 'bottom';
  if (rect.left > margin) return 'left';
  return 'right';
}

function calcPosition(rect, placement) {
  const gap = 8;
  switch (placement) {
    case 'top':
      return { top: rect.top - gap, left: rect.left + rect.width / 2 };
    case 'bottom':
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 };
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - gap };
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.right + gap };
    default:
      return { top: rect.top - gap, left: rect.left + rect.width / 2 };
  }
}

function getTransform(placement) {
  switch (placement) {
    case 'top':    return 'translate(-50%, -100%)';
    case 'bottom': return 'translate(-50%, 0)';
    case 'left':   return 'translate(-100%, -50%)';
    case 'right':  return 'translate(0, -50%)';
    default:       return 'translate(-50%, -100%)';
  }
}

function getArrowStyle(placement) {
  const size = 6;
  const shared = {
    width: 0,
    height: 0,
    borderStyle: 'solid',
  };

  switch (placement) {
    case 'top':
      return {
        ...shared,
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${size}px ${size}px 0 ${size}px`,
        borderColor: '#1c2128 transparent transparent transparent',
      };
    case 'bottom':
      return {
        ...shared,
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${size}px ${size}px ${size}px`,
        borderColor: 'transparent transparent #1c2128 transparent',
      };
    case 'left':
      return {
        ...shared,
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${size}px 0 ${size}px ${size}px`,
        borderColor: 'transparent transparent transparent #1c2128',
      };
    case 'right':
      return {
        ...shared,
        left: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${size}px ${size}px ${size}px 0`,
        borderColor: 'transparent #1c2128 transparent transparent',
      };
    default:
      return {};
  }
}
