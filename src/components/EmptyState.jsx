import Icon from './Icon.jsx'

export default function EmptyState({ icone = 'search', titulo, children }) {
  return (
    <div className="vazio">
      <Icon nome={icone} tamanho={28} />
      <strong>{titulo}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}
