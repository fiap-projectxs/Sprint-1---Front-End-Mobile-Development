import SourceTag from './SourceTag.jsx'

export default function CardTrecho({ trecho }) {
  const atencao = trecho.situacao.startsWith('Atenção')
  return (
    <article className="trecho">
      <div className="trecho__topo">
        <h3>{trecho.nome}</h3>
        <span className={`badge ${atencao ? 'badge--espera' : 'badge--ok'}`}>{atencao ? '⚠ Atenção' : '✓ Normal'}</span>
      </div>
      <p className="trecho__via">{trecho.rodovia} · km {trecho.kmInicio} a {trecho.kmFim}</p>
      <dl className="trecho__dados">
        <div><dt>Sentido</dt><dd>{trecho.sentido}</dd></div>
        <div><dt>Município</dt><dd>{trecho.municipio}</dd></div>
        <div><dt>Faixas</dt><dd>{trecho.faixas}</dd></div>
        <div><dt>Situação</dt><dd>{trecho.situacao}</dd></div>
      </dl>
      <p className="texto-suave">{trecho.observacao}</p>
      <div className="trecho__rodape">
        <SourceTag fonte="simulada" />
        <span className="texto-suave">Atualizado em {trecho.atualizado}</span>
      </div>
    </article>
  )
}
