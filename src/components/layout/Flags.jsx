/**
 * Inline SVG-flagg for språkbryteren. Windows og noen Linux-distros mangler
 * fonter for de geografiske emoji-flaggene (🇳🇴, 🇬🇧), så vi rendrer dem som
 * små stilfulle SVG-er i stedet — dette garanterer at flagget vises i ALLE
 * nettlesere og operativsystemer.
 */

export function FlagNO({ size = 16, title }) {
  return (
    <svg
      width={Math.round(size * 1.45)}
      height={size}
      viewBox="0 0 22 16"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      style={{ flexShrink: 0, borderRadius: 2 }}
    >
      {title && <title>{title}</title>}
      <rect width="22" height="16" fill="#BA0C2F" />
      <rect x="6" width="2" height="16" fill="white" />
      <rect y="7" width="22" height="2" fill="white" />
      <rect x="6.5" width="1" height="16" fill="#00205B" />
      <rect y="7.5" width="22" height="1" fill="#00205B" />
    </svg>
  )
}

export function FlagGB({ size = 16, title }) {
  return (
    <svg
      width={Math.round(size * 1.45)}
      height={size}
      viewBox="0 0 60 30"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      style={{ flexShrink: 0, borderRadius: 2 }}
    >
      {title && <title>{title}</title>}
      <rect width="60" height="30" fill="#012169" />
      {/* Hvite diagonaler */}
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="white" strokeWidth="6" />
      {/* Røde diagonaler — sentrert */}
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" clipPath="inset(0)" />
      {/* Hvit pluss (horisontal + vertikal hvit) */}
      <path d="M30 0v30 M0 15h60" stroke="white" strokeWidth="10" />
      {/* Rød pluss (horisontal + vertikal rød) */}
      <path d="M30 0v30 M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}
