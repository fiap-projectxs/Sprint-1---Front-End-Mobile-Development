import { useEffect, useRef, useState } from 'react'
import Card from '../components/Card.jsx'
import CampoExtraido from '../components/CampoExtraido.jsx'
import DemoNotice from '../components/DemoNotice.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PersonalizarVoz from '../components/PersonalizarVoz.jsx'
import RalyRosto from '../components/RalyRosto.jsx'
import Icon from '../components/Icon.jsx'
import Mensagem from '../components/Mensagem.jsx'
import Modal from '../components/Modal.jsx'
import SourceTag from '../components/SourceTag.jsx'
import SubNav from '../components/SubNav.jsx'
import { Selecao, Texto } from '../components/Campo.jsx'
import { CATEGORIAS_TICKET } from '../data/tickets.js'
import { EQUIPES, PRIORIDADES } from '../data/equipes.js'
import { AJUDA_COMANDOS } from '../utils/comandos.js'
import { ORDEM_CAMPOS, ROTULOS } from '../utils/extrair.js'
import { AVISO_RALY, EXEMPLOS_RALY } from '../utils/raly.js'
import { formatarDataHora } from '../utils/datas.js'

function categoriaSugerida(campos) {
  const tipo = campos.tipo.valor
  if (/vegeta|pavimento/i.test(tipo)) return 'Manutenção'
  if (/ve[ií]culo|acidente|animal|objeto|fuma/i.test(tipo)) return 'Trânsito'
  return 'Registro incompleto'
}

export default function Raly(props) {
  const { sub, mudarSub, ocorrencias, automacoes } = props
  const atual = sub || 'conversa'
  const abas = [
    { id: 'conversa', rotulo: 'Conversa' },
    { id: 'ocorrencias', rotulo: 'Ocorrências', contagem: ocorrencias.length },
    { id: 'voz', rotulo: 'Voz e comandos' },
    { id: 'automacoes', rotulo: 'Automações', contagem: automacoes.filter((a) => a.ligada).length },
  ]
  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1 className="titulo-raly"><RalyRosto tamanho={56} titulo="Raly" /> Raly · assistente operacional por voz</h1>
          <p className="texto-suave">Fale ou escreva um relato. O Raly organiza as informações, aponta o que falta e prepara um resumo para revisão humana. Ele também comanda as outras telas.</p>
        </div>
      </div>
      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Subpáginas do Raly" />
      <DemoNotice tom="alerta">{AVISO_RALY}</DemoNotice>
      {atual === 'conversa' && <Conversa {...props} />}
      {atual === 'ocorrencias' && <Ocorrencias {...props} />}
      {atual === 'voz' && <VozComandos {...props} />}
      {atual === 'automacoes' && <Automacoes {...props} />}
    </div>
  )
}

function Conversa({ raly, voz, sessao, enviarRelato, criarTicketRaly, confirmarRevisao, editarCampos, reiniciar, navegar }) {
  const [texto, setTexto] = useState('')
  const [modal, setModal] = useState(null)
  const fimRef = useRef(null)
  const { campos, pergunta } = raly.estado
  const temRelato = raly.mensagens.some((m) => m.autor === 'usuario' && !m.consulta)

  useEffect(() => { fimRef.current?.scrollIntoView({ block: 'nearest' }) }, [raly.mensagens.length])

  function enviar(conteudo) {
    const t = (conteudo ?? texto).trim()
    if (!t) return
    enviarRelato(t)
    setTexto('')
  }

  return (
    <>
      <div className="acoes">
        <button type="button" className="btn btn--secundario" onClick={reiniciar}><Icon nome="refresh" tamanho={16} /> Novo relato</button>
      </div>
      <div className="grade grade--raly">
        <Card titulo="Conversa" subtitulo="Respostas por regras locais (sem IA externa). Por voz ou texto." className="chat-card">
          <div className="chat" role="log" aria-live="polite" aria-label="Histórico da conversa com o Raly">
            {raly.mensagens.length === 0 && <EmptyState icone="chat" titulo="Nenhum relato ainda">Toque no microfone, escreva abaixo ou use um exemplo.</EmptyState>}
            {raly.mensagens.map((m) => (
              <Mensagem key={m.id} autor={m.autor} nome="Raly" texto={m.texto} quando={m.quando} fonte={m.autor === 'raly' ? m.fonte : undefined} />
            ))}
            <div ref={fimRef} />
          </div>
          <div className="exemplos" aria-label="Exemplos de comandos">
            {EXEMPLOS_RALY.map((ex) => <button key={ex} type="button" className="chip" onClick={() => enviar(ex)}>{ex}</button>)}
          </div>
          <form className="chat__form" onSubmit={(e) => { e.preventDefault(); enviar() }}>
            <button type="button" className={`btn btn--icone btn--mic ${voz.ouvindo ? 'btn--mic-ativo' : ''}`} onClick={voz.ouvindo ? voz.parar : voz.iniciar} aria-pressed={voz.ouvindo}
              aria-label={voz.ouvindo ? 'Parar de ouvir' : 'Falar com o Raly'} disabled={!voz.suportaReconhecimento} title={voz.suportaReconhecimento ? 'Falar com o Raly' : 'Este navegador não tem reconhecimento de voz'}>
              <Icon nome="mic" tamanho={20} />
            </button>
            <label className="sr-only" htmlFor="relato">Relato da ocorrência</label>
            <input id="relato" value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off"
              placeholder={pergunta ? 'Responda à pergunta do Raly…' : 'Ex.: veículo parado no acostamento, DEMO-101, km 42'} />
            <button type="submit" className="btn btn--primario" disabled={!texto.trim()}><Icon nome="send" tamanho={16} /> Enviar</button>
          </form>
          {voz.ouvindo && <p className="texto-suave" role="status">Ouvindo… {voz.parcial}</p>}
          {voz.erro && <p className="dock__aviso" role="alert">{voz.erro}</p>}
        </Card>

        <Card titulo="Cartão da ocorrência" subtitulo="Resumo para revisão humana" acoes={<SourceTag fonte={raly.revisao === 'revisada' ? 'confirmada' : 'relato'} />}>
          {!temRelato ? (
            <EmptyState icone="list" titulo="Sem ocorrência em andamento">Envie um relato para ver os campos extraídos.</EmptyState>
          ) : (
            <>
              <ul className="extraidos" aria-label="Campos extraídos do relato">
                {ORDEM_CAMPOS.map((k) => <CampoExtraido key={k} rotulo={ROTULOS[k]} campo={campos[k]} />)}
              </ul>
              <p className="texto-suave">
                {raly.revisao === 'revisada'
                  ? 'Revisão confirmada visualmente por um operador (simulação). Nada foi enviado a equipes ou ao CCO.'
                  : 'Aguardando revisão humana. Os campos acima vêm do relato e não foram verificados.'}
              </p>
              <div className="acoes">
                <button type="button" className="btn btn--secundario" onClick={() => setModal('editar')}><Icon nome="edit" tamanho={16} /> Editar informações</button>
                <button type="button" className="btn btn--primario" onClick={() => setModal('revisar')} disabled={raly.revisao === 'revisada'}><Icon nome="check" tamanho={16} /> Confirmar revisão</button>
                <button type="button" className="btn btn--secundario" onClick={() => setModal('ticket')} disabled={raly.revisao !== 'revisada' || !!raly.ticketId || !sessao}><Icon nome={sessao ? 'ticket' : 'lock'} tamanho={16} /> Criar ticket de demonstração</button>
              {!sessao && <p className="texto-suave">Criar ticket é função do coordenador de trânsito. <button type="button" className="link" onClick={() => navegar('ticketral', 'lista')}>Entrar no TicketRal</button></p>}
              </div>
              {raly.revisao !== 'revisada' && <p className="texto-suave">O ticket só pode ser criado depois da confirmação humana. Por voz: “confirmar revisão”.</p>}
              {raly.ticketId && (
                <DemoNotice>Ticket de demonstração {raly.ticketId} criado localmente. <button type="button" className="link" onClick={() => navegar('ticketral', 'lista')}>Ver no TicketRal</button></DemoNotice>
              )}
            </>
          )}
        </Card>
      </div>

      {modal === 'editar' && <EditarCampos campos={campos} onFechar={() => setModal(null)} onSalvar={(n) => { editarCampos(n); setModal(null) }} />}
      {modal === 'revisar' && <ConfirmarRevisao onFechar={() => setModal(null)} onConfirmar={() => { confirmarRevisao(); setModal(null) }} />}
      {modal === 'ticket' && <NovoTicket campos={campos} onFechar={() => setModal(null)} onCriar={(d) => { criarTicketRaly(d); setModal(null) }} />}
    </>
  )
}

function Ocorrencias({ ocorrencias, navegar }) {
  if (ocorrencias.length === 0) {
    return <EmptyState icone="list" titulo="Nenhuma ocorrência revisada ainda">Quando você confirmar uma revisão na aba Conversa (ou disser “confirmar revisão”), a ocorrência aparece aqui.</EmptyState>
  }
  return (
    <div className="grade grade--2">
      {ocorrencias.map((o) => (
        <Card key={o.id} titulo={`${o.id} · ${o.resumo}`} subtitulo={formatarDataHora(o.quando)} acoes={<SourceTag fonte="confirmada" />}>
          <ul className="extraidos">
            {ORDEM_CAMPOS.map((k) => <CampoExtraido key={k} rotulo={ROTULOS[k]} campo={o.campos[k]} />)}
          </ul>
          <p className="texto-suave">
            {o.ticketId ? <>Ticket: <strong>{o.ticketId}</strong>. </> : 'Sem ticket criado. '}
            {o.autoTicketId && <>Pendência aberta por automação: <strong>{o.autoTicketId}</strong>. </>}
            <button type="button" className="link" onClick={() => navegar('ticketral', 'lista')}>Abrir TicketRal</button>
          </p>
        </Card>
      ))}
    </div>
  )
}

function VozComandos({ voz, falaAtiva, onFalaAtiva }) {
  return (
    <div className="grade grade--2">
      <Card titulo="Personalizar o Raly" subtitulo="Voz feminina ou masculina, velocidade e tom. Fica salvo neste navegador">
        <div className="raly-perfil">
          <RalyRosto tamanho={120} estado={voz.ouvindo ? 'ouvindo' : voz.falando ? 'falando' : 'pronto'} titulo="Rosto do Raly" />
          <PersonalizarVoz voz={voz} />
        </div>
      </Card>
      <Card titulo="Estado da voz neste navegador" subtitulo="Recurso do navegador (Web Speech API)">
        <ul className="lista-simples">
          <li><Icon nome={voz.suportaReconhecimento ? 'check' : 'x'} tamanho={16} /> <span>Reconhecimento de voz: <strong>{voz.suportaReconhecimento ? 'disponível' : 'indisponível (use Chrome ou Edge)'}</strong>. Idioma: português do Brasil.</span></li>
          <li><Icon nome={voz.suportaFala ? 'check' : 'x'} tamanho={16} /> <span>Resposta falada: <strong>{voz.suportaFala ? 'disponível' : 'indisponível'}</strong>.</span></li>
          {voz.suportaFala && <li><Icon nome={voz.vozPt === false ? 'x' : 'check'} tamanho={16} /> <span>Voz em português: <strong>{voz.vozPt === null ? 'verificando…' : voz.vozPt ? 'encontrada' : 'não encontrada neste computador'}</strong>. {voz.vozPt === false && 'O Raly não fala em outro idioma: instale uma voz “Português (Brasil)” nas configurações do sistema ou use o Edge.'}</span></li>}
          <li><Icon nome="info" tamanho={16} /> <span>No Chrome e no Edge o reconhecimento costuma usar um serviço online do navegador. Sem internet ele pode falhar; a entrada por texto continua funcionando. <strong>Não é uma função offline.</strong></span></li>
          <li><Icon nome="shield" tamanho={16} /> <span>Esta aplicação não grava nem envia o áudio. O navegador pede permissão do microfone.</span></li>
        </ul>
        <div className="acoes">
          <button type="button" className="btn btn--primario" onClick={voz.ouvindo ? voz.parar : voz.iniciar} disabled={!voz.suportaReconhecimento}><Icon nome="mic" tamanho={16} /> {voz.ouvindo ? 'Parar de ouvir' : 'Testar microfone'}</button>
          <label className="marcar"><input type="checkbox" checked={falaAtiva} onChange={(e) => onFalaAtiva(e.target.checked)} disabled={!voz.suportaFala} /> <span>Resposta falada</span></label>
        </div>
        {voz.ouvindo && <p className="texto-suave" role="status">Ouvindo… {voz.parcial}</p>}
        {voz.erro && <p className="dock__aviso" role="alert">{voz.erro}</p>}
        <p className="texto-suave">Atalhos: <kbd>Alt</kbd>+<kbd>R</kbd> abre o painel do Raly; <kbd>Alt</kbd>+<kbd>V</kbd> liga ou desliga o microfone.</p>
      </Card>
      <Card titulo="O que dá para falar" subtitulo="Cada comando também funciona digitado no painel do Raly">
        <ul className="lista-simples">
          {AJUDA_COMANDOS.map(([titulo, ex]) => (
            <li key={titulo}><Icon nome="mic" tamanho={16} /> <span><strong>{titulo}:</strong> {ex}</span></li>
          ))}
        </ul>
        <DemoNotice>Ações críticas (revisão, ticket, mudança de status) sempre pedem uma confirmação explícita: “sim, confirmo”.</DemoNotice>
      </Card>
    </div>
  )
}

function Automacoes({ automacoes, onAlternarAutomacao, logAutomacao }) {
  return (
    <div className="grade grade--2">
      <Card titulo="Regras de automação" subtitulo="Só criam registros locais para revisão humana">
        <ul className="regras">
          {automacoes.map((a) => (
            <li key={a.id}>
              <label className="marcar">
                <input type="checkbox" checked={a.ligada} onChange={() => onAlternarAutomacao(a.id)} />
                <span><strong>{a.titulo}</strong><br /><span className="texto-suave">{a.descricao}</span></span>
              </label>
            </li>
          ))}
        </ul>
        <DemoNotice tom="alerta">As automações não acionam equipes, não decidem gravidade e não enviam nada ao CCO.</DemoNotice>
      </Card>
      <Card titulo="Registro de execuções" subtitulo="O que as automações fizeram nesta sessão">
        {logAutomacao.length === 0 ? (
          <EmptyState icone="clock" titulo="Nenhuma automação executada">Confirme uma revisão na aba Conversa para ver o registro.</EmptyState>
        ) : (
          <ol className="timeline">
            {logAutomacao.map((l, i) => (
              <li key={`${l.quando}-${i}`}><span className="timeline__ponto" aria-hidden="true" /><div><p className="timeline__meta">{formatarDataHora(l.quando)} · Automação (simulada)</p><p>{l.texto}</p></div></li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}

function EditarCampos({ campos, onFechar, onSalvar }) {
  const [rascunho, setRascunho] = useState(() => Object.fromEntries(ORDEM_CAMPOS.map((k) => [k, campos[k].estado === 'nao_informado' ? '' : campos[k].valor])))
  function salvar(e) {
    e.preventDefault()
    const novos = {}
    for (const k of ORDEM_CAMPOS) {
      const v = rascunho[k].trim()
      const antigo = campos[k]
      if (!v) novos[k] = { valor: '', estado: 'nao_informado' }
      else if (antigo.estado !== 'nao_informado' && antigo.valor === v) novos[k] = antigo
      else novos[k] = { valor: v, estado: 'informado' }
    }
    onSalvar(novos)
  }
  return (
    <Modal titulo="Editar informações" onFechar={onFechar}>
      <form onSubmit={salvar} className="form">
        <p className="texto-suave">Deixe em branco o que não foi informado. Nada será completado por suposição.</p>
        {ORDEM_CAMPOS.map((k) => <Texto key={k} id={`ed-${k}`} rotulo={ROTULOS[k]} valor={rascunho[k]} onChange={(v) => setRascunho((r) => ({ ...r, [k]: v }))} />)}
        <div className="acoes">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="btn btn--primario">Salvar</button>
        </div>
      </form>
    </Modal>
  )
}

function ConfirmarRevisao({ onFechar, onConfirmar }) {
  const [ciente, setCiente] = useState(false)
  return (
    <Modal titulo="Confirmar revisão (simulação)" onFechar={onFechar}>
      <div className="form">
        <DemoNotice tom="alerta">Esta é uma confirmação visual de demonstração. Ela não envia nada ao CCO, a equipes ou a qualquer sistema e não confirma a ocorrência no mundo real.</DemoNotice>
        <label className="marcar"><input type="checkbox" checked={ciente} onChange={(e) => setCiente(e.target.checked)} /><span>Sou o operador autorizado e revisei os campos do cartão (simulação).</span></label>
        <div className="acoes">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>Voltar</button>
          <button type="button" className="btn btn--primario" disabled={!ciente} onClick={onConfirmar}>Confirmar revisão</button>
        </div>
      </div>
    </Modal>
  )
}

function NovoTicket({ campos, onFechar, onCriar }) {
  const v = (k) => (campos[k].estado !== 'nao_informado' ? campos[k].valor : null)
  const [titulo, setTitulo] = useState(v('tipo') || 'Ocorrência relatada')
  const [categoria, setCategoria] = useState(categoriaSugerida(campos))
  const [prioridade, setPrioridade] = useState('Média')
  const [equipe, setEquipe] = useState('Supervisão de Operações')
  const trecho = [v('rodovia') || 'rodovia não informada', v('km') || 'km não informado', v('sentido') && `sentido ${v('sentido')}`].filter(Boolean).join(' · ')
  return (
    <Modal titulo="Criar ticket de demonstração" onFechar={onFechar}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onCriar({ titulo, categoria, prioridade, equipe, trecho }) }}>
        <p className="texto-suave">Categoria, prioridade e equipe são escolhas humanas. O Raly não avalia gravidade.</p>
        <Texto id="tk-titulo" rotulo="Título" valor={titulo} onChange={setTitulo} obrigatorio />
        <Selecao id="tk-cat" rotulo="Categoria" valor={categoria} onChange={setCategoria} opcoes={CATEGORIAS_TICKET} todas={null} />
        <Selecao id="tk-prio" rotulo="Prioridade" valor={prioridade} onChange={setPrioridade} opcoes={PRIORIDADES} todas={null} />
        <Selecao id="tk-eq" rotulo="Equipe responsável (simulada)" valor={equipe} onChange={setEquipe} opcoes={EQUIPES} todas={null} />
        <p className="texto-suave"><strong>Trecho:</strong> {trecho}</p>
        <div className="acoes">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="btn btn--primario">Criar ticket</button>
        </div>
      </form>
    </Modal>
  )
}
