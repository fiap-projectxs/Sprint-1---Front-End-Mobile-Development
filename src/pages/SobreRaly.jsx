import Card from '../components/Card.jsx'
import Icon from '../components/Icon.jsx'
import { lazy, Suspense } from 'react'
import RalyLogo from '../components/RalyLogo.jsx'
import RalyRosto from '../components/RalyRosto.jsx'
import SubNav from '../components/SubNav.jsx'

import {
  PROMESSA, O_QUE_E, ETAPAS_TRABALHO, OBJETIVOS, PERSONAS_NECESSIDADES, NAO_FAZ,
  PERSONALIDADE, DIZ, NUNCA_DIZ, VALORES, CORES,
} from '../data/marca.js'

const RalyRosto3D = lazy(() => import('../components/RalyRosto3D.jsx'))

export default function SobreRaly({ sub, mudarSub, navegar }) {
  const atual = sub || 'quem'
  const abas = [
    { id: 'quem', rotulo: 'Quem é o Raly' },
    { id: 'trabalho', rotulo: 'Como ele trabalha' },
    { id: 'pessoas', rotulo: 'Objetivos, necessidades e dificuldades' },
    { id: 'marca', rotulo: 'A marca' },
  ]
  return (
    <div className="pagina">
      <section className="hero hero--marca">
        <Suspense fallback={<RalyRosto tamanho={170} />}><RalyRosto3D tamanho={200} /></Suspense>
        <div>
          <p className="hero__etiqueta">Sobre o Raly</p>
          <h1>{PROMESSA}</h1>
          <p>O agente de voz da rodovia. Uma marca construída em torno de uma ideia: quem cuida da estrada precisa de informação organizada, não de mais telas para digitar.</p>
          <div className="hero__acoes">
            <button type="button" className="btn btn--primario" onClick={() => navegar('raly', 'conversa')}><Icon nome="mic" /> Falar com o Raly</button>
          </div>
        </div>
      </section>

      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Subpáginas sobre o Raly" />

      {atual === 'quem' && (
        <div className="grade grade--2">
          <Card titulo="O que é o Raly">
            {O_QUE_E.map((t) => <p key={t}>{t}</p>)}
          </Card>
          <Card titulo="O que ele não faz" subtitulo="Limites que fazem parte da marca">
            <ul className="lista-simples">
              {NAO_FAZ.map((t) => <li key={t}><Icon nome="x" tamanho={16} /> <span>{t}</span></li>)}
            </ul>
          </Card>
        </div>
      )}

      {atual === 'trabalho' && (
        <>
          <ol className="trilha">
            {ETAPAS_TRABALHO.map((e, i) => (
              <li key={e.titulo} className="trilha__passo">
                <span className="trilha__num">{i + 1}</span>
                <div>
                  <h3>{e.titulo}</h3>
                  <p>{e.texto}</p>
                  <p className="trilha__real"><Icon nome="check" tamanho={14} /> {e.real}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {atual === 'pessoas' && (
        <>
          <div className="grade grade--3">
            {OBJETIVOS.map((o) => (
              <div key={o.titulo} className="objetivo">
                <span className="modulo__icone"><Icon nome={o.icone} tamanho={22} /></span>
                <strong>{o.titulo}</strong>
                <span>{o.texto}</span>
              </div>
            ))}
          </div>
          <Card titulo="Para quem o Raly trabalha" subtitulo="As cinco personas do desafio: o que precisam e onde sentem dificuldade">
            <div className="tabela-wrap">
              <table className="tabela">
                <thead><tr><th scope="col">Persona</th><th scope="col">O que precisa</th><th scope="col">Dificuldade</th></tr></thead>
                <tbody>
                  {PERSONAS_NECESSIDADES.map((p) => (
                    <tr key={p.persona}><th scope="row" className="tabela__rotulo">{p.persona}</th><td>{p.precisa}</td><td>{p.dificuldade}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="texto-suave">Necessidades baseadas nas User Stories do desafio. As dificuldades são a leitura do grupo a partir desses documentos.</p>
          </Card>
        </>
      )}

      {atual === 'marca' && (
        <>
          <div className="grade grade--2">
            <Card titulo="Símbolo e rosto" subtitulo="Dois sinais que se reconhecem de longe">
              <div className="marca-sinais">
                <figure>
                  <RalyLogo tamanho={96} />
                  <figcaption><strong>Símbolo.</strong> Um “R” de rodovia, com a faixa tracejada no traço e ondas de voz.</figcaption>
                </figure>
                <figure>
                  <RalyRosto tamanho={96} titulo="Rosto do Raly" />
                  <figcaption><strong>Rosto.</strong> Viseira, olhos de farol e antena com luz de sinalização. Nem pessoa, nem bicho.</figcaption>
                </figure>
              </div>
              <div className="marca-fundos">
                <div className="marca-fundo marca-fundo--escuro"><RalyRosto tamanho={56} /><RalyLogo tamanho={56} /></div>
                <div className="marca-fundo marca-fundo--claro"><RalyRosto tamanho={56} /><RalyLogo tamanho={56} /></div>
              </div>
            </Card>
            <Card titulo="Cores" subtitulo="Azul-marinho para confiança, roxo para voz e ação">
              <ul className="cores">
                {CORES.map((c) => (
                  <li key={c.hex}><span className="cores__amostra" style={{ background: c.hex }} aria-hidden="true" /><div><strong>{c.nome}</strong> <code>{c.hex}</code><p className="texto-suave">{c.uso}</p></div></li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="grade grade--2">
            <Card titulo="Personalidade" subtitulo="Como o Raly se comporta">
              <ul className="lista-simples">
                {PERSONALIDADE.map((p) => <li key={p.traco}><Icon nome="check" tamanho={16} /> <span><strong>{p.traco}.</strong> {p.texto}</span></li>)}
              </ul>
              <p className="texto-suave">Voz feminina ou masculina, à escolha de quem usa.</p>
            </Card>
            <Card titulo="Como ele fala" subtitulo="O tom da marca">
              <h4>Diz</h4>
              <ul className="lista-simples">{DIZ.map((t) => <li key={t}><Icon nome="chat" tamanho={16} /> <span>“{t}”</span></li>)}</ul>
              <h4>Nunca diz</h4>
              <ul className="lista-simples">{NUNCA_DIZ.map((t) => <li key={t}><Icon nome="x" tamanho={16} /> <span>“{t}”</span></li>)}</ul>
            </Card>
          </div>
          <Card titulo="Valores da marca" subtitulo="O que sustenta o Raly além do produto">
            <div className="grade grade--4">
              {VALORES.map((v) => <div key={v.titulo} className="valor"><strong>{v.titulo}</strong><span>{v.texto}</span></div>)}
            </div>
            <p className="texto-suave">Proposta de marca do grupo, aberta a ajustes.</p>
          </Card>
        </>
      )}
    </div>
  )
}
