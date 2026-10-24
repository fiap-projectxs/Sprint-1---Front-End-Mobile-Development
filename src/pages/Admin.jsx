import { useMemo, useState } from 'react'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import Modal from '../components/Modal.jsx'
import PersonalizarVoz from '../components/PersonalizarVoz.jsx'
import SubNav from '../components/SubNav.jsx'
import { Selecao, Texto } from '../components/Campo.jsx'
import { LISTA_PERFIS, MODULOS_ACESSO, PERFIS, podeAcessar } from '../data/permissoes.js'
import { CATEGORIAS_TICKET, STATUS_TICKET } from '../data/tickets.js'
import { forcaSenha } from '../utils/auth.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—')

function baixar(nome, texto, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿' + texto], { type: tipo }))
  const a = document.createElement('a')
  a.href = url; a.download = nome; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const csv = (linhas) => linhas.map((l) => l.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n')

const ACOES_ROTULO = {
  login: 'Entrou', login_falhou: 'Falha de login', logout: 'Saiu', cadastro: 'Cadastro',
  usuario_criado: 'Usuário criado', usuario_alterado: 'Usuário alterado', usuario_removido: 'Usuário removido',
  senha_redefinida: 'Senha redefinida', dados_reiniciados: 'Dados reiniciados', auditoria_limpa: 'Auditoria limpa',
}

export default function Admin(props) {
  const { sub, mudarSub, auth } = props
  const atual = sub || 'visao'
  const abas = [
    { id: 'visao', rotulo: 'Visão geral' },
    { id: 'usuarios', rotulo: 'Usuários', contagem: auth.usuarios.length },
    { id: 'permissoes', rotulo: 'Perfis e permissões' },
    { id: 'auditoria', rotulo: 'Auditoria' },
    { id: 'raly', rotulo: 'Raly' },
    { id: 'sistema', rotulo: 'Sistema' },
  ]
  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>Painel administrativo</h1>
          <p className="texto-suave">Usuários, perfis, auditoria e configurações do Raly. Acesso exclusivo do perfil administrador.</p>
        </div>
      </div>
      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Subpáginas da administração" />
      {atual === 'visao' && <Visao {...props} />}
      {atual === 'usuarios' && <Usuarios {...props} />}
      {atual === 'permissoes' && <Permissoes />}
      {atual === 'auditoria' && <Auditoria {...props} />}
      {atual === 'raly' && <ConfigRaly {...props} />}
      {atual === 'sistema' && <Sistema {...props} />}
    </div>
  )
}

function Visao({ auth, tickets, interacoes, ocorrencias }) {
  const ativos = auth.usuarios.filter((u) => u.ativo).length
  const porPerfil = LISTA_PERFIS.map((p) => auth.usuarios.filter((u) => u.perfil === p).length)
  const abertos = tickets.filter((t) => t.status !== 'Resolvido').length
  const porStatus = STATUS_TICKET.map((s) => tickets.filter((t) => t.status === s).length)
  const porCategoria = CATEGORIAS_TICKET.map((c) => tickets.filter((t) => t.categoria === c).length)
  const logins = auth.auditoria.filter((a) => a.acao === 'login').length
  const falhas = auth.auditoria.filter((a) => a.acao === 'login_falhou').length
  const opcoes = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
  const grafico = (labels, data) => ({ labels, datasets: [{ data, backgroundColor: '#6d4aff', borderRadius: 6 }] })
  return (
    <>
      <div className="grade grade--4">
        <div className="kpi"><span className="kpi__valor">{auth.usuarios.length}</span><span className="kpi__rotulo">Usuários ({ativos} ativos)</span></div>
        <div className="kpi"><span className="kpi__valor">{abertos}</span><span className="kpi__rotulo">Tickets em aberto</span></div>
        <div className="kpi"><span className="kpi__valor">{ocorrencias.length}</span><span className="kpi__rotulo">Ocorrências revisadas no Raly</span></div>
        <div className="kpi"><span className="kpi__valor">{interacoes.length}</span><span className="kpi__rotulo">Interações registradas</span></div>
      </div>
      <div className="grade grade--2">
        <Card titulo="Usuários por perfil">
          <div className="grafico" role="img" aria-label={`Usuários por perfil: ${LISTA_PERFIS.map((p, i) => `${PERFIS[p].rotulo} ${porPerfil[i]}`).join('; ')}`}>
            <Bar data={grafico(LISTA_PERFIS.map((p) => PERFIS[p].rotulo), porPerfil)} options={opcoes} />
          </div>
        </Card>
        <Card titulo="Tickets por status">
          <div className="grafico" role="img" aria-label={`Tickets por status: ${STATUS_TICKET.map((s, i) => `${s} ${porStatus[i]}`).join('; ')}`}>
            <Bar data={grafico(STATUS_TICKET, porStatus)} options={opcoes} />
          </div>
        </Card>
      </div>
      <div className="grade grade--2">
        <Card titulo="Tickets por categoria" acoes={<button type="button" className="btn btn--secundario" onClick={() => baixar('tickets.csv', csv([['ID', 'Título', 'Categoria', 'Prioridade', 'Status', 'Equipe', 'Trecho'], ...tickets.map((t) => [t.id, t.titulo, t.categoria, t.prioridade, t.status, t.equipe, t.trecho])]))}><Icon nome="forward" tamanho={14} /> Exportar CSV</button>}>
          <div className="grafico" role="img" aria-label={`Tickets por categoria: ${CATEGORIAS_TICKET.map((c, i) => `${c} ${porCategoria[i]}`).join('; ')}`}>
            <Bar data={grafico(CATEGORIAS_TICKET, porCategoria)} options={opcoes} />
          </div>
        </Card>
        <Card titulo="Segurança de acesso" subtitulo="Nesta sessão do navegador">
          <ul className="lista-simples">
            <li><Icon nome="check" tamanho={16} /> <span><strong>{logins}</strong> logins registrados.</span></li>
            <li><Icon nome={falhas ? 'alert' : 'check'} tamanho={16} /> <span><strong>{falhas}</strong> tentativas com falha. Após 5 erros seguidos o usuário fica 60 s bloqueado.</span></li>
            <li><Icon nome="shield" tamanho={16} /> <span>Senhas guardadas só como hash PBKDF2 com sal.</span></li>
          </ul>
          <h4>Últimos eventos</h4>
          {auth.auditoria.length === 0 ? <p className="texto-suave">Nenhum evento ainda.</p> : (
            <ul className="lista-simples">
              {auth.auditoria.slice(0, 5).map((a) => <li key={a.id}><Icon nome="clock" tamanho={14} /> <span>{fmt(a.quando)} · <strong>{ACOES_ROTULO[a.acao] || a.acao}</strong> · {a.quem}</span></li>)}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}

function FormUsuario({ onSalvar, onFechar }) {
  const [f, setF] = useState({ nome: '', usuario: '', senha: '', perfil: 'agente' })
  const [erro, setErro] = useState('')
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  const fs = forcaSenha(f.senha)
  async function enviar(e) {
    e.preventDefault()
    const r = await onSalvar(f)
    if (!r.ok) setErro(r.erro); else onFechar()
  }
  return (
    <Modal titulo="Novo usuário" onFechar={onFechar}>
      <form onSubmit={enviar} className="login__form" noValidate>
        <Texto rotulo="Nome" valor={f.nome} onChange={set('nome')} id="nu-nome" obrigatorio />
        <Texto rotulo="E-mail" valor={f.usuario} onChange={set('usuario')} tipo="email" id="nu-usuario" obrigatorio />
        <Selecao rotulo="Perfil" valor={f.perfil} onChange={set('perfil')} opcoes={LISTA_PERFIS} todas={null} id="nu-perfil" />
        <Texto rotulo="Senha inicial (mín. 8 caracteres)" valor={f.senha} onChange={set('senha')} tipo="password" id="nu-senha" obrigatorio />
        {f.senha && <p className="texto-suave">Força da senha: {fs.rotulo}</p>}
        {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}
        <div className="acoes">
          <button type="submit" className="btn btn--primario"><Icon nome="plus" tamanho={16} /> Criar usuário</button>
          <button type="button" className="btn btn--secundario" onClick={onFechar}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}

function Usuarios({ auth, avisar }) {
  const [busca, setBusca] = useState('')
  const [fPerfil, setFPerfil] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [novo, setNovo] = useState(false)
  const [senhaDe, setSenhaDe] = useState(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [remover, setRemover] = useState(null)
  const autor = auth.sessao.usuario

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return auth.usuarios.filter((u) =>
      (!q || `${u.nome} ${u.usuario}`.toLowerCase().includes(q)) &&
      (!fPerfil || u.perfil === fPerfil) &&
      (!fStatus || (fStatus === 'ativo') === u.ativo))
  }, [auth.usuarios, busca, fPerfil, fStatus])

  const resultado = (r, ok) => (r.ok ? avisar(ok) : avisar(r.erro, 'erro'))

  return (
    <>
      <Card
        titulo="Usuários"
        subtitulo="Crie contas, mude perfis, desative acessos e redefina senhas"
        acoes={<div className="acoes">
          <button type="button" className="btn btn--secundario" onClick={() => baixar('usuarios.csv', csv([['ID', 'Nome', 'Usuário', 'Perfil', 'Ativo', 'Criado em', 'Último acesso'], ...auth.usuarios.map((u) => [u.id, u.nome, u.usuario, PERFIS[u.perfil].rotulo, u.ativo ? 'sim' : 'não', u.criadoEm, u.ultimoAcesso])]))}>Exportar CSV</button>
          <button type="button" className="btn btn--primario" onClick={() => setNovo(true)}><Icon nome="plus" tamanho={16} /> Novo usuário</button>
        </div>}
      >
        <div className="filtros">
          <Texto rotulo="Buscar" valor={busca} onChange={setBusca} placeholder="Nome ou usuário" id="u-busca" />
          <Selecao rotulo="Perfil" valor={fPerfil} onChange={setFPerfil} opcoes={LISTA_PERFIS} id="u-perfil" />
          <Selecao rotulo="Status" valor={fStatus} onChange={setFStatus} opcoes={['ativo', 'desativado']} id="u-status" />
        </div>
        {lista.length === 0 ? <EmptyState titulo="Nenhum usuário encontrado">Ajuste a busca ou os filtros.</EmptyState> : (
          <div className="tabela-wrap">
            <table className="tabela">
              <thead><tr><th scope="col">Nome</th><th scope="col">Usuário</th><th scope="col">Perfil</th><th scope="col">Status</th><th scope="col">Último acesso</th><th scope="col">Ações</th></tr></thead>
              <tbody>
                {lista.map((u) => {
                  const eu = u.id === auth.sessao.id
                  return (
                    <tr key={u.id}>
                      <td data-rotulo="Nome"><strong>{u.nome}</strong>{eu && <span className="badge badge--ok"> você</span>}</td>
                      <td data-rotulo="Usuário"><code>{u.usuario}</code></td>
                      <td data-rotulo="Perfil">
                        <select aria-label={`Perfil de ${u.nome}`} value={u.perfil} disabled={eu} onChange={(e) => resultado(auth.atualizarUsuario(u.id, { perfil: e.target.value }, autor), `Perfil de ${u.nome} alterado.`)}>
                          {LISTA_PERFIS.map((p) => <option key={p} value={p}>{PERFIS[p].rotulo}</option>)}
                        </select>
                      </td>
                      <td data-rotulo="Status"><span className={`badge badge--${u.ativo ? 'ok' : 'espera'}`}><Icon nome={u.ativo ? 'check' : 'lock'} tamanho={13} /> {u.ativo ? 'Ativo' : 'Desativado'}</span></td>
                      <td data-rotulo="Último acesso">{fmt(u.ultimoAcesso)}</td>
                      <td data-rotulo="Ações">
                        <div className="acoes">
                          <button type="button" className="btn btn--secundario" disabled={eu} onClick={() => resultado(auth.atualizarUsuario(u.id, { ativo: !u.ativo }, autor), u.ativo ? `${u.nome} desativado.` : `${u.nome} reativado.`)}>{u.ativo ? 'Desativar' : 'Ativar'}</button>
                          <button type="button" className="btn btn--secundario" onClick={() => { setSenhaDe(u); setNovaSenha(''); setErroSenha('') }}>Senha</button>
                          <button type="button" className="btn btn--secundario" disabled={eu} onClick={() => setRemover(u)} aria-label={`Remover ${u.nome}`}>Remover</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {novo && <FormUsuario onFechar={() => setNovo(false)} onSalvar={async (d) => { const r = await auth.criarUsuario(d, autor); if (r.ok) avisar(`Usuário ${d.usuario} criado.`); return r }} />}

      {senhaDe && (
        <Modal titulo={`Redefinir senha de ${senhaDe.nome}`} onFechar={() => setSenhaDe(null)}>
          <form className="login__form" noValidate onSubmit={async (e) => {
            e.preventDefault()
            const r = await auth.redefinirSenha(senhaDe.id, novaSenha, autor)
            if (!r.ok) setErroSenha(r.erro); else { avisar(`Senha de ${senhaDe.nome} redefinida.`); setSenhaDe(null) }
          }}>
            <Texto rotulo="Nova senha (mín. 8 caracteres)" valor={novaSenha} onChange={setNovaSenha} tipo="password" id="rs-senha" obrigatorio />
            {erroSenha && <p className="aviso aviso--erro" role="alert">{erroSenha}</p>}
            <div className="acoes">
              <button type="submit" className="btn btn--primario">Redefinir</button>
              <button type="button" className="btn btn--secundario" onClick={() => setSenhaDe(null)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {remover && (
        <Modal titulo="Remover usuário" onFechar={() => setRemover(null)}>
          <p>Remover <strong>{remover.nome}</strong> ({remover.usuario}) desta demonstração? A conta deixa de existir neste navegador. Para só bloquear o acesso, use “Desativar”.</p>
          <div className="acoes">
            <button type="button" className="btn btn--primario" onClick={() => { resultado(auth.removerUsuario(remover.id, autor), `${remover.nome} removido.`); setRemover(null) }}>Sim, remover</button>
            <button type="button" className="btn btn--secundario" onClick={() => setRemover(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Permissoes() {
  return (
    <Card titulo="Perfis e permissões" subtitulo="O que cada perfil pode abrir. As regras valem para a navegação e para os comandos de voz do Raly">
      <div className="tabela-wrap">
        <table className="tabela tabela--matriz">
          <thead>
            <tr><th scope="col">Área</th><th scope="col">Visitante</th>{LISTA_PERFIS.map((p) => <th key={p} scope="col">{PERFIS[p].rotulo}</th>)}</tr>
          </thead>
          <tbody>
            {MODULOS_ACESSO.filter((m) => m.id !== 'entrar').map((m) => (
              <tr key={m.id}>
                <th scope="row" className="tabela__rotulo">{m.rotulo}</th>
                <td>{m.quem === null ? <Icon nome="check" tamanho={16} titulo="Permitido" /> : <Icon nome="x" tamanho={16} titulo="Bloqueado" />}</td>
                {LISTA_PERFIS.map((p) => <td key={p}>{podeAcessar(m.id, { perfil: p }) ? <Icon nome="check" tamanho={16} titulo="Permitido" /> : <Icon nome="x" tamanho={16} titulo="Bloqueado" />}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="lista-simples">
        {LISTA_PERFIS.map((p) => <li key={p}><Icon nome="users" tamanho={16} /> <span><strong>{PERFIS[p].rotulo}:</strong> {PERFIS[p].descricao}</span></li>)}
      </ul>
    </Card>
  )
}

function Auditoria({ auth, avisar }) {
  const [filtro, setFiltro] = useState('')
  const lista = auth.auditoria.filter((a) => !filtro || a.acao === filtro)
  return (
    <Card
      titulo="Auditoria"
      subtitulo="Quem entrou, quem mudou o quê e quando"
      acoes={<div className="acoes">
        <button type="button" className="btn btn--secundario" disabled={!auth.auditoria.length} onClick={() => baixar('auditoria.csv', csv([['Quando', 'Quem', 'Ação', 'Detalhe'], ...auth.auditoria.map((a) => [a.quando, a.quem, ACOES_ROTULO[a.acao] || a.acao, a.detalhe])]))}>Exportar CSV</button>
        <button type="button" className="btn btn--secundario" disabled={!auth.auditoria.length} onClick={() => { auth.limparAuditoria(); avisar('Registro de auditoria limpo.') }}>Limpar</button>
      </div>}
    >
      <Selecao rotulo="Tipo de evento" valor={filtro} onChange={setFiltro} opcoes={Object.keys(ACOES_ROTULO)} id="a-filtro" />
      {lista.length === 0 ? <EmptyState icone="list" titulo="Nenhum evento">Entradas e mudanças aparecem aqui.</EmptyState> : (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead><tr><th scope="col">Quando</th><th scope="col">Quem</th><th scope="col">Ação</th><th scope="col">Detalhe</th></tr></thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}><td data-rotulo="Quando">{fmt(a.quando)}</td><td data-rotulo="Quem"><code>{a.quem}</code></td><td data-rotulo="Ação">{ACOES_ROTULO[a.acao] || a.acao}</td><td data-rotulo="Detalhe">{a.detalhe || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function ConfigRaly({ automacoes, onAlternarAutomacao, voz, auth }) {
  return (
    <div className="grade grade--2">
      <Card titulo="Automações do Raly" subtitulo="Só criam registros locais. Nada é enviado a equipes ou ao CCO">
        <ul className="lista-simples">
          {automacoes.map((a) => (
            <li key={a.id}>
              <label className="marcar">
                <input type="checkbox" checked={a.ligada} onChange={() => { onAlternarAutomacao(a.id); auth.registrar('usuario_alterado', `Automação ${a.id} ${a.ligada ? 'desligada' : 'ligada'}`, auth.sessao.usuario) }} />
                <span><strong>{a.titulo}</strong><br /><span className="texto-suave">{a.descricao}</span></span>
              </label>
            </li>
          ))}
        </ul>
      </Card>
      <Card titulo="Voz do Raly" subtitulo="Feminina ou masculina, velocidade e tom">
        <PersonalizarVoz voz={voz} />
      </Card>
    </div>
  )
}

function Sistema({ auth, resetarDemo, avisar }) {
  const [confirmar, setConfirmar] = useState(false)
  const armazenados = (() => { try { return Object.keys(window.localStorage).filter((k) => k.startsWith('raly:')).length } catch { return 0 } })()
  return (
    <div className="grade grade--2">
      <Card titulo="Dados de demonstração" subtitulo="Tickets, interações, ocorrências e conversa do Raly">
        <p>Volta tudo ao estado inicial da apresentação. Contas de usuário e auditoria não são afetadas.</p>
        <button type="button" className="btn btn--secundario" onClick={() => setConfirmar(true)}><Icon nome="refresh" tamanho={16} /> Reiniciar dados</button>
      </Card>
      <Card titulo="Armazenamento neste navegador">
        <ul className="lista-simples">
          <li><Icon nome="database" tamanho={16} /> <span><strong>{armazenados}</strong> chaves do Raly em uso (usuários, auditoria, voz).</span></li>
          <li><Icon nome="users" tamanho={16} /> <span><strong>{auth.usuarios.length}</strong> contas · <strong>{auth.auditoria.length}</strong> eventos de auditoria.</span></li>
          <li><Icon nome="info" tamanho={16} /> <span>Os dados ficam só neste navegador. Não há servidor nem sincronização.</span></li>
        </ul>
      </Card>
      {confirmar && (
        <Modal titulo="Reiniciar dados de demonstração" onFechar={() => setConfirmar(false)}>
          <p>Tickets, interações, ocorrências e a conversa do Raly voltam ao início. Confirma?</p>
          <div className="acoes">
            <button type="button" className="btn btn--primario" onClick={() => { resetarDemo(); setConfirmar(false); avisar('Dados de demonstração reiniciados.') }}>Sim, reiniciar</button>
            <button type="button" className="btn btn--secundario" onClick={() => setConfirmar(false)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
