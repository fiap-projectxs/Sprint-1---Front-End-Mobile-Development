import Icon from './Icon.jsx'

const ITENS_NAV = [
  { id: 'apresentacao', rotulo: 'Apresentação', icone: 'forward', grupo: 'Plataforma' },
  { id: 'inicio', rotulo: 'Visão geral', icone: 'home', grupo: 'Plataforma' },
  { id: 'sobre', rotulo: 'Sobre o Raly', icone: 'help', grupo: 'Plataforma' },
  { id: 'agentes', rotulo: 'Ecossistema', icone: 'compass', grupo: 'Plataforma' },
  { id: 'raly', rotulo: 'Raly', icone: 'mic', grupo: 'Módulos' },
  { id: 'smartdesk', rotulo: 'SmartDeskAI', icone: 'inbox', grupo: 'Módulos' },
  { id: 'ticketral', rotulo: 'TicketRal', icone: 'ticket', grupo: 'Módulos' },
  { id: 'prazy', rotulo: 'Prazy', icone: 'compass', grupo: 'Módulos' },
  { id: 'conta', rotulo: 'Minha conta', icone: 'user', grupo: 'Conta' },
  { id: 'admin', rotulo: 'Administração', icone: 'shield', grupo: 'Conta' },
  { id: 'consultas', rotulo: 'Consultas', icone: 'search', grupo: 'Apoio' },
  { id: 'interacoes', rotulo: 'Interações', icone: 'list', grupo: 'Apoio' },
]

export default function Nav({ paginaAtual, onNavegar, aberto, contagens, restritos = [] }) {
  const grupos = [...new Set(ITENS_NAV.map((i) => i.grupo))]
  return (
    <nav id="navegacao-principal" className={`nav ${aberto ? 'nav--aberto' : ''}`} aria-label="Navegação principal">
      {grupos.map((g) => (
        <div key={g} className="nav__grupo">
          <p className="nav__titulo">{g}</p>
          <ul>
            {ITENS_NAV.filter((i) => i.grupo === g).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav__item ${paginaAtual === item.id ? 'nav__item--ativo' : ''}`}
                  aria-current={paginaAtual === item.id ? 'page' : undefined}
                  onClick={() => onNavegar(item.id)}
                >
                  <Icon nome={item.icone} />
                  <span>{item.rotulo}</span>
                  {restritos.includes(item.id) && <span className="nav__cadeado" title="Acesso restrito: exige login com perfil autorizado"><Icon nome="lock" tamanho={14} titulo="Acesso restrito" /></span>}
                  {contagens?.[item.id] > 0 && <span className="nav__contagem" aria-label={`${contagens[item.id]} pendentes`}>{contagens[item.id]}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
