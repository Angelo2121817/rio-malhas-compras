import { useState } from 'react'

/**
 * Logo Rio Malhas Tecidos.
 * Tenta carregar a imagem; se falhar, exibe versão em SVG.
 * theme: "dark" = azul em fundo claro | "light" = branco em fundo azul
 */
export default function Logo({ className = '', variant = 'default', theme = 'dark' }) {
  const [imgErro, setImgErro] = useState(false)
  const useFallback = imgErro
  const cor = theme === 'light' ? '#ffffff' : '#002395'
  const isCompact = variant === 'compact'

  if (!useFallback) {
    return (
      <img
        src="/rio-malhas-tecidos-logo.png"
        alt="Rio Malhas Tecidos"
        className={className}
        onError={() => setImgErro(true)}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 280 80"
      className={className}
      aria-label="Rio Malhas Tecidos"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="40" r="18" stroke={cor} strokeWidth="2.5" fill={theme === 'light' ? 'transparent' : 'white'} />
      <circle cx="40" cy="40" r="8" fill={cor} />
      <line x1="40" y1="22" x2="40" y2="58" stroke={cor} strokeWidth="1.5" />
      <line x1="22" y1="40" x2="58" y2="40" stroke={cor} strokeWidth="1.5" />
      <line x1="28" y1="28" x2="52" y2="52" stroke={cor} strokeWidth="1" strokeDasharray="4 2" />
      <line x1="52" y1="28" x2="28" y2="52" stroke={cor} strokeWidth="1" strokeDasharray="4 2" />
      <text
        x="72"
        y="48"
        fill={cor}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={isCompact ? 18 : 24}
        fontWeight="700"
      >
        Rio Malhas Tecidos
      </text>
    </svg>
  )
}
