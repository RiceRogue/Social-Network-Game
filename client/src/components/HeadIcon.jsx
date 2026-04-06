/**
 * HeadIcon — inline SVG recreation of each character icon.
 * Matches the user's original designs: white bg, black border, monochromatic
 * head shape + body half-circle, all in the character's color.
 *
 * No external files needed — renders immediately.
 */

const icons = {
  blank: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="36" r="22" fill={color} />
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  belle: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Bell body */}
      <path d="M50 14 Q47 14 46 17 Q36 22 30 34 Q24 46 24 56 Q24 62 50 64 Q76 62 76 56 Q76 46 70 34 Q64 22 54 17 Q53 14 50 14Z" fill={color} />
      {/* Bell clapper bump on top */}
      <circle cx="50" cy="13" r="4" fill={color} />
      {/* Bell clapper dot at bottom */}
      <circle cx="50" cy="65" r="4" fill={color} />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  crux: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Plus cross — head */}
      <rect x="42" y="10" width="16" height="54" rx="3" fill={color} />
      <rect x="22" y="24" width="56" height="16" rx="3" fill={color} />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  cookie: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cookie circle with bite taken out (upper-left) */}
      <path
        d="M50 14 A22 22 0 1 1 28 36 A14 14 0 0 0 50 14Z"
        fill={color}
      />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  tri: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Inverted triangle — head */}
      <polygon points="18,14 82,14 50,58" fill={color} />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  bloom: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Flower — 6 overlapping petals around center */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const cx = 50 + Math.cos(rad) * 11
        const cy = 36 + Math.sin(rad) * 11
        return <circle key={i} cx={cx} cy={cy} r="12" fill={color} />
      })}
      <circle cx="50" cy="36" r="10" fill={color} />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  pop: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Lollipop — circle + stick to the left */}
      <line x1="24" y1="36" x2="38" y2="36" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <circle cx="56" cy="32" r="22" fill={color} />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  luna: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Crescent moon — large circle minus offset smaller circle */}
      <path
        d="M50 14 A22 22 0 1 1 50 58 A14 14 0 1 0 50 14Z"
        fill={color}
      />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  loop: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Ring / donut */}
      <circle cx="50" cy="36" r="22" fill={color} />
      <circle cx="50" cy="36" r="11" fill="white" />
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  sol: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Starburst — 18 points */}
      {Array.from({ length: 18 }, (_, i) => {
        const outer = 22
        const inner = 13
        const a1 = ((i * 2) * Math.PI) / 18
        const a2 = ((i * 2 + 1) * Math.PI) / 18
        const x1 = 50 + Math.cos(a1) * outer
        const y1 = 36 + Math.sin(a1) * outer
        const x2 = 50 + Math.cos(a2) * inner
        const y2 = 36 + Math.sin(a2) * inner
        return { x1, y1, x2, y2 }
      }).reduce((path, p, i, arr) => {
        const next = arr[(i + 1) % arr.length]
        return path + (i === 0 ? `M${p.x1},${p.y1}` : '') + ` L${p.x2},${p.y2} L${next?.x1 ?? p.x1},${next?.y1 ?? p.y1}`
      }, '') && (
        <polygon
          points={Array.from({ length: 36 }, (_, i) => {
            const r = i % 2 === 0 ? 22 : 13
            const a = (i * Math.PI) / 18
            return `${50 + Math.cos(a) * r},${36 + Math.sin(a) * r}`
          }).join(' ')}
          fill={color}
        />
      )}
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),

  hex: ({ color }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* X shape — two thick diagonal bars */}
      <g transform="translate(50,36)">
        <rect x="-24" y="-8" width="48" height="16" rx="4" fill={color} transform="rotate(45)" />
        <rect x="-24" y="-8" width="48" height="16" rx="4" fill={color} transform="rotate(-45)" />
      </g>
      {/* Body */}
      <path d="M18 80 Q18 58 50 58 Q82 58 82 80" fill={color} />
    </svg>
  ),
}

export default function HeadIcon({ headId, color, size = 56, style = {} }) {
  const Icon = icons[headId] ?? icons.blank
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#ffffff',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Icon color={color} />
    </div>
  )
}
