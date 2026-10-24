// Mascote do Raly: robozinho das rodovias. Capacete azul-roxo com faixa de pista tracejada,
// viseira escura, olhos de farol ciano e antena com luz de sinalização.
// Classes rosto__luz / rosto__olho / rosto__boca são usadas pelas animações em index.css.
export default function RalyRosto({ tamanho = 64, estado = 'pronto', titulo }) {
  return (
    <svg
      className={`rosto rosto--${estado}`}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 64 64"
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : 'true'}
      focusable="false"
    >
      <defs>
        <linearGradient id="rr-corpo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b6f86" />
          <stop offset="1" stopColor="#0f8aa6" />
        </linearGradient>
        <linearGradient id="rr-capacete" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5fd0e6" />
          <stop offset="1" stopColor="#3fb3cc" />
        </linearGradient>
      </defs>
      <line x1="32" y1="11" x2="32" y2="6" stroke="#3fb3cc" strokeWidth="2.6" strokeLinecap="round" />
      <circle className="rosto__luz" cx="32" cy="4.6" r="3.2" fill="#ffb020" />
      <rect x="2.5" y="34" width="5.5" height="12" rx="2.75" fill="#5fd0e6" />
      <rect x="56" y="34" width="5.5" height="12" rx="2.75" fill="#5fd0e6" />
      <rect x="7" y="26" width="50" height="31" rx="14" fill="url(#rr-corpo)" stroke="#ffffff" strokeWidth="2" />
      <path d="M11 25.5C11 15 20 9.5 32 9.5S53 15 53 25.5z" fill="url(#rr-capacete)" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 11v13" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3.2 3" fill="none" />
      <rect x="8" y="23.5" width="48" height="5" rx="2.5" fill="#0b6f86" stroke="#ffffff" strokeWidth="1.6" />
      <rect x="13" y="32" width="38" height="17" rx="8.5" fill="#1b2e49" />
      <g className="rosto__olhos">
        <circle className="rosto__olho" cx="24" cy="40.5" r="4.6" fill="#7fe0f0" />
        <circle className="rosto__olho" cx="40" cy="40.5" r="4.6" fill="#7fe0f0" />
        <circle cx="25" cy="39.6" r="1.5" fill="#1b2e49" />
        <circle cx="41" cy="39.6" r="1.5" fill="#1b2e49" />
      </g>
      <path className="rosto__boca" d="M27 53.2q5 3 10 0" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
