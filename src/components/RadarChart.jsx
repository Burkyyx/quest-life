import { STAT_TYPES } from '../store/useStore'

export default function RadarChart({ stats, size = 220 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const n = STAT_TYPES.length

  // Max stat for scaling (at least 5 for visual range)
  const maxStat = Math.max(5, ...Object.values(stats))

  function getPoint(index, value) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const dist = (value / maxStat) * r
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  // Background rings
  const rings = [0.25, 0.5, 0.75, 1]

  // Stat points
  const points = STAT_TYPES.map((stat, i) => getPoint(i, stats[stat.id] || 1))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background rings */}
      {rings.map((ring, i) => {
        const ringPoints = STAT_TYPES.map((_, j) => getPoint(j, maxStat * ring))
        const d = ringPoints.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
        return <path key={i} d={d} fill="none" stroke="#1d1d1f" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {STAT_TYPES.map((_, i) => {
        const p = getPoint(i, maxStat)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1d1d1f" strokeWidth="1" />
      })}

      {/* Data polygon */}
      <path d={pathD} fill="rgba(245, 245, 247, 0.08)" stroke="#f5f5f7" strokeWidth="1.5" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={STAT_TYPES[i].color} />
      ))}

      {/* Labels */}
      {STAT_TYPES.map((stat, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const lx = cx + (r + 22) * Math.cos(angle)
        const ly = cy + (r + 22) * Math.sin(angle)
        return (
          <g key={stat.id}>
            <text
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="central"
              fill="#86868b" fontSize="9" fontWeight="500" fontFamily="-apple-system, system-ui, sans-serif"
            >
              {stat.name}
            </text>
            <text
              x={lx} y={ly + 12}
              textAnchor="middle" dominantBaseline="central"
              fill="#f5f5f7" fontSize="10" fontWeight="600" fontFamily="-apple-system, system-ui, sans-serif"
            >
              {Math.floor(stats[stat.id] || 1)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
