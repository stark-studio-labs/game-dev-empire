/**
 * StatCard -- Compact stat display with label, value, trend arrow, and optional sparkline.
 * Usage:
 *   <StatCard label="Cash" value="$1.2M" trend="up" change="+$200K" />
 *   <StatCard label="Fans" value="50K" sparkData={[10,20,30,40,50]} color="#58a6ff" />
 */

function StatCard({ label, value, trend, change, sparkData, color = '#58a6ff', style }) {
  const trendConfig = {
    up:      { arrow: '\u2191', color: '#3fb950' },
    down:    { arrow: '\u2193', color: '#f85149' },
    neutral: { arrow: '\u2192', color: '#8b949e' },
  };

  const tc = trend ? (trendConfig[trend] || trendConfig.neutral) : null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
      minWidth: '120px',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Label */}
      <div style={{
        fontSize: '10px',
        color: '#8b949e',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600,
        marginBottom: '4px',
      }}>
        {label}
      </div>

      {/* Value + trend row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: color,
          lineHeight: 1.2,
        }}>
          {value}
        </div>

        {tc && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '11px',
            fontWeight: 600,
            color: tc.color,
          }}>
            <span>{tc.arrow}</span>
            {change && <span>{change}</span>}
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && sparkData.length >= 2 && (
        <div style={{ marginTop: '8px' }}>
          <StatCardSparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}


/** Tiny SVG sparkline for StatCard */
function StatCardSparkline({ data, color, width = 100, height = 24 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableH = height - padding * 2;
  const usableW = width - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * usableW;
    const y = padding + usableH - ((v - min) / range) * usableH;
    return `${x},${y}`;
  }).join(' ');

  // Gradient fill area
  const firstPoint = points.split(' ')[0];
  const lastPoint = points.split(' ').pop();
  const areaPoints = `${padding},${height} ${points} ${padding + usableW},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {/* Fill area */}
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-grad-${color.replace('#', '')})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const lastParts = lastPoint.split(',');
        return (
          <circle
            cx={parseFloat(lastParts[0])}
            cy={parseFloat(lastParts[1])}
            r="2"
            fill={color}
          />
        );
      })()}
    </svg>
  );
}
