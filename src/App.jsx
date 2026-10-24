import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Nav from './components/Nav.jsx'
import RalyDock from './components/RalyDock.jsx'
import Toasts from './components/Toast.jsx'
import Inicio from './pages/Inicio.jsx'
import Raly from './pages/Raly.jsx'
import SmartDeskAI from './pages/SmartDeskAI.jsx'
import TicketRal from './pages/TicketRal.jsx'
import SobreRaly from './pages/SobreRaly.jsx'
import Apresentacao from './pages/Apresentacao.jsx'
import Fundo3D from './components/Fundo3D.jsx'
import Agentes from './pages/Agentes.jsx'
import Entrar from './pages/Entrar.jsx'
import Conta from './pages/Conta.jsx'
import Admin from './pages/Admin.jsx'
import useAuth from './utils/useAuth.js'
import { MODULOS_ACESSO, podeAcessar, podeTickets } from './data/permissoes.js'
import Prazy from './pages/Prazy.jsx'
import Consultas from './pages/Consultas.jsx'
import Interacoes from './pages/Interacoes.jsx'
import { INTERACOES_INICIAIS } from './demo/interacoes.js'
import { TICKETS_INICIAIS } from './demo/tickets.js'
import { AUTOMACOES_PADRAO } from './data/automacoes.js'
import { interpretar } from './utils/comandos.js'
import { ORDEM_CAMPOS, ROTULOS, resumirCampos } from './utils/extrair.js'
import { estadoInicialRaly, responderRaly } from './utils/raly.js'
import { responderPrazy } from './utils/prazy.js'
import { agoraISO, proximoId } from './utils/datas.js'
import useVoz from './utils/useVoz.js'
import { perguntarLLM } from './utils/local.js'
import { consultarVia } from './utils/vias.js'

const RALY_INICIAL = { mensagens: [], estado: estadoInicialRaly(), revisao: 'pendente', ticketId: null }

function categoriaSugerida(campos) {
  const tipo = campos.tipo.estado === 'nao_informado' ? '' : campos.tipo.valor
  if (/vegeta|pavimento/i.test(tipo)) return 'Manutenção'
  if (/ve[ií]culo|acidente|animal|objeto|fuma/i.test(tipo)) return 'Trânsito'
  return 'Registro incompleto'
}

const ESSENCIAIS = ['tipo', 'rodovia', 'km', 'sentido', 'municipio']

export default function App() {
  // Navegação simples por estado (sem React Router): página + subpágina.
  const [nav, setNav] = useState({ pagina: 'apresentacao', sub: null })
  const [menuAberto, setMenuAberto] = useState(false)
  const [dockAberto, setDockAberto] = useState(false)
  const [tickets, setTickets] = useState(TICKETS_INICIAIS)
  const [interacoes, setInteracoes] = useState(INTERACOES_INICIAIS)
  const [raly, setRaly] = useState(RALY_INICIAL)
  const [ocorrencias, setOcorrencias] = useState([])
  const [automacoes, setAutomacoes] = useState(AUTOMACOES_PADRAO)
  const [logAutomacao, setLogAutomacao] = useState([])
  const [prazyMsgs, setPrazyMsgs] = useState([])
  const [focoTicket, setFocoTicket] = useState(null)
  const [pendente, setPendente] = useState(null)
  const [falaAtiva, setFalaAtiva] = useState(true)
  const [continuo, setContinuo] = useState(false)
  const [ultimaFala, setUltimaFala] = useState('')
  const [ultimaResposta, setUltimaResposta] = useState('')
  const [toasts, setToasts] = useState([])
  // Sessão do coordenador de trânsito (simulada no navegador). Sem sessão, o TicketRal fica bloqueado.
  const auth = useAuth()
  // `sessao` = só quem pode usar o TicketRal (coordenador/admin); o resto do app usa isso como "coordenador autenticado".
  const sessao = podeTickets(auth.sessao) ? auth.sessao : null

  // Refs: callbacks de voz são criados uma vez e precisam ver o estado mais recente.
  const vivo = useRef({})
  const processarRef = useRef(null)
  const pularFala = useRef(false) // true enquanto o modelo local prepara a resposta que será falada
  useEffect(() => {
    vivo.current = { nav, tickets, raly, pendente, falaAtiva, automacoes, ocorrencias, continuo, sessao }
  })

  const voz = useVoz({
    continuo,
    aoOuvir: (texto, origem) => {
      // Em escuta contínua só reage ao que começa com "Raly".
      if (vivo.current.continuo && !/^(hey |ei |ola |oi )?raly\b/i.test(texto.normalize('NFD').replace(/[̀-ͯ]/g, ''))) return
      processarRef.current?.(texto, origem)
    },
  })

  function avisar(texto, tom = 'ok') {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, texto, tom }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }

  function navegar(pagina, sub = null) {
    setNav({ pagina, sub })
    setMenuAberto(false)
    window.scrollTo({ top: 0 })
  }
  const mudarSub = (sub) => setNav((n) => ({ ...n, sub }))

  function registrarInteracao(texto, resposta, origem) {
    setInteracoes((l) => [{ id: `I-${String(l.length + 1).padStart(3, '0')}`, origem, texto, data: agoraISO(), resposta }, ...l])
  }

  // ---------- Acesso do coordenador ----------
  function sairCoordenador() {
    auth.sair()
    setPendente(null)
    setFocoTicket(null)
    avisar('Sessão encerrada. As áreas restritas voltaram a ficar bloqueadas.')
  }

  // ---------- Tickets ----------
  function criarTicket(dados) {
    const id = proximoId('TK-', vivo.current.tickets)
    const quando = agoraISO()
    const novo = {
      ...dados, id, abertura: quando, status: 'Aberto',
      historico: [{ quando, autor: dados.autor || 'Operador Demo', texto: `${dados.nota || 'Ticket de demonstração criado.'} Nada foi enviado a sistemas reais.` }],
    }
    vivo.current.tickets = [novo, ...vivo.current.tickets]
    setTickets((l) => [novo, ...l])
    return id
  }

  function atualizarTicket(id, { status, nota }) {
    setTickets((l) => l.map((t) => {
      if (t.id !== id) return t
      const hist = [...t.historico]
      const quando = agoraISO()
      if (status && status !== t.status) hist.push({ quando, autor: 'Operador Demo', texto: `Status alterado de "${t.status}" para "${status}" (local, sem envio a sistemas reais).` })
      if (nota) hist.push({ quando, autor: 'Operador Demo', texto: nota })
      return { ...t, status: status || t.status, historico: hist }
    }))
  }

  // ---------- Raly ----------
  function enviarRelato(texto, origem = 'texto') {
    const r = vivo.current.raly
    const resposta = responderRaly(texto, r.estado)
    const q = agoraISO()
    setRaly((x) => ({
      ...x,
      estado: resposta.estado,
      revisao: resposta.consulta ? x.revisao : 'pendente',
      mensagens: [
        ...x.mensagens,
        { id: `u-${q}`, autor: 'usuario', texto, quando: q, consulta: !!resposta.consulta, origem },
        { id: `r-${q}`, autor: 'raly', texto: resposta.resposta, quando: q, fonte: resposta.fonte },
      ],
    }))
    // As regras não acharam ocorrência: o modelo local (Ollama), se estiver ligado, responde a conversa.
    if (resposta.semOcorrencia && voz.local?.llm?.ok) {
      pularFala.current = true
      const hist = r.mensagens.slice(-6).map((m) => ({ papel: m.autor === 'usuario' ? 'user' : 'assistant', texto: m.texto }))
      perguntarLLM(texto, hist).then(({ texto: t }) => {
        setRaly((x) => ({ ...x, estado: { ...x.estado, pergunta: null }, mensagens: x.mensagens.map((m) => (m.id === `r-${q}` ? { ...m, texto: t, fonte: 'modelo' } : m)) }))
        setUltimaResposta(t)
        if (vivo.current.falaAtiva) voz.falar(t)
      }).catch(() => { if (vivo.current.falaAtiva) voz.falar(resposta.resposta) })
    }
    return resposta.resposta
  }

  function criarTicketRaly(dados) {
    const id = criarTicket({ ...dados, origem: 'Raly (relato revisado)', autor: 'Raly (simulado)', nota: dados.nota || 'Ticket criado a partir de relato revisado por humano.' })
    setRaly((x) => ({ ...x, ticketId: id }))
    setOcorrencias((l) => l.map((o, i) => (i === 0 ? { ...o, ticketId: id } : o)))
    avisar(`Ticket de demonstração ${id} criado. Nenhuma mudança foi enviada a sistemas reais.`)
    return id
  }

  function confirmarRevisao() {
    const { raly: r, automacoes: auts, sessao: sess } = vivo.current
    const campos = r.estado.campos
    const ativa = (id) => auts.find((a) => a.id === id)?.ligada
    const quando = agoraISO()
    const resumo = resumirCampos(campos) || 'ocorrência sem detalhes'
    const faltando = ESSENCIAIS.filter((k) => campos[k].estado === 'nao_informado').map((k) => ROTULOS[k])
    setRaly((x) => ({ ...x, revisao: 'revisada' }))
    const logs = []
    if (ativa('ocorrencia')) {
      setOcorrencias((l) => [{ id: `OC-RAL-${String(l.length + 1).padStart(3, '0')}`, quando, campos, resumo, faltando, ticketId: null, autoTicketId: null }, ...l])
      logs.push('Ocorrência guardada em Raly › Ocorrências.')
    }
    if (ativa('pendencias') && faltando.length > 0 && !sess) {
      logs.push(`Pendência (faltam: ${faltando.join(', ')}) não virou ticket: o TicketRal exige coordenador autenticado.`)
    } else if (ativa('pendencias') && faltando.length > 0) {
      const id = criarTicket({
        titulo: `Registro incompleto: ${campos.tipo.estado === 'nao_informado' ? 'ocorrência relatada' : campos.tipo.valor}`,
        categoria: 'Registro incompleto', prioridade: 'Média', equipe: 'Supervisão de Operações',
        trecho: [campos.rodovia.valor || 'rodovia não informada', campos.km.valor || 'km não informado'].join(' · '),
        origem: 'Automação (simulada)', autor: 'Automação (simulada)',
        nota: `Campos não informados: ${faltando.join(', ')}. Prioridade padrão da automação; ajuste manual.`,
      })
      setOcorrencias((l) => l.map((o, i) => (i === 0 ? { ...o, autoTicketId: id } : o)))
      logs.push(`Ticket de pendência ${id} aberto (faltam: ${faltando.join(', ')}).`)
    }
    if (logs.length) setLogAutomacao((l) => [...logs.map((texto) => ({ quando, texto })), ...l])
    avisar('Revisão confirmada (simulação). Nenhuma equipe ou sistema foi acionado.')
    return logs
  }

  function editarCampos(novos) {
    setRaly((x) => ({ ...x, estado: { ...x.estado, campos: novos }, revisao: 'pendente' }))
    avisar('Informações atualizadas. A revisão precisa ser confirmada de novo.')
  }

  function reiniciarRaly() { setRaly(RALY_INICIAL); setPendente(null) }

  function perguntarPrazy(pergunta) {
    const r = responderPrazy(pergunta, null)
    const q = agoraISO()
    setPrazyMsgs((m) => [...m, { id: `u-${q}`, autor: 'usuario', texto: pergunta, quando: q }, { id: `p-${q}`, autor: 'prazy', texto: r.texto, quando: q, fonte: r.fonte }])
    return r
  }

  // ---------- Voz e comandos ----------
  function responder(entrada, resposta, origem) {
    setUltimaFala(entrada)
    setUltimaResposta(resposta)
    setDockAberto(true)
    registrarInteracao(entrada, `${resposta} (resposta simulada)`, origem === 'voz' ? 'Voz (Raly)' : 'Texto (Raly)')
    const pular = pularFala.current
    pularFala.current = false
    if (vivo.current.falaAtiva && !pular) voz.falar(resposta)
  }

  function resumoSpoken(campos) {
    const inf = []
    const conf = []
    const falta = []
    for (const k of ORDEM_CAMPOS) {
      const c = campos[k]
      if (c.estado === 'informado') inf.push(`${ROTULOS[k]}: ${c.valor}`)
      else if (c.estado === 'confirmar') conf.push(`${ROTULOS[k]}: ${c.valor}`)
      else falta.push(ROTULOS[k])
    }
    return [
      inf.length ? `Informado: ${inf.join('; ')}.` : '',
      conf.length ? `Precisa confirmar: ${conf.join('; ')}.` : '',
      falta.length ? `Não informado: ${falta.join(', ')}.` : '',
    ].filter(Boolean).join(' ')
  }

  function processar(texto, origem = 'texto') {
    const { nav: n, tickets: tk, raly: r, pendente: pend, sessao: sess } = vivo.current
    const it = interpretar(texto, { pagina: n.pagina, pendente: !!pend })
    const temRelato = r.mensagens.some((m) => m.autor === 'usuario' && !m.consulta)
    const resp = (t) => responder(texto, t, origem)
    if (pend && it.tipo !== 'confirmar' && it.tipo !== 'cancelar') setPendente(null)

    const TICKETS_RESTRITOS = ['pedir_ticket', 'pedir_status', 'resumo_tickets', 'ver_ticket']
    const confirmaTicket = it.tipo === 'confirmar' && (pend?.tipo === 'ticket' || pend?.tipo === 'status')
    if (!sess && (TICKETS_RESTRITOS.includes(it.tipo) || confirmaTicket)) {
      setPendente(null)
      navegar('ticketral', 'lista')
      return resp('O TicketRal é restrito a coordenadores de trânsito autenticados. Entre pela tela do TicketRal. Código de acesso não pode ser dito por voz.')
    }

    switch (it.tipo) {
      case 'vazio': return
      case 'ajuda':
        navegar('raly', 'voz')
        return resp('Posso navegar entre as telas, receber relatos, corrigir campos, pedir confirmação de revisão, criar e consultar tickets (só com coordenador autenticado) e perguntar ao Prazy. Veja a lista completa em Raly, Voz e comandos.')
      case 'voz_resposta':
        setFalaAtiva(it.ligar)
        setUltimaFala(texto)
        setUltimaResposta(it.ligar ? 'Resposta falada ativada.' : 'Resposta falada desativada.')
        if (it.ligar) voz.falar('Resposta falada ativada.')
        return
      case 'novo_relato':
        reiniciarRaly(); navegar('raly', 'conversa')
        return resp('Novo relato iniciado. Pode descrever a ocorrência.')
      case 'relato': {
        navegar('raly', 'conversa')
        return resp(enviarRelato(it.texto, origem))
      }
      case 'pedir_revisao':
        navegar('raly', 'conversa')
        if (!temRelato) return resp('Ainda não há relato para revisar. Descreva a ocorrência primeiro.')
        if (r.revisao === 'revisada') return resp('Esta ocorrência já foi revisada nesta demonstração.')
        setPendente({ tipo: 'revisao' })
        return resp(`Vou registrar a revisão desta demonstração: ${resumirCampos(r.estado.campos) || 'ocorrência sem detalhes'}. Nada será enviado a equipes ou ao CCO. Você confirma? Diga sim, confirmo.`)
      case 'pedir_ticket':
        navegar('raly', 'conversa')
        if (!temRelato) return resp('Ainda não há relato para virar ticket.')
        if (r.revisao !== 'revisada') return resp('Antes do ticket, a revisão humana precisa ser confirmada. Diga: confirmar revisão.')
        if (r.ticketId) return resp(`O ticket ${r.ticketId} já foi criado para esta ocorrência.`)
        setPendente({ tipo: 'ticket' })
        return resp('Vou criar um ticket de demonstração com prioridade Média e equipe Supervisão de Operações, que são padrões da demonstração e podem ser ajustados no TicketRal. Você confirma?')
      case 'pedir_status': {
        const t = tk.find((x) => parseInt(x.id.replace(/\D/g, ''), 10) === parseInt(it.numero, 10))
        if (!t) return resp(`Não encontrei o ticket ${it.numero} nesta demonstração.`)
        setPendente({ tipo: 'status', id: t.id, status: it.status })
        return resp(`Vou mudar o ticket ${t.id} de ${t.status} para ${it.status}, só nesta demonstração. Você confirma?`)
      }
      case 'confirmar': {
        setPendente(null)
        if (pend?.tipo === 'revisao') {
          const logs = confirmarRevisao()
          return resp(`Revisão confirmada nesta demonstração. Nada foi enviado a equipes ou ao CCO.${logs.length ? ` Automações: ${logs.join(' ')}` : ''}`)
        }
        if (pend?.tipo === 'ticket') {
          const c = r.estado.campos
          const v = (k) => (c[k].estado !== 'nao_informado' ? c[k].valor : null)
          const id = criarTicketRaly({
            titulo: v('tipo') || 'Ocorrência relatada', categoria: categoriaSugerida(c), prioridade: 'Média', equipe: 'Supervisão de Operações',
            trecho: [v('rodovia') || 'rodovia não informada', v('km') || 'km não informado', v('sentido') && `sentido ${v('sentido')}`].filter(Boolean).join(' · '),
          })
          return resp(`Ticket de demonstração ${id} criado no TicketRal. Nada foi enviado a sistemas reais.`)
        }
        if (pend?.tipo === 'status') {
          atualizarTicket(pend.id, { status: pend.status })
          return resp(`Ticket ${pend.id} atualizado para ${pend.status}, apenas nesta demonstração.`)
        }
        return resp('Não há nada para confirmar agora.')
      }
      case 'cancelar':
        setPendente(null)
        return resp('Cancelado. Nada foi alterado.')
      case 'corrigir': {
        if (!temRelato) return resp('Ainda não há relato para corrigir.')
        navegar('raly', 'conversa')
        setRaly((x) => ({ ...x, revisao: 'pendente', estado: { ...x.estado, campos: { ...x.estado.campos, [it.campo]: { valor: it.valor, estado: 'informado' } } } }))
        return resp(`Anotei ${ROTULOS[it.campo].toLowerCase()}: ${it.valor}. A revisão precisa ser confirmada de novo.`)
      }
      case 'ler_cartao':
        navegar('raly', 'conversa')
        if (!temRelato) return resp('Ainda não há ocorrência em andamento.')
        return resp(`Resumo do relato, ainda não verificado. ${resumoSpoken(r.estado.campos)}`)
      case 'resumo_tickets': {
        const ab = tk.filter((t) => t.status !== 'Resolvido')
        const alt = ab.filter((t) => t.prioridade === 'Alta').length
        navegar('ticketral', 'lista')
        return resp(`Há ${ab.length} tickets em aberto na demonstração, ${alt} de prioridade alta. Dados fictícios.`)
      }
      case 'panorama': {
        const ab = tk.filter((t) => t.status !== 'Resolvido')
        const pendRaly = temRelato && r.revisao === 'pendente' ? 1 : 0
        navegar('inicio')
        if (!sess) return resp(`Panorama da demonstração: ${pendRaly} relato do Raly aguardando revisão. Os números do TicketRal só aparecem para o coordenador autenticado.`)
        return resp(`Panorama da demonstração: ${ab.length} tickets em aberto, ${ab.filter((t) => t.prioridade === 'Alta').length} de prioridade alta e ${pendRaly} relato do Raly aguardando revisão. Dados fictícios.`)
      }
      case 'ver_ticket': {
        const t = tk.find((x) => parseInt(x.id.replace(/\D/g, ''), 10) === parseInt(it.numero, 10))
        if (!t) return resp(`Não encontrei o ticket ${it.numero} nesta demonstração.`)
        navegar('ticketral', 'lista')
        setFocoTicket(t.id)
        return resp(`Ticket ${t.id}: ${t.titulo}. Categoria ${t.categoria}, prioridade ${t.prioridade}, status ${t.status}, equipe ${t.equipe}. Dados fictícios.`)
      }
      case 'via':
        return resp(consultarVia(it.pergunta) || 'Não encontrei essa via na minha base. Diga o número da rodovia, por exemplo BR-116, ou o nome do estado.')
      case 'prazy': {
        navegar('prazy', 'conversa')
        const p = perguntarPrazy(it.pergunta)
        return resp(`Prazy: ${p.texto}${p.fonte ? ` Fonte: ${p.fonte}.` : ''}`)
      }
      case 'navegar':
        navegar(it.destino.pagina, it.destino.sub || null)
        return resp(`Abrindo ${it.destino.rotulo}.`)
      default:
        return resp('Não entendi esse comando.')
    }
  }
  useEffect(() => { processarRef.current = processar })

  // Atalhos de teclado: Alt+R abre o painel do Raly; Alt+V liga/desliga o microfone.
  useEffect(() => {
    const aoTeclar = (e) => {
      if (!e.altKey) return
      if (e.key.toLowerCase() === 'r') { setDockAberto((v) => !v); e.preventDefault() }
      if (e.key.toLowerCase() === 'v') { setDockAberto(true); if (voz.ouvindo) voz.parar(); else voz.iniciar(); e.preventDefault() }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  })

  const contagens = useMemo(() => ({
    ticketral: sessao ? tickets.filter((t) => t.status !== 'Resolvido').length : 0,
  }), [tickets, sessao])

  const liberado = podeAcessar(nav.pagina, auth.sessao)
  const comum = { tickets, interacoes, raly, avisar, navegar, sub: nav.sub, mudarSub }
  let conteudo
  if (!liberado) {
    const m = MODULOS_ACESSO.find((x) => x.id === nav.pagina)
    conteudo = <Entrar auth={auth} navegar={navegar} destino={nav} motivo={auth.sessao ? `Seu perfil não tem acesso a ${m?.rotulo}.` : `${m?.rotulo} é restrito a pessoas autorizadas. Entre com sua conta.`} />
  } else switch (nav.pagina) {
    case 'raly':
      conteudo = <Raly {...comum} sessao={sessao} ocorrencias={ocorrencias} automacoes={automacoes} logAutomacao={logAutomacao} voz={voz} falaAtiva={falaAtiva}
        onFalaAtiva={setFalaAtiva} onAlternarAutomacao={(id) => setAutomacoes((l) => l.map((a) => (a.id === id ? { ...a, ligada: !a.ligada } : a)))}
        enviarRelato={(t) => responder(t, enviarRelato(t, 'texto'), 'texto')} criarTicketRaly={criarTicketRaly} confirmarRevisao={confirmarRevisao}
        editarCampos={editarCampos} reiniciar={reiniciarRaly} />
      break
    case 'sobre':
      conteudo = <SobreRaly {...comum} />
      break
    case 'smartdesk':
      conteudo = <SmartDeskAI {...comum} />
      break
    case 'ticketral':
      conteudo = <TicketRal {...comum} criarTicket={criarTicket} atualizarTicket={atualizarTicket} focoTicket={focoTicket} limparFoco={() => setFocoTicket(null)} />
      break
    case 'agentes':
      conteudo = <Agentes {...comum} sessao={auth.sessao} />
      break
    case 'entrar':
      conteudo = <Entrar auth={auth} navegar={navegar} destino={null} />
      break
    case 'conta':
      conteudo = <Conta {...comum} auth={auth} sessao={auth.sessao} />
      break
    case 'admin':
      conteudo = <Admin {...comum} auth={auth} sessao={auth.sessao} />
      break
    case 'prazy':
      conteudo = <Prazy {...comum} mensagens={prazyMsgs} perguntar={(t) => { const p = perguntarPrazy(t); responder(t, `Prazy: ${p.texto}`, 'texto') }} />
      break
    case 'consultas':
      conteudo = <Consultas {...comum} />
      break
    case 'interacoes':
      conteudo = <Interacoes {...comum} />
      break
    default:
      conteudo = <Inicio {...comum} sessao={sessao} ocorrencias={ocorrencias} automacoes={automacoes} logAutomacao={logAutomacao} />
  }

  const painelRaly = (
    <>
      <RalyDock
        voz={voz} falaAtiva={falaAtiva} onFalaAtiva={setFalaAtiva} continuo={continuo} onContinuo={(v) => { voz.parar(); setContinuo(v) }}
        ultimaFala={ultimaFala} ultimaResposta={ultimaResposta} pendente={pendente} aberto={dockAberto} onAbrir={() => setDockAberto((v) => !v)}
        onTexto={(t) => processar(t, 'texto')}
      />
      <Toasts itens={toasts} onFechar={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  )

  if (nav.pagina === 'apresentacao') {
    return (
      <div className="app app--lp">
        <Fundo3D />
        <main id="conteudo" tabIndex={-1}><Apresentacao navegar={navegar} voz={voz} /></main>
        {painelRaly}
      </div>
    )
  }

  return (
    <div className="app">
      <Fundo3D />
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <Header onAbrirMenu={() => setMenuAberto((v) => !v)} menuAberto={menuAberto} sessao={auth.sessao} onEntrar={() => navegar('entrar')} onSair={sairCoordenador} onInicio={() => navegar('apresentacao')} />
      <div className="app__corpo">
        <Nav paginaAtual={nav.pagina} onNavegar={(p) => navegar(p, null)} aberto={menuAberto} contagens={contagens} restritos={MODULOS_ACESSO.filter((m) => !podeAcessar(m.id, auth.sessao)).map((m) => m.id)} />
        <main id="conteudo" className="conteudo" tabIndex={-1}>{conteudo}</main>
      </div>
      {painelRaly}
    </div>
  )
}



