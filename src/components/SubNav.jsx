// Abas de subpáginas de cada agente.
export default function SubNav({ itens, atual, onMudar, rotulo }) {
  return (
    <div className="subnav" role="tablist" aria-label={rotulo}>
      {itens.map((i) => (
        <button
          key={i.id}
          type="button"
          role="tab"
          aria-selected={atual === i.id}
          className={`subnav__item ${atual === i.id ? 'subnav__item--ativo' : ''}`}
          onClick={() => onMudar(i.id)}
        >
          {i.rotulo}
          {i.contagem > 0 && <span className="subnav__contagem">{i.contagem}</span>}
        </button>
      ))}
    </div>
  )
}
