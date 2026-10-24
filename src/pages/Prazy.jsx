import { useEffect, useRef, useState } from 'react'
import Card from '../components/Card.jsx'
import DemoNotice from '../components/DemoNotice.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import Mensagem from '../components/Mensagem.jsx'
import SubNav from '../components/SubNav.jsx'
import { CONTEUDO_PRAZY, TEMAS_PRAZY } from '../data/prazy.js'

export default function Prazy({ sub, mudarSub, mensagens, perguntar }) {
  const atual = sub || 'conversa'
  const [tema, setTema] = useState('viagem')
  const [texto, setTexto] = useState('')
  const fimRef = useRef(null)
  const temaAtual = TEMAS_PRAZY.find((t) => t.id === tema)

  useEffect(() => { fimRef.current?.scrollIntoView({ block: 'nearest' }) }, [mensagens.length])

  function enviar(conteudo) {
    const t = (conteudo ?? texto).trim()
    if (!t) return
    perguntar(t)
    setTexto('')
  }

  const abas = [
    { id: 'conversa', rotulo: 'Conversa' },
    { id: 'conteudo', rotulo: 'Conteúdo disponível', contagem: CONTEUDO_PRAZY.length },
  ]

  return (
    <div className="pagina pagina--prazy">
      <div className="pagina__topo">
        <div>
          <h1>Prazy · guia para quem usa a rodovia</h1>
          <p className="texto-suave">Um atendimento simples para tirar dúvidas gerais. Só responde com o conteúdo de demonstração do projeto. Por voz: “perguntar ao Prazy …”.</p>
        </div>
      </div>
      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Subpáginas do Prazy" />
      <DemoNotice>
        Conteúdo demonstrativo e genérico. O Prazy não informa tarifas, trânsito, acidentes, rotas em tempo real, telefones, horários nem disponibilidade de serviços. Em emergência, procure os serviços oficiais.
      </DemoNotice>

      {atual === 'conversa' && (
        <div className="prazy">
          <div className="prazy__temas" role="group" aria-label="Escolha um tema">
            {TEMAS_PRAZY.map((t) => (
              <button key={t.id} type="button" className={`tema ${t.id === tema ? 'tema--ativo' : ''}`} aria-pressed={t.id === tema} onClick={() => setTema(t.id)}>{t.rotulo}</button>
            ))}
          </div>

          <div className="chat chat--prazy" role="log" aria-live="polite" aria-label="Conversa com o Prazy">
            {mensagens.length === 0 && <EmptyState icone="compass" titulo="Olá! Como posso ajudar?">Escolha uma pergunta abaixo ou escreva a sua.</EmptyState>}
            {mensagens.map((m) => (
              <div key={m.id}>
                <Mensagem autor={m.autor} nome="Prazy" texto={m.texto} quando={m.quando} />
                {m.autor === 'prazy' && (
                  <p className="texto-suave msg__fonte"><Icon nome="info" tamanho={12} /> {m.fonte ? `Fonte: ${m.fonte}` : 'Sem fonte disponível nesta demonstração.'}</p>
                )}
              </div>
            ))}
            <div ref={fimRef} />
          </div>

          <div className="exemplos" aria-label="Perguntas sugeridas">
            {temaAtual.sugestoes.map((s) => <button key={s} type="button" className="chip" onClick={() => enviar(s)}>{s}</button>)}
            <button type="button" className="chip" onClick={() => enviar('Qual é o pedágio de hoje?')}>Qual é o pedágio de hoje? (sem fonte)</button>
          </div>

          <form className="chat__form" onSubmit={(e) => { e.preventDefault(); enviar() }}>
            <label className="sr-only" htmlFor="pergunta-prazy">Sua pergunta</label>
            <input id="pergunta-prazy" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva sua dúvida" autoComplete="off" />
            <button type="submit" className="btn btn--primario" disabled={!texto.trim()}><Icon nome="send" tamanho={16} /> Enviar</button>
          </form>
        </div>
      )}

      {atual === 'conteudo' && (
        <div className="grade grade--2">
          {TEMAS_PRAZY.map((t) => (
            <Card key={t.id} titulo={t.rotulo} subtitulo="Respostas que o Prazy pode dar nesta demonstração">
              <ul className="lista-simples">
                {CONTEUDO_PRAZY.filter((c) => c.tema === t.id).map((c) => (
                  <li key={c.id}><Icon nome="info" tamanho={16} /> <div><p>{c.resposta}</p><p className="texto-suave">Fonte: {c.fonte}</p></div></li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
