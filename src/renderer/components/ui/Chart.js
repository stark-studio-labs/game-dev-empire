/**
 * Chart — Simple SVG chart components (BarChart, LineChart, PieChart).
 * All dark-theme styled with hover interactions. No external dependencies.
 */


// ── BarChart ─────────────────────────────────────────────────────────────

function BarChart({ data = [], width = 400, height = 200, barColor = '#58a6ff', labelKey = 'label', valueKey = 'value', style }) {
  const [hovered, setHovered] = React.useState(null);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);
  const padding = { top: 20, right: 16, bottom: 32, left: 16 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = Math.max(2, Math.min(6, chartW / data.length * 0.15));
  const barW = Math.max(4, (chartW - barGap * (data.length + 1)) / data.length);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', ...style }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padding.top + chartH * (1 - pct);
        return (
          <line key={pct} x1={padding.left} y1={y} x2={width - padding.right} y2={y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d[valueKey] / maxVal) * chartH;
        const x = padding.left + barGap + i * (barW + barGap);
        const y = padding.top + chartH - barH;
        const isHovered = hovered === i;

        return (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          >
            <rect
              x={x} y={y} width={barW} height={barH}
              rx="2" ry="2"
              fill={barColor}
              opacity={isHovered ? 1 : 0.75}
              style={{ transition: 'opacity 0.15s, height 0.3s, y 0.3s' }}
            />

            {/* Label */}
            <text
              x={x + barW / 2} y={height - padding.bottom + 14}
              textAnchor="middle"
              fontSize="10" fill="#8b949e" fontFamily="Inter, system-ui, sans-serif"
            >
              {d[labelKey]}
            </text>

            {/* Hover value */}
            {isHovered && (
              <text
                x={x + barW / 2} y={y - 6}
                textAnchor="middle"
                fontSize="11" fill="#e6edf3" fontWeight="600" fontFamily="Inter, system-ui, sans-serif"
              >
                {typeof d[valueKey] === 'number' ? d[valueKey].toLocaleString() : d[valueKey]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}


// ── LineChart ─────────────────────────────────────────────────────────────

function LineChart({ data = [], width = 400, height = 200, lineColor = '#58a6ff', labelKey = 'label', valueKey = 'value', showDots = true, showFill = true, style }) {
  const [hovered, setHovered] = React.useState(null);

  if (data.length < 2) return null;

  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);
  const minVal = Math.min(...data.map(d => d[valueKey]), 0);
  const range = maxVal - minVal || 1;
  const padding = { top: 20, right: 16, bottom: 32, left: 16 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d[valueKey] - minVal) / range) * chartH,
    d,
    i,
  }));

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${padding.top + chartH} ${linePoints} ${points[points.length - 1].x},${padding.top + chartH}`;
  const gradId = `line-grad-${lineColor.replace('#', '')}`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', ...style }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padding.top + chartH * (1 - pct);
        return (
          <line key={pct} x1={padding.left} y1={y} x2={width - padding.right} y2={y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}

      {/* Fill area */}
      {showFill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill={`url(#${gradId})`} />
        </>
      )}

      {/* Line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots + labels */}
      {points.map((p, i) => (
        <g key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'default' }}
        >
          {/* Hit area */}
          <circle cx={p.x} cy={p.y} r="10" fill="transparent" />

          {/* Dot */}
          {showDots && (
            <circle
              cx={p.x} cy={p.y}
              r={hovered === i ? 4 : 2.5}
              fill={lineColor}
              style={{ transition: 'r 0.15s' }}
            />
          )}

          {/* Label */}
          {(i === 0 || i === data.length - 1 || data.length <= 12) && (
            <text
              x={p.x} y={height - padding.bottom + 14}
              textAnchor="middle"
              fontSize="10" fill="#8b949e" fontFamily="Inter, system-ui, sans-serif"
            >
              {p.d[labelKey]}
            </text>
          )}

          {/* Hover tooltip */}
          {hovered === i && (
            <>
              <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + chartH}
                stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
              <rect x={p.x - 30} y={p.y - 24} width="60" height="18" rx="4"
                fill="#1c2128" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text
                x={p.x} y={p.y - 12}
                textAnchor="middle"
                fontSize="11" fill="#e6edf3" fontWeight="600" fontFamily="Inter, system-ui, sans-serif"
              >
                {typeof p.d[valueKey] === 'number' ? p.d[valueKey].toLocaleString() : p.d[valueKey]}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}


// ── PieChart ─────────────────────────────────────────────────────────────

function PieChart({ data = [], size = 200, donut = true, labelKey = 'label', valueKey = 'value', style }) {
  const [hovered, setHovered] = React.useState(null);

  if (data.length === 0) return null;

  const defaultColors = ['#58a6ff', '#3fb950', '#da7cff', '#d29922', '#f85149', '#79c0ff', '#bc8cff', '#ff7b72', '#ffa657', '#56d364'];
  const total = data.reduce((sum, d) => sum + d[valueKey], 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size - 20) / 2;
  const innerR = donut ? outerR * 0.55 : 0;

  let startAngle = -Math.PI / 2;
  const segments = data.map((d, i) => {
    const pct = d[valueKey] / total;
    const angle = pct * Math.PI * 2;
    const endAngle = startAngle + angle;
    const midAngle = startAngle + angle / 2;

    // Arc path
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);

    let path;
    if (donut) {
      path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    } else {
      path = `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    // Label position
    const labelR = outerR + 14;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const seg = {
      path,
      color: d.color || defaultColors[i % defaultColors.length],
      label: d[labelKey],
      value: d[valueKey],
      pct,
      lx, ly,
      midAngle,
    };

    startAngle = endAngle;
    return seg;
  });

  return (
    <svg width="100%" viewBox={`0 0 ${size + 40} ${size + 20}`} style={{ display: 'block', ...style }}>
      <g transform={`translate(20, 10)`}>
        {segments.map((seg, i) => (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          >
            <path
              d={seg.path}
              fill={seg.color}
              opacity={hovered === null ? 0.85 : hovered === i ? 1 : 0.4}
              stroke="#161b22"
              strokeWidth="2"
              style={{ transition: 'opacity 0.2s' }}
            />
          </g>
        ))}

        {/* Center label for donut */}
        {donut && hovered !== null && (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle"
              fontSize="14" fontWeight="700" fill="#e6edf3" fontFamily="Inter, system-ui, sans-serif">
              {(segments[hovered].pct * 100).toFixed(1)}%
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle"
              fontSize="10" fill="#8b949e" fontFamily="Inter, system-ui, sans-serif">
              {segments[hovered].label}
            </text>
          </>
        )}

        {/* Outer labels (only if not too many segments) */}
        {data.length <= 8 && segments.map((seg, i) => (
          <text key={i}
            x={seg.lx} y={seg.ly}
            textAnchor={seg.midAngle > Math.PI / 2 && seg.midAngle < Math.PI * 1.5 ? 'end' : 'start'}
            fontSize="10" fill="#8b949e" fontFamily="Inter, system-ui, sans-serif"
            dominantBaseline="central"
          >
            {seg.label}
          </text>
        ))}
      </g>
    </svg>
  );
}
