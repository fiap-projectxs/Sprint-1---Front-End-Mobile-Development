import Icon from './Icon.jsx'
import RalyLogo from './RalyLogo.jsx'

export default function Header({ onAbrirMenu, menuAberto, sessao, onEntrar, onSair, onInicio }) {
  return (
    <header className="header">
      <button
        type="button"
        className="header__menu"
        onClick={onAbrirMenu}
        aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuAberto}
        aria-controls="navegacao-principal"
      >
        <Icon nome={menuAberto ? 'x' : 'menu'} tamanho={22} />
      </button>
      <button type="button" className="header__marca" onClick={onInicio} aria-label="Raly, página de apresentação">
        <RalyLogo tamanho={38} />
        <div>
          <strong className="header__nome">Raly</strong>
          <span className="header__sub">Plataforma de voz · SmartDeskAI · TicketRal · Prazy</span>
        </div>
      </button>
      {sessao && (
        <span className="selo-sessao" title="Sessão simulada">
          <Icon nome="user" tamanho={14} /> {sessao.nome}
          <button type="button" className="selo-sessao__sair" onClick={onSair} aria-label="Sair da sessão"><Icon nome="logout" tamanho={14} /> Sair</button>
        </span>
      )}
      {!sessao && <button type="button" className="btn btn--primario btn--pequeno" onClick={onEntrar}>Entrar</button>}
      <span className="selo-demo" title="Todos os dados e fluxos desta plataforma são fictícios">
        <Icon nome="info" tamanho={14} /> Ambiente demonstrativo
      </span>
    </header>
  )
}
