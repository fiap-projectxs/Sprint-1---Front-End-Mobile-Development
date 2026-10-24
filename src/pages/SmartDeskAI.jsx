import { useCallback, useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import DemoNotice from '../components/DemoNotice.jsx'
import Icon from '../components/Icon.jsx'
import SubNav from '../components/SubNav.jsx'

const PORTA = 8877
// Usa o mesmo host da plataforma (localhost ou 127.0.0.1) para os cookies de sessão valerem no iframe.
const host = typeof window !== 'undefined' ? window.location.hostname || '127.0.0.1' : '127.0.0.1'
const URL_SMARTDESK = `http://${host}:${PORTA}/`

function useConexao() {
  const [estado, setEstado] = useState('verificando') // 'verificando' | 'online' | 'offline'
  const [tentativa, setTentativa] = useState(0)
  useEffect(() => {
    let ativo = true
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 4000)
    fetch(URL_SMARTDESK, { mode: 'no-cors', signal: c.signal, cache: 'no-store' })
      .then(() => ativo && setEstado('online'))
      .catch(() => ativo && setEstado('offline'))
      .finally(() => clearTimeout(t))
    return () => { ativo = false; c.abort() }
  }, [tentativa])
  const verificar = useCallback(() => { setEstado('verificando'); setTentativa((n) => n + 1) }, [])
  return { estado, verificar }
}

export default function SmartDeskAI({ sub, mudarSub, navegar }) {
  const atual = sub || 'areas'
  const conexao = useConexao()
  const abas = [
    { id: 'areas', rotulo: 'Áreas' },
    { id: 'app', rotulo: 'Atendimento' },
    { id: 'conexao', rotulo: 'Conexão com o Raly' },
  ]
  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>SmartDeskAI · atendimento e solicitações</h1>
          <p className="texto-suave">O SmartDeskAI é a aplicação própria do grupo. Aqui ela aparece integrada à plataforma, do jeito que já funciona.</p>
        </div>
        <a className="btn btn--secundario" href={URL_SMARTDESK} target="_blank" rel="noreferrer"><Icon nome="forward" tamanho={16} /> Abrir em nova aba</a>
      </div>
      <SubNav itens={abas} atual={atual} onMudar={mudarSub} rotulo="Subpáginas do SmartDeskAI" />

      {atual === 'areas' && <Areas navegar={navegar} mudarSub={mudarSub} estado={conexao.estado} />}

      {atual === 'app' && (
        <>
          <ConexaoAviso estado={conexao.estado} onVerificar={conexao.verificar} />
          {conexao.estado !== 'offline' && (
            <div className="smartdesk-frame">
              <iframe title="SmartDeskAI" src={URL_SMARTDESK} loading="lazy" />
            </div>
          )}
        </>
      )}

      {atual === 'conexao' && (
        <div className="grade grade--2">
          <Card titulo="Estado da conexão" subtitulo={URL_SMARTDESK}>
            <ConexaoAviso estado={conexao.estado} onVerificar={conexao.verificar} />
            <h4>Para ligar o SmartDeskAI</h4>
            <ol className="lista-passos">
              <li>Abra a pasta do projeto SmartDeskAI no seu computador.</li>
              <li>Execute o arquivo de inicialização do SmartDeskAI (o mesmo que você já usa).</li>
              <li>Volte aqui e toque em “Verificar de novo”.</li>
            </ol>
          </Card>
          <Card titulo="Como ele se conecta ao Raly" subtitulo="O que existe hoje e o que é evolução futura">
            <ul className="lista-simples">
              <li><Icon nome="check" tamanho={16} /> <span><strong>Funciona agora:</strong> o Raly abre o SmartDeskAI por voz (“abrir SmartDeskAI”), e a plataforma mostra a aplicação dentro dela.</span></li>
              <li><Icon nome="clock" tamanho={16} /> <span><strong>Ainda não existe:</strong> troca de dados entre o Raly e o SmartDeskAI. Tickets do TicketRal e solicitações do SmartDeskAI são registros separados.</span></li>
              <li><Icon nome="database" tamanho={16} /> <span><strong>Evolução futura:</strong> o SmartDeskAI virar um app com núcleo local/offline. Não está implementado nem validado.</span></li>
            </ul>
            <DemoNotice>O SmartDeskAI roda no seu computador (Python e Ollama locais). Esta plataforma não o substitui nem altera.</DemoNotice>
          </Card>
        </div>
      )}
    </div>
  )
}

function ConexaoAviso({ estado, onVerificar }) {
  if (estado === 'verificando') return <div className="carga" role="status"><span className="carga__giro" aria-hidden="true" /> Verificando o SmartDeskAI…</div>
  if (estado === 'online') return null
  return (
    <div className="aviso aviso--erro" role="alert">
      <Icon nome="alert" tamanho={18} />
      <div>
        <p><strong>SmartDeskAI não está respondendo em {URL_SMARTDESK}.</strong> Inicie a aplicação no seu computador e tente de novo. Nada foi perdido: esta tela só mostra a aplicação quando ela está ligada.</p>
        <button type="button" className="btn btn--secundario" onClick={onVerificar}><Icon nome="refresh" tamanho={16} /> Verificar de novo</button>
      </div>
    </div>
  )
}

function Areas({ navegar, mudarSub, estado }) {
  return (
    <>
      <div className="areas">
        <section className="area">
          <span className="area__icone"><Icon nome="users" tamanho={24} /></span>
          <span className="area__etiqueta">Área do passageiro</span>
          <h2>Pedir atendimento</h2>
          <p className="texto-suave">Para quem usa a rodovia: registrar uma solicitação, acompanhar o andamento e tirar dúvidas antes de falar com uma pessoa.</p>
          <ul className="lista-simples">
            <li><Icon nome="check" tamanho={16} /> <span>Abrir e acompanhar solicitações no SmartDeskAI.</span></li>
            <li><Icon nome="compass" tamanho={16} /> <span>Dúvidas gerais de viagem com o Prazy.</span></li>
          </ul>
          <div className="area__acoes">
            <button type="button" className="btn btn--primario" onClick={() => mudarSub('app')}><Icon nome="inbox" tamanho={16} /> Abrir atendimento</button>
            <button type="button" className="btn btn--secundario" onClick={() => navegar('prazy', 'conversa')}><Icon nome="compass" tamanho={16} /> Falar com o Prazy</button>
          </div>
        </section>

        <section className="area area--agente">
          <span className="area__icone"><Icon nome="route" tamanho={24} /></span>
          <span className="area__etiqueta">Área do agente</span>
          <h2>Fila e encaminhamentos</h2>
          <p className="texto-suave">Para quem atende e opera: ver a fila, responder solicitações, encaminhar entre equipes e registrar relatos de campo.</p>
          <ul className="lista-simples">
            <li><Icon nome="check" tamanho={16} /> <span>Fila de solicitações no SmartDeskAI.</span></li>
            <li><Icon nome="mic" tamanho={16} /> <span>Registro de ocorrência por voz com o Raly.</span></li>
            <li><Icon nome="lock" tamanho={16} /> <span>Tickets são do coordenador de trânsito, com login.</span></li>
          </ul>
          <div className="area__acoes">
            <button type="button" className="btn btn--primario" onClick={() => mudarSub('app')}><Icon nome="inbox" tamanho={16} /> Abrir fila de atendimento</button>
            <button type="button" className="btn btn--secundario" onClick={() => navegar('raly', 'conversa')}><Icon nome="mic" tamanho={16} /> Registrar por voz</button>
          </div>
        </section>

        <section className="area area--geral">
          <span className="area__icone"><Icon nome="shield" tamanho={24} /></span>
          <span className="area__etiqueta">Área geral · todos</span>
          <h2>Informação comum</h2>
          <p className="texto-suave">O que passageiros e agentes compartilham: como o atendimento funciona, o que cada perfil enxerga e o estado do serviço.</p>
          <ul className="lista-simples">
            <li><Icon nome={estado === 'online' ? 'check' : 'clock'} tamanho={16} /> <span>Serviço SmartDeskAI: <strong>{estado === 'online' ? 'conectado' : estado === 'offline' ? 'desligado' : 'verificando'}</strong>.</span></li>
            <li><Icon nome="info" tamanho={16} /> <span>Passageiro vê só as próprias solicitações. Agente vê a fila.</span></li>
            <li><Icon nome="database" tamanho={16} /> <span>Evolução futura: app com núcleo local/offline.</span></li>
          </ul>
          <div className="area__acoes">
            <button type="button" className="btn btn--secundario" onClick={() => mudarSub('conexao')}><Icon nome="refresh" tamanho={16} /> Ver conexão e limites</button>
          </div>
        </section>
      </div>
      <DemoNotice>
        As áreas acima são páginas desta plataforma que levam ao SmartDeskAI real, sem alterá-lo. A separação por perfil dentro do SmartDeskAI é o desenho do futuro app, ainda não implementada.
      </DemoNotice>
    </>
  )
}
