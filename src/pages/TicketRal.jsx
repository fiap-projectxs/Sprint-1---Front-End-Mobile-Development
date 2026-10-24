import { useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import EstadoCarga from '../components/EstadoCarga.jsx'
import Icon from '../components/Icon.jsx'
import Modal from '../components/Modal.jsx'
import SubNav from '../components/SubNav.jsx'
import Tabela from '../components/Tabela.jsx'
import Timeline from '../components/Timeline.jsx'
import { Selecao, Texto } from '../components/Campo.jsx'
import { PrioridadeBadge, StatusBadge } from '../components/StatusBadge.jsx'
import { CATEGORIAS_TICKET, STATUS_TICKET } from '../data/tickets.js'
import { EQUIPES, PRIORIDADES } from '../data/equipes.js'
import useCarga from '../utils/useCarga.js'
import { formatarDataHora } from '../utils/datas.js'

export default function TicketRal({ tickets, criarTicket, atualizarTicket, avisar, sub, mudarSub, focoTicket, limparFoco }) {
  const atual = sub || 'lista'
  const carga = useCarga()
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState({ status: '', categoria: '', prioridade: '', equipe: '' })
  const [abertoId, setAbertoId] = useState(null)
  const [novoAberto, setNovoAberto] = useState(false)
  const setF = (k) => (v) => setFiltros((f) => ({ ...f, [k]: v }))

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return tickets.filter((t) =>
      (!q || `${t.id} ${t.titulo} ${t.trecho}`.toLowerCase().includes(q)) &&
      (!filtros.status || t.status === filtros.status) &&
      (!filtros.categoria || t.categoria === filtros.categoria) &&
      (!filtros.prioridade || t.prioridade === filtros.prioridade) &&
      (!filtros.equipe || t.equipe === filtros.equipe))
  }, [tickets, busca, filtros])

  const aberto = tickets.find((t) => t.id === abertoId)

  // Comando de voz "ticket 101" abre o detalhe.
  const [focoVisto, setFocoVisto] = useState(null)
  if (focoTicket && focoTicket !== focoVisto) {
    setFocoVisto(focoTicket)
    setAbertoId(focoTicket)
  }
  const fecharDetalhe = () => { setAbertoId(null); setFocoVisto(null); limparFoco() }

  const pendencias = tickets.filter((t) => ['Pendência de informação', 'Registro incompleto'].includes(t.categoria) || t.status === 'Aguardando informação')
  const abas = [
    { id: 'lista', rotulo: 'Lista' },
    { id: 'quadro', rotulo: 'Quadro' },
    { id: 'pendencias', rotulo: 'Pendências', contagem: pendencias.filter((t) => t.status !== 'Resolvido').length },
  ]

  const colunas = [
    { chave: 'id', rotulo: 'Ticket' },
    { chave: 'titulo', rotulo: 'Título' },
    { chave: 'categoria', rotulo: 'Categoria' },
    { chave: 'prioridade', rotulo: 'Prioridade', render: (t) => <PrioridadeBadge prioridade={t.prioridade} /> },
    { chave: 'status', rotulo: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { chave: 'trecho', rotulo: 'Trecho' },
    { chave: 'equipe', rotulo: 'Equipe' },
    { chave: 'abertura', rotulo: 'Abertura', render: (t) => formatarDataHora(t.abertura) },
  ]

  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>TicketRal · tickets operacionais</h1>
          <p className="texto-suave">Acompanhe ocorrências, pendências e registros incompletos com categoria, prioridade, equipe e histórico.</p>
        </div>
        <div className="acoes">
          <button type="button" className="btn btn--secundario" onClick={carga.simularErro}>Simular falha</button>
          <button type="button" className="btn btn--primario" onClick={() => setNovoAberto(true)}><Icon nome="plus" tamanho={16} /> Novo ticket</button>
        </div>
      </div>
      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Subpáginas do TicketRal" />
      {atual === 'quadro' && <Quadro tickets={tickets} onAbrir={setAbertoId} onMover={(id, status) => { atualizarTicket(id, { status }); avisar(`Ticket ${id} movido para "${status}" (local).`) }} />}
      {atual === 'pendencias' && (
        <Card titulo="Pendências de informação e registros incompletos" subtitulo="Inclui os tickets abertos pelas automações do Raly">
          {pendencias.length === 0 ? <EmptyState icone="check" titulo="Nenhuma pendência" /> : <Tabela colunas={colunas} linhas={pendencias} onLinha={(t) => setAbertoId(t.id)} legenda="Pendências do TicketRal" />}
        </Card>
      )}
      {atual === 'lista' && <EstadoCarga estado={carga.estado} onTentar={carga.recarregar}>
        <Card>
          <div className="filtros">
            <Texto id="tk-busca" rotulo="Buscar" valor={busca} onChange={setBusca} placeholder="Número, título ou trecho" />
            <Selecao rotulo="Status" valor={filtros.status} onChange={setF('status')} opcoes={STATUS_TICKET} />
            <Selecao rotulo="Categoria" valor={filtros.categoria} onChange={setF('categoria')} opcoes={CATEGORIAS_TICKET} />
            <Selecao rotulo="Prioridade" valor={filtros.prioridade} onChange={setF('prioridade')} opcoes={PRIORIDADES} />
            <Selecao rotulo="Equipe" valor={filtros.equipe} onChange={setF('equipe')} opcoes={EQUIPES} />
          </div>
          <p className="texto-suave" aria-live="polite">{filtrados.length} de {tickets.length} tickets</p>
          {filtrados.length === 0 ? (
            <EmptyState icone="ticket" titulo="Nenhum ticket encontrado">Ajuste a busca ou os filtros.</EmptyState>
          ) : (
            <Tabela colunas={colunas} linhas={filtrados} onLinha={(t) => setAbertoId(t.id)} legenda="Tickets do TicketRal (dados fictícios)" />
          )}
        </Card>
      </EstadoCarga>}

      {aberto && (
        <DetalheTicket t={aberto} onFechar={fecharDetalhe} onAtualizar={(patch) => { atualizarTicket(aberto.id, patch); avisar('Ticket atualizado localmente. Nada foi enviado a sistemas reais.') }} />
      )}
      {novoAberto && (
        <NovoTicket
          onFechar={() => setNovoAberto(false)}
          onCriar={(dados) => {
            const id = criarTicket(dados)
            setNovoAberto(false)
            avisar(`Ticket fictício ${id} criado localmente.`)
          }}
        />
      )}
    </div>
  )
}

function DetalheTicket({ t, onFechar, onAtualizar }) {
  const [status, setStatus] = useState(t.status)
  const [nota, setNota] = useState('')
  return (
    <Modal titulo={`${t.id} · ${t.titulo}`} onFechar={onFechar} largura={720}>
      <dl className="detalhe">
        <div><dt>Categoria</dt><dd>{t.categoria}</dd></div>
        <div><dt>Prioridade</dt><dd><PrioridadeBadge prioridade={t.prioridade} /></dd></div>
        <div><dt>Status</dt><dd><StatusBadge status={t.status} /></dd></div>
        <div><dt>Trecho</dt><dd>{t.trecho}</dd></div>
        <div><dt>Equipe</dt><dd>{t.equipe}</dd></div>
        <div><dt>Abertura</dt><dd>{formatarDataHora(t.abertura)}</dd></div>
        <div><dt>Origem</dt><dd>{t.origem}</dd></div>
      </dl>

      <h4>Registrar atualização</h4>
      <Selecao id="tk-status" rotulo="Novo status" valor={status} onChange={setStatus} opcoes={STATUS_TICKET} todas={null} />
      <Texto id="tk-nota" rotulo="Atualização" valor={nota} onChange={setNota} linhas={2} placeholder="Descreva o que mudou (dado fictício)" />
      <div className="acoes">
        <button type="button" className="btn btn--primario" disabled={!nota.trim() && status === t.status} onClick={() => { onAtualizar({ status, nota: nota.trim() }); setNota('') }}>
          Registrar (local)
        </button>
      </div>

      <h4>Histórico</h4>
      <Timeline itens={t.historico} />
    </Modal>
  )
}

function NovoTicket({ onFechar, onCriar }) {
  const [f, setF] = useState({ titulo: '', categoria: 'Trânsito', prioridade: 'Média', equipe: 'Supervisão de Operações', trecho: 'DEMO-101 · km 40', origem: 'Criado manualmente (demo)' })
  const up = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal titulo="Novo ticket (fictício)" onFechar={onFechar}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onCriar({ ...f, nota: 'Ticket criado manualmente na demonstração.' }) }}>
        <Texto id="nt-titulo" rotulo="Título" valor={f.titulo} onChange={up('titulo')} obrigatorio />
        <Selecao id="nt-cat" rotulo="Categoria" valor={f.categoria} onChange={up('categoria')} opcoes={CATEGORIAS_TICKET} todas={null} />
        <Selecao id="nt-prio" rotulo="Prioridade" valor={f.prioridade} onChange={up('prioridade')} opcoes={PRIORIDADES} todas={null} />
        <Selecao id="nt-eq" rotulo="Equipe" valor={f.equipe} onChange={up('equipe')} opcoes={EQUIPES} todas={null} />
        <Texto id="nt-trecho" rotulo="Trecho" valor={f.trecho} onChange={up('trecho')} />
        <div className="acoes">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="btn btn--primario">Criar ticket</button>
        </div>
      </form>
    </Modal>
  )
}

function Quadro({ tickets, onAbrir, onMover }) {
  return (
    <div className="quadro">
      {STATUS_TICKET.map((st, idx) => {
        const col = tickets.filter((t) => t.status === st)
        return (
          <section key={st} className="quadro__coluna" aria-label={`Coluna ${st}`}>
            <h3><StatusBadge status={st} /> <span className="texto-suave">{col.length}</span></h3>
            {col.length === 0 && <p className="texto-suave">Vazio</p>}
            {col.map((t) => (
              <article key={t.id} className="quadro__card">
                <button type="button" className="link quadro__titulo" onClick={() => onAbrir(t.id)}>{t.id} · {t.titulo}</button>
                <p className="texto-suave">{t.trecho}</p>
                <p><PrioridadeBadge prioridade={t.prioridade} /></p>
                <div className="acoes">
                  <button type="button" className="btn btn--secundario btn--pequeno" disabled={idx === 0} onClick={() => onMover(t.id, STATUS_TICKET[idx - 1])} aria-label={`Mover ${t.id} para ${STATUS_TICKET[idx - 1]}`}>←</button>
                  <button type="button" className="btn btn--secundario btn--pequeno" disabled={idx === STATUS_TICKET.length - 1} onClick={() => onMover(t.id, STATUS_TICKET[idx + 1])} aria-label={`Mover ${t.id} para ${STATUS_TICKET[idx + 1]}`}>→</button>
                </div>
              </article>
            ))}
          </section>
        )
      })}
    </div>
  )
}
