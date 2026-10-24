import Icon from '../components/Icon.jsx'
import RalyRosto from '../components/RalyRosto.jsx'
import SubNav from '../components/SubNav.jsx'
import { AGENTES, agentePorId } from '../data/agentes.js'
import { PERFIS, podeAcessar } from '../data/permissoes.js'

function BotaoAbrir({ agente, sessao, navegar }) {
  const liberado = podeAcessar(agente.modulo, sessao)
  return liberado
    ? <button type="button" className="btn btn--primario" onClick={() => navegar(...agente.abrir)}>Abrir {agente.nome} <Icon nome="forward" tamanho={16} /></button>
    : <button type="button" className="btn btn--secundario" onClick={() => navegar(...agente.abrir)}><Icon nome="lock" tamanho={16} /> Entrar para acessar</button>
}

function Visao({ navegar, mudarSub, sessao }) {
  return (
    <div className="grade grade--2">
      {AGENTES.map((a) => {
        const liberado = podeAcessar(a.modulo, sessao)
        return (
          <article key={a.id} className="card agente-card">
            <div className="card__topo">
              <h2><Icon nome={a.icone} tamanho={20} /> {a.nome}</h2>
              <span className={`selo-acesso ${liberado ? 'selo-acesso--ok' : ''}`}><Icon nome={liberado ? 'check' : 'lock'} tamanho={13} /> {liberado ? 'Liberado para você' : 'Acesso restrito'}</span>
            </div>
            <p>{a.resumo}</p>
            <p className="texto-suave"><strong>Quem usa:</strong> {a.publico}</p>
            <div className="agente-card__acoes">
              <button type="button" className="btn btn--secundario btn--pequeno" onClick={() => mudarSub(a.id)}>Como funciona</button>
              <BotaoAbrir agente={a} sessao={sessao} navegar={navegar} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function Detalhe({ agente, navegar, sessao }) {
  const quem = (agente.modulo === 'prazy' ? ['passageiro', 'agente', 'coordenador', 'admin'] : agente.modulo === 'ticketral' ? ['coordenador', 'admin'] : agente.modulo === 'raly' ? ['agente', 'coordenador', 'admin'] : ['passageiro', 'agente', 'coordenador', 'admin'])
  return (
    <div className="agente-detalhe">
      <section className="card">
        <div className="card__topo"><h2><Icon nome={agente.icone} tamanho={20} /> {agente.nome}</h2></div>
        <p>{agente.resumo}</p>
        <p className="texto-suave"><strong>Como se liga ao ecossistema:</strong> {agente.liga}</p>
        <p className="texto-suave"><strong>Perfis com acesso:</strong> {quem.map((p) => PERFIS[p].rotulo).join(' · ')}</p>
        <div><BotaoAbrir agente={agente} sessao={sessao} navegar={navegar} /></div>
      </section>
      <div className="grade grade--2">
        <section className="card"><h3>O que faz</h3><ul className="lista-check">{agente.faz.map((t) => <li key={t}><Icon nome="check" tamanho={16} /> {t}</li>)}</ul></section>
        <section className="card"><h3>O que não faz</h3><ul className="lista-check lista-check--nao">{agente.naoFaz.map((t) => <li key={t}><Icon nome="lock" tamanho={16} /> {t}</li>)}</ul></section>
      </div>
      <section className="card"><h3>Exemplos de uso por voz</h3><ul className="lista-check">{agente.comandos.map((t) => <li key={t}><Icon nome="mic" tamanho={16} /> {t}</li>)}</ul></section>
    </div>
  )
}

export default function Agentes({ sub, mudarSub, navegar, sessao }) {
  const atual = sub || 'visao'
  const agente = agentePorId(atual)
  const abas = [{ id: 'visao', rotulo: 'Ecossistema' }, ...AGENTES.map((a) => ({ id: a.id, rotulo: a.nome }))]
  return (
    <div className="pagina pagina--agentes">
      <div className="pagina__topo">
        <div className="agentes__titulo">
          <RalyRosto tamanho={56} titulo="Raly" />
          <div>
            <h1>Ecossistema de agentes</h1>
            <p className="texto-suave">Quatro agentes, cada um para o seu público. O Raly é a porta de entrada por voz; o acesso a cada um depende do seu perfil.</p>
          </div>
        </div>
      </div>
      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Agentes do ecossistema" />
      {agente ? <Detalhe agente={agente} navegar={navegar} sessao={sessao} /> : <Visao navegar={navegar} mudarSub={mudarSub} sessao={sessao} />}
    </div>
  )
}
