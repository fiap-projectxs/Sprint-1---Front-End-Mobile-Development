// Barras de onda sonora (decorativas). Animam quando `ativa`.
export default function Onda({ barras = 24, ativa = true, altura = 44 }) {
  return (
    <span className={`onda ${ativa ? 'onda--ativa' : ''}`} style={{ height: altura }} aria-hidden="true">
      {Array.from({ length: barras }, (_, i) => (
        <i key={i} style={{ animationDelay: `${(i * 97) % 900}ms`, '--base': `${28 + ((i * 37) % 60)}%` }} />
      ))}
    </span>
  )
}
