import { formatarDataHora } from '../utils/datas.js'

export default function Timeline({ itens }) {
  if (!itens?.length) return <p className="texto-suave">Sem histórico.</p>
  return (
    <ol className="timeline">
      {itens.map((h, i) => (
        <li key={`${h.quando}-${i}`}>
          <span className="timeline__ponto" aria-hidden="true" />
          <div>
            <p className="timeline__meta">{formatarDataHora(h.quando)} · {h.autor}</p>
            <p>{h.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
