/**
 * ProgressBar -- Reusable animated progress bar with color variants.
 * Usage:
 *   <ProgressBar value={75} color="accent" size="md" label="Research" showPercent />
 */

function ProgressBar({ value = 0, color = 'accent', size = 'md', label, showPercent = false, style }) {
  const clamped = Math.max(0, Math.min(100, value));

  const colorMap = {
    accent:  { bar: 'linear-gradient(90deg, #58a6ff, #1f6feb)', glow: 'rgba(88,166,255,0.3)' },
    success: { bar: 'linear-gradient(90deg, #3fb950, #2ea043)', glow: 'rgba(63,185,80,0.3)' },
    warning: { bar: 'linear-gradient(90deg, #d29922, #bb8009)', glow: 'rgba(210,153,34,0.3)' },
    danger:  { bar: 'linear-gradient(90deg, #f85149, #da3633)', glow: 'rgba(248,81,73,0.3)' },
    purple:  { bar: 'linear-gradient(90deg, #da7cff, #a371f7)', glow: 'rgba(218,124,255,0.3)' },
  };

  const sizeMap = {
    sm: { height: '4px', fontSize: '10px', labelSize: '10px' },
    md: { height: '6px', fontSize: '11px', labelSize: '11px' },
    lg: { height: '10px', fontSize: '12px', labelSize: '12px' },
  };

  const cfg = colorMap[color] || colorMap.accent;
  const sz = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ ...style }}>
      {/* Label row */}
      {(label || showPercent) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}>
          {label && (
            <span style={{ fontSize: sz.labelSize, color: '#8b949e', fontWeight: 500 }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span style={{ fontSize: sz.fontSize, color: '#c9d1d9', fontWeight: 600 }}>
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div style={{
        height: sz.height,
        borderRadius: parseInt(sz.height) / 2 + 'px',
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Fill */}
        <div style={{
          height: '100%',
          width: `${clamped}%`,
          background: cfg.bar,
          borderRadius: 'inherit',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: clamped > 0 ? `0 0 8px ${cfg.glow}` : 'none',
        }} />
      </div>
    </div>
  );
}
