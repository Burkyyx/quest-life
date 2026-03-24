// Pixel art character that evolves with level
export default function PixelAvatar({ level, size = 64 }) {
  const s = size / 16 // scale factor (16x16 base grid)
  const tier = level < 5 ? 0 : level < 15 ? 1 : level < 30 ? 2 : 3

  const colors = [
    { armor: '#48484a', trim: '#86868b', skin: '#d4a574', eye: '#f5f5f7', sword: '#86868b' },   // Apprenti
    { armor: '#3b82f6', trim: '#60a5fa', skin: '#d4a574', eye: '#f5f5f7', sword: '#94a3b8' },   // Disciple
    { armor: '#a855f7', trim: '#c084fc', skin: '#d4a574', eye: '#f5f5f7', sword: '#fbbf24' },   // Chevalier
    { armor: '#f59e0b', trim: '#fcd34d', skin: '#d4a574', eye: '#f5f5f7', sword: '#ef4444' },   // Légende
  ][tier]

  // 16x16 pixel art knight
  const pixels = [
    // Helmet (rows 0-3)
    [5,0,colors.trim],[6,0,colors.trim],[7,0,colors.trim],[8,0,colors.trim],[9,0,colors.trim],[10,0,colors.trim],
    [4,1,colors.armor],[5,1,colors.armor],[6,1,colors.armor],[7,1,colors.trim],[8,1,colors.trim],[9,1,colors.armor],[10,1,colors.armor],[11,1,colors.armor],
    [4,2,colors.armor],[5,2,colors.armor],[6,2,colors.eye],[7,2,colors.armor],[8,2,colors.armor],[9,2,colors.eye],[10,2,colors.armor],[11,2,colors.armor],
    [5,3,colors.armor],[6,3,colors.armor],[7,3,colors.skin],[8,3,colors.skin],[9,3,colors.armor],[10,3,colors.armor],
    // Body (rows 4-8)
    [4,4,colors.trim],[5,4,colors.armor],[6,4,colors.armor],[7,4,colors.armor],[8,4,colors.armor],[9,4,colors.armor],[10,4,colors.armor],[11,4,colors.trim],
    [3,5,colors.armor],[4,5,colors.armor],[5,5,colors.armor],[6,5,colors.trim],[7,5,colors.armor],[8,5,colors.armor],[9,5,colors.trim],[10,5,colors.armor],[11,5,colors.armor],[12,5,colors.armor],
    [3,6,colors.armor],[4,6,colors.armor],[5,6,colors.armor],[6,6,colors.armor],[7,6,colors.armor],[8,6,colors.armor],[9,6,colors.armor],[10,6,colors.armor],[11,6,colors.armor],[12,6,colors.armor],
    [4,7,colors.skin],[5,7,colors.armor],[6,7,colors.armor],[7,7,colors.trim],[8,7,colors.trim],[9,7,colors.armor],[10,7,colors.armor],[11,7,colors.skin],
    [4,8,colors.skin],[5,8,colors.armor],[6,8,colors.armor],[7,8,colors.armor],[8,8,colors.armor],[9,8,colors.armor],[10,8,colors.armor],[11,8,colors.skin],
    // Belt
    [5,9,colors.trim],[6,9,colors.trim],[7,9,colors.trim],[8,9,colors.trim],[9,9,colors.trim],[10,9,colors.trim],
    // Legs (rows 10-13)
    [5,10,colors.armor],[6,10,colors.armor],[7,10,'#1c1c1e'],[8,10,'#1c1c1e'],[9,10,colors.armor],[10,10,colors.armor],
    [5,11,colors.armor],[6,11,colors.armor],[7,11,'#1c1c1e'],[8,11,'#1c1c1e'],[9,11,colors.armor],[10,11,colors.armor],
    [5,12,colors.armor],[6,12,colors.armor],[9,12,colors.armor],[10,12,colors.armor],
    [4,13,colors.trim],[5,13,colors.trim],[6,13,colors.trim],[9,13,colors.trim],[10,13,colors.trim],[11,13,colors.trim],
    // Sword (right side)
    [12,3,colors.sword],[13,3,colors.sword],
    [12,4,colors.sword],
    [12,5,colors.sword],[13,5,'#fbbf24'],
    [12,6,colors.sword],
    [12,7,colors.sword],
    [12,8,colors.sword],
  ]

  // Shield for tier >= 2
  if (tier >= 2) {
    pixels.push(
      [2,5,colors.trim],[1,6,colors.trim],[2,6,colors.armor],[3,6,colors.trim],
      [1,7,colors.trim],[2,7,colors.trim],[3,7,colors.trim],
      [2,8,colors.trim],
    )
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${16 * s} ${16 * s}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map(([x, y, color], i) => (
        <rect key={i} x={x * s} y={y * s} width={s} height={s} fill={color} />
      ))}
    </svg>
  )
}

// Small pixel art decorations
export function PixelSword({ size = 24 }) {
  const s = size / 8
  const pixels = [
    [3,0,'#94a3b8'],[4,0,'#94a3b8'],
    [3,1,'#94a3b8'],[4,1,'#94a3b8'],
    [3,2,'#94a3b8'],[4,2,'#94a3b8'],
    [2,3,'#fbbf24'],[3,3,'#94a3b8'],[4,3,'#94a3b8'],[5,3,'#fbbf24'],
    [3,4,'#6b5b3d'],[4,4,'#6b5b3d'],
    [3,5,'#6b5b3d'],[4,5,'#6b5b3d'],
  ]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${8*s} ${8*s}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map(([x,y,c],i) => <rect key={i} x={x*s} y={y*s} width={s} height={s} fill={c} />)}
    </svg>
  )
}

export function PixelStar({ size = 16, color = '#fbbf24' }) {
  const s = size / 7
  const pixels = [[3,0],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[1,5],[2,5],[4,5],[5,5]]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${7*s} ${7*s}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map(([x,y],i) => <rect key={i} x={x*s} y={y*s} width={s} height={s} fill={color} />)}
    </svg>
  )
}

export function PixelHeart({ size = 16, color = '#ef4444' }) {
  const s = size / 7
  const pixels = [[1,0],[2,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[3,5]]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${7*s} ${7*s}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map(([x,y],i) => <rect key={i} x={x*s} y={y*s} width={s} height={s} fill={color} />)}
    </svg>
  )
}

export function PixelShield({ size = 20, color = '#60a5fa' }) {
  const s = size / 8
  const pixels = [[2,0],[3,0],[4,0],[5,0],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[2,4],[3,4],[4,4],[5,4],[2,5],[3,5],[4,5],[5,5],[3,6],[4,6]]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${8*s} ${8*s}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map(([x,y],i) => <rect key={i} x={x*s} y={y*s} width={s} height={s} fill={color} />)}
    </svg>
  )
}
