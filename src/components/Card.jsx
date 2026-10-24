export default function Card({ titulo, subtitulo, acoes, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(titulo || acoes) && (
        <div className="card__topo">
          <div>
            {titulo && <h3 className="card__titulo">{titulo}</h3>}
            {subtitulo && <p className="card__sub">{subtitulo}</p>}
          </div>
          {acoes && <div className="card__acoes">{acoes}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
