import Icon from './Icon.jsx'

export default function Toasts({ itens, onFechar }) {
  return (
    <div className="toasts" aria-live="polite" role="status">
      {itens.map((t) => (
        <div key={t.id} className={`toast toast--${t.tom}`}>
          <Icon nome={t.tom === 'erro' ? 'alert' : 'check'} />
          <span>{t.texto}</span>
          <button type="button" className="btn btn--icone" onClick={() => onFechar(t.id)} aria-label="Dispensar aviso">
            <Icon nome="x" tamanho={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
