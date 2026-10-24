import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Onda from '../components/Onda.jsx'
import RalyLogo from '../components/RalyLogo.jsx'
import RalyRosto from '../components/RalyRosto.jsx'
import PersonalizarVoz from '../components/PersonalizarVoz.jsx'
import useReveal from '../utils/useReveal.js'

const RalyRosto3D = lazy(() => import('../components/RalyRosto3D.jsx'))
import { PROMESSA } from '../data/marca.js'
import { AGENTES } from '../data/agentes.js'

// Cenas da demonstração automática: do relato ao ticket. Tudo fictício.
const CENAS = [
  { id: 'ouve', rotulo: 'Ouve', titulo: 'O profissional fala. O Raly escuta.', legenda: 'Relato por voz, sem tirar os olhos da via.' },
  { id: 'entende', rotulo: 'Entende', titulo: 'A fala vira campos.', legenda: 'Cada dado fica marcado: informado, a confirmar ou não informado.' },
  { id: 'pergunta', rotulo: 'Pergunta', titulo: 'Falta o sentido? Uma pergunta curta.', legenda: 'Nunca completa por suposição.' },
  { id: 'revisa', rotulo: 'Revisão', titulo: 'Uma pessoa confirma.', legenda: 'Nada segue sem o “sim, confirmo”.' },
  { id: 'ticket', rotulo: 'Ticket', titulo: 'O coordenador recebe o ticket.', legenda: 'Área restrita, com login de coordenador.' },
]

// O que é dito em cada cena (fala em voz alta quando o visitante ativa o som).
const FALAS = {
  ouve: [{ t: 'Veículo parado no acostamento, DEMO-101, quilômetro 42.', papel: 'outra' }],
  entende: [{ t: 'Entendi: veículo parado, rodovia DEMO-101, quilômetro 42. O sentido ainda não foi informado.' }],
  pergunta: [{ t: 'Qual é o sentido da via?' }, { t: 'Sentido interior.', papel: 'outra' }],
  revisa: [{ t: 'Resumo pronto para revisão. Nada segue sem a sua confirmação. Diga: sim, confirmo.' }],
  ticket: [{ t: 'Revisão confirmada. O coordenador de trânsito autenticado pode abrir o ticket.' }],
}
const duracaoCena = (id) => FALAS[id].reduce((n, f) => n + f.t.length * 70, 1200)

function Palco({ cena }) {
  return (
    <div className="palco" role="img" aria-label={`Cena ${cena.rotulo}: ${cena.titulo}`}>
      <div className="palco__topo"><RalyRosto tamanho={34} estado={cena.id === 'ouve' ? 'ouvindo' : cena.id === 'pergunta' ? 'falando' : 'pronto'} /> <strong>Raly</strong><span className="palco__ao-vivo">exemplo</span></div>
      {cena.id === 'ouve' && (
        <div className="palco__corpo">
          <Onda barras={34} altura={64} />
          <p className="palco__fala">“Veículo parado no acostamento, DEMO-101, quilômetro 42…”</p>
        </div>
      )}
      {cena.id === 'entende' && (
        <div className="palco__corpo palco__chips">
          <span className="chip chip--ok">Tipo · veículo parado</span>
          <span className="chip chip--ok">Rodovia · DEMO-101</span>
          <span className="chip chip--ok">Km · 42</span>
          <span className="chip chip--conf">Local · acostamento</span>
          <span className="chip chip--falta">Sentido · não informado</span>
        </div>
      )}
      {cena.id === 'pergunta' && (
        <div className="palco__corpo">
          <p className="balao balao--raly">Entendi: veículo parado no acostamento, perto do km 42. Qual é o sentido da via?</p>
          <p className="balao balao--voce">Sentido interior.</p>
        </div>
      )}
      {cena.id === 'revisa' && (
        <div className="palco__corpo">
          <div className="cartao-mini">
            <strong>Resumo para revisão</strong>
            <span>Veículo parado · DEMO-101 · km 42 · sentido interior</span>
            <span className="selo-mini">Relato do usuário · não verificado</span>
            <span className="botao-mini"><Icon nome="check" tamanho={14} /> Sim, confirmo</span>
          </div>
        </div>
      )}
      {cena.id === 'ticket' && (
        <div className="palco__corpo">
          <div className="cartao-mini cartao-mini--ticket">
            <span className="selo-mini selo-mini--lock"><Icon nome="lock" tamanho={12} /> Coordenador de trânsito</span>
            <strong>TK-0107 · Veículo parado</strong>
            <span>Prioridade média · Supervisão de Operações</span>
            <span className="selo-mini">Ticket de demonstração · nada enviado</span>
          </div>
        </div>
      )}
    </div>
  )
}

function CenaDemo({ voz, som, onSom }) {
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  const [falaAtual, setFalaAtual] = useState('')
  const [ref, visto] = useReveal()
  const cena = CENAS[i]
  const falar = voz.falar
  const calar = voz.calar

  useEffect(() => {
    if (!visto) return undefined
    if (som) {
      // Narração: fala as linhas da cena e só então passa para a próxima.
      let vivo = true
      let guarda = 0
      let proxima = 0
      const falas = FALAS[cena.id]
      const avancar = () => { if (vivo) proxima = setTimeout(() => vivo && setI((n) => (n + 1) % CENAS.length), 900) }
      const rodar = (n) => {
        if (!vivo) return
        clearTimeout(guarda)
        if (n >= falas.length) { setFalaAtual(''); avancar(); return }
        setFalaAtual(falas[n].t)
        guarda = setTimeout(() => rodar(n + 1), falas[n].t.length * 120 + 4000) // segurança se a fala não terminar
        falar(falas[n].t, { papel: falas[n].papel, aoFim: () => rodar(n + 1) })
      }
      rodar(0)
      return () => { vivo = false; clearTimeout(guarda); clearTimeout(proxima); calar() }
    }
    if (pausa || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setTimeout(() => setI((n) => (n + 1) % CENAS.length), 4200)
    return () => clearTimeout(t)
  }, [i, pausa, visto, som, cena.id, falar, calar])

  const duracao = som ? duracaoCena(cena.id) : 4200
  return (
    <div ref={ref} className="demo" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
      <div className="demo__texto" aria-live="polite">
        <p className="eyebrow">Do relato ao ticket</p>
        <h2 key={cena.id} className="demo__titulo">{cena.titulo}</h2>
        <p className="demo__legenda">{som && falaAtual ? <><Icon nome="mic" tamanho={16} /> “{falaAtual}”</> : cena.legenda}</p>
        <button type="button" className={`btn ${som ? 'btn--contorno' : 'btn--primario'}`} onClick={onSom} disabled={!voz.suportaFala}>
          <Icon nome="mic" tamanho={16} /> {som ? 'Parar a narração' : 'Ouvir a apresentação'}
        </button>
        {!voz.suportaFala && <p className="lp__nota">Este navegador não fala em voz alta. Use Chrome ou Edge.</p>}
        {voz.suportaFala && voz.vozPt === false && <p className="lp__nota lp__nota--alerta">Nenhuma voz em português neste computador, então o Raly mostra só o texto. Para ouvir a voz feminina offline, ligue o servidor local (pasta raly-local). Ou instale “Português (Brasil)” nas configurações de voz do Windows, ou use o Edge (vozes Natural).</p>}
        <ol className="demo__passos">
          {CENAS.map((c, n) => (
            <li key={c.id}>
              <button type="button" className={`demo__passo ${n === i ? 'demo__passo--ativo' : ''} ${n < i ? 'demo__passo--feito' : ''}`} onClick={() => setI(n)} aria-current={n === i ? 'step' : undefined}>
                <span className="demo__barra"><i style={n === i && (som || !pausa) && visto ? { animationDuration: `${duracao}ms` } : undefined} /></span>
                {c.rotulo}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Palco key={cena.id} cena={cena} />
    </div>
  )
}

function Secao({ id, etiqueta, titulo, destaque, texto, itens, botao, onBotao, invertida, children }) {
  const [ref, visto] = useReveal()
  return (
    <section id={id} ref={ref} className={`secao-lp ${invertida ? 'secao-lp--inv' : ''} ${visto ? 'secao-lp--vista' : ''}`}>
      <div className="secao-lp__texto">
        <p className="eyebrow">{etiqueta}</p>
        <h2>{titulo} <em>{destaque}</em></h2>
        <p>{texto}</p>
        <ul className="secao-lp__itens">{itens.map((t) => <li key={t}><Icon nome="check" tamanho={16} /> {t}</li>)}</ul>
        {botao && <button type="button" className="btn btn--primario" onClick={onBotao}>{botao} <Icon nome="forward" tamanho={16} /></button>}
      </div>
      <div className="secao-lp__painel">{children}</div>
    </section>
  )
}

export default function Apresentacao({ navegar, voz }) {
  const [progresso, setProgresso] = useState(0)
  const [som, setSom] = useState(false)
  const estado3d = voz.falando ? 'falando' : voz.ouvindo ? 'ouvindo' : 'pronto'
  const alternarSom = () => setSom((v) => { if (v) voz.calar(); return !v })
  const ouvirApresentacao = () => { setSom(true); document.getElementById('como')?.scrollIntoView({ behavior: 'smooth' }) }
  const palcoRef = useRef(null)
  useEffect(() => {
    const aoRolar = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgresso(h > 0 ? Math.min(1, window.scrollY / h) : 0)
    }
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])
  const rolar = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="lp" ref={palcoRef}>
      <div className="lp__progresso" style={{ transform: `scaleX(${progresso})` }} aria-hidden="true" />
      <header className="lp__topo">
        <button type="button" className="lp__marca" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Raly, voltar ao topo"><RalyLogo tamanho={34} /> <strong>Raly</strong></button>
        <nav className="lp__nav" aria-label="Seções da apresentação">
          <button type="button" onClick={() => rolar('voz')}>Voz</button>
          <button type="button" onClick={() => rolar('como')}>Como funciona</button>
          <button type="button" onClick={() => rolar('confianca')}>Confiança</button>
          <button type="button" onClick={() => rolar('ecossistema')}>Agentes</button>
          <button type="button" onClick={() => navegar('agentes')}>Ecossistema</button>
        </nav>
        <button type="button" className="btn btn--claro lp__entrar" onClick={() => navegar('inicio')}>Entrar na plataforma</button>
      </header>

      <section className="lp__hero">
        <div className="lp__orbe lp__orbe--a" aria-hidden="true" />
        <div className="lp__orbe lp__orbe--b" aria-hidden="true" />
        <div className="lp__hero-conteudo">
          <p className="eyebrow eyebrow--claro">Challenge Motiva · agente de voz para a rodovia</p>
          <h1>Fale. <em>O Raly</em> organiza.</h1>
          <p className="lp__sub">Relatos de campo viram registros claros, completos e prontos para revisão. Sem digitar. Sem tirar a atenção da via. Com uma pessoa sempre no comando.</p>
          <div className="lp__acoes">
            <button type="button" className="btn btn--primario btn--grande" onClick={() => navegar('raly', 'conversa')}><Icon nome="mic" /> Falar com o Raly</button>
            <button type="button" className="btn btn--contorno btn--grande" onClick={ouvirApresentacao} disabled={!voz.suportaFala}><Icon nome="mic" /> Ouvir a apresentação</button>
          </div>
        </div>
        <div className="lp__hero-cena" aria-hidden="true">
          <div className="lp__halo" />
          <Suspense fallback={<RalyRosto tamanho={280} estado="pronto" />}>
            <RalyRosto3D tamanho={380} estado={estado3d} />
          </Suspense>
          <Onda barras={40} altura={56} ativa={voz.falando || voz.ouvindo || som} />
        </div>
      </section>

      <section id="voz" className="lp__voz">
        <div className="lp__voz-cartao painel-vidro">
          <p className="eyebrow">Demo de voz</p>
          <h2>Ouça o <em>Raly</em> falando.</h2>
          <p>Escolha uma voz, ajuste a velocidade e toque em “Ouvir”. Funciona offline quando o servidor local está ligado.</p>
          <PersonalizarVoz voz={voz} />
          <div className="lp__acoes">
            <button type="button" className="btn btn--primario btn--grande" onClick={() => voz.falar('Olá! Eu sou o Raly. Fale o relato e eu organizo as informações para a sua revisão.')} disabled={!voz.suportaFala}><Icon nome="mic" /> Ouvir a voz do Raly</button>
            <button type="button" className="btn btn--contorno btn--grande" onClick={() => navegar('raly', 'conversa')}>Conversar por voz</button>
          </div>
          {voz.suportaFala && voz.vozPt === false && <p className="lp__nota lp__nota--alerta">Sem voz em português neste computador. Ligue o servidor local (pasta raly-local) ou instale “Português (Brasil)” no Windows.</p>}
        </div>
      </section>

      <section id="como" className="lp__faixa">
        <CenaDemo voz={voz} som={som} onSom={alternarSom} />
      </section>

      <Secao
        id="confianca"
        etiqueta="Confiança"
        titulo="Honesto sobre o que sabe,"
        destaque="claro sobre o que falta."
        texto="O Raly diferencia o que veio do relato, o que é simulado e o que foi confirmado. Ele nunca afirma que uma equipe foi acionada sem confirmação real."
        itens={['Campos marcados como informado, a confirmar ou não informado', 'Confirmação explícita antes de qualquer ação crítica', 'Histórico de cada interação, com texto e horário']}
        botao="Conhecer a marca"
        onBotao={() => navegar('sobre', 'marca')}
      >
        <div className="painel-vidro">
          <div className="linha-campo"><span>Tipo</span><b>Veículo parado</b><i className="chip chip--ok">informado</i></div>
          <div className="linha-campo"><span>Rodovia</span><b>DEMO-101</b><i className="chip chip--ok">informado</i></div>
          <div className="linha-campo"><span>Km</span><b>42</b><i className="chip chip--conf">confirmar</i></div>
          <div className="linha-campo"><span>Sentido</span><b>—</b><i className="chip chip--falta">não informado</i></div>
          <div className="linha-campo"><span>Vítimas</span><b>—</b><i className="chip chip--falta">não informado</i></div>
        </div>
      </Secao>

      <section id="ecossistema" className="lp__ecossistema">
        <p className="eyebrow">Ecossistema</p>
        <h2>Quatro agentes, <em>cada público no seu espaço.</em></h2>
        <p>O Raly é a porta de entrada por voz e se liga aos demais agentes. Cada um tem sua página e seu nível de acesso.</p>
        <div className="lp__fluxo">
          {AGENTES.map((a) => <button key={a.id} type="button" onClick={() => rolar(`agente-${a.id}`)}><Icon nome={a.icone} tamanho={16} /> {a.nome}</button>)}
        </div>
      </section>

      {AGENTES.map((a, n) => (
        <Secao
          key={a.id}
          id={`agente-${a.id}`}
          etiqueta={`Agente · ${a.nome}`}
          titulo={a.titulo}
          destaque={a.destaque}
          texto={a.resumo}
          itens={a.faz.slice(0, 3)}
          botao={`Conhecer o ${a.nome}`}
          onBotao={() => navegar('agentes', a.id)}
          invertida={n % 2 === 1}
        >
          <div className="painel-vidro agente-lp">
            <div className="agente-lp__topo"><Icon nome={a.icone} tamanho={34} /> <h3>{a.nome}</h3></div>
            <p className="agente-lp__publico"><Icon nome={a.modulo === 'ticketral' ? 'lock' : 'user'} tamanho={14} /> {a.publico}</p>
            <div className="agente-lp__cmd">{a.comandos.map((c) => <span key={c}>{c}</span>)}</div>
            <button type="button" className="btn btn--contorno" onClick={() => navegar(...a.abrir)}>{a.modulo === 'ticketral' ? 'Entrar (restrito)' : `Abrir ${a.nome}`} <Icon nome="forward" tamanho={16} /></button>
          </div>
        </Secao>
      ))}

      <Secao
        id="limites"
        etiqueta="Limites"
        titulo="Apoia a decisão."
        destaque="Nunca decide."
        texto="O Raly organiza informação. Gravidade, despacho e emergência continuam com pessoas autorizadas e com os serviços oficiais."
        itens={['Não despacha equipes nem avisa o CCO por conta própria', 'Não inventa localização, telefone ou prazos', 'Não substitui procedimentos oficiais']}
        botao="O que o Raly não faz"
        onBotao={() => navegar('sobre', 'quem')}
      >
        <div className="painel-vidro painel-vidro--centro">
          <Icon nome="shield" tamanho={56} />
          <b>Decisão humana</b>
          <small>Confirmação visual de demonstração</small>
        </div>
      </Secao>

      <section className="lp__final">
        <RalyRosto tamanho={96} titulo="Raly" />
        <h2>{PROMESSA}</h2>
        <p>Pronto para ver o Raly trabalhando?</p>
        <div className="lp__acoes">
          <button type="button" className="btn btn--primario btn--grande" onClick={() => navegar('raly', 'conversa')}><Icon nome="mic" /> Falar com o Raly</button>
          <button type="button" className="btn btn--contorno btn--grande" onClick={() => navegar('inicio')}>Entrar na plataforma</button>
        </div>
      </section>

      <footer className="lp__rodape">
        <div>
          <strong>Raly</strong>
        </div>
        <div>
          <button type="button" onClick={() => navegar('sobre', 'quem')}>Sobre o Raly</button>
          <button type="button" onClick={() => navegar('raly', 'voz')}>Voz e comandos</button>
          <button type="button" onClick={() => navegar('inicio')}>Plataforma</button>
        </div>
      </footer>
    </div>
  )
}



