import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import Entrar from './Entrar.jsx'
import { MODULOS_ACESSO, PERFIS } from '../data/permissoes.js'

// Tela mostrada quando a página exige login ou um perfil que a pessoa não tem.
export default function Acesso({ pagina, sub, auth, navegar }) {
  const m = MODULOS_ACESSO.find((x) => x.id === pagina)
  const exigidos = Array.isArray(m?.quem) ? m.quem.map((p) => PERFIS[p].rotulo).join(', ') : 'qualquer pessoa autenticada'
  if (!auth.sessao) {
    return <Entrar auth={auth} navegar={navegar} destino={{ pagina, sub }} motivo={`${m?.rotulo || 'Esta página'} exige login. Perfis com acesso: ${exigidos}.`} />
  }
  return (
    <div className="pagina">
      <Card titulo={`${m?.rotulo || 'Página'} · acesso negado`}>
        <EmptyState icone="lock" titulo="Seu perfil não tem acesso a esta área">
          Você entrou como {PERFIS[auth.sessao.perfil].rotulo}. Perfis com acesso: {exigidos}.
        </EmptyState>
        <div className="acoes">
          <button type="button" className="btn btn--primario" onClick={() => navegar('inicio')}><Icon nome="home" tamanho={16} /> Voltar à Visão geral</button>
          <button type="button" className="btn btn--secundario" onClick={() => { auth.sair(); navegar('entrar') }}><Icon nome="logout" tamanho={16} /> Entrar com outra conta</button>
        </div>
      </Card>
    </div>
  )
}
