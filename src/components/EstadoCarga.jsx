import Icon from './Icon.jsx'

// Mostra "carregando" ou "erro simulado" no lugar do conteúdo.
export default function EstadoCarga({ estado, onTentar, children }) {
  if (estado === 'carregando') {
    return (
      <div className="carga" role="status" aria-live="polite">
        <span className="carga__giro" aria-hidden="true" />
        Carregando dados demonstrativos…
      </div>
    )
  }
  if (estado === 'erro') {
    return (
      <div className="aviso aviso--erro" role="alert">
        <Icon nome="alert" tamanho={18} />
        <div>
          <p><strong>Falha simulada de sincronização.</strong> Nenhum dado real foi perdido: esta demonstração usa apenas dados locais.</p>
          <button type="button" className="btn btn--secundario" onClick={onTentar}>
            <Icon nome="refresh" tamanho={16} /> Tentar novamente
          </button>
        </div>
      </div>
    )
  }
  return children
}
