import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Card from '../components/Card.jsx'
import DemoNotice from '../components/DemoNotice.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import SourceTag from '../components/SourceTag.jsx'
import { CATEGORIAS_TICKET } from '../data/tickets.js'
import { ETAPAS_FLUXO, PERSONAS } from '../data/fluxo.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const MODULOS = [
  { id: 'raly', sub: 'conversa', icone: 'mic', nome: 'Raly', publico: 'A plataforma principal', texto: 'Agente de voz para apoio operacional. Recebe relatos por voz ou texto, organiza as informações, comanda as outras telas e prepara um resumo para revisão humana.' },
  { id: 'smartdesk', sub: 'areas', icone: 'inbox', nome: 'SmartDeskAI', publico: 'Passageiros e agentes · futuro app', texto: 'Central de atendimento do grupo, a aplicação própria rodando integrada à plataforma: solicitações, filas e encaminhamentos. Serve aos dois públicos, com áreas gerais próprias. A evolução prevista é virar um app.' },
  { id: 'ticketral', sub: 'lista', icone: 'ticket', nome: 'TicketRal', publico: 'Restrito · coordenador de trânsito', texto: 'App do coordenador de trânsito, com login. Tickets operacionais com categoria, prioridade, equipe, trecho, horário e histórico de atualizações.' },
  { id: 'prazy', sub: 'conversa', icone: 'compass', nome: 'Prazy', publico: 'Passageiros', texto: 'Guia simples para usuários da rodovia. Só responde com conteúdo de demonstração e informa quando não consegue confirmar.' },
]

export default function Inicio({ tickets, raly, sessao, navegar, ocorrencias, automacoes }) {
  const abertos = tickets.filter((t) => t.status !== 'Resolvido').length
  const alertaLigado = automacoes.find((a) => a.id === 'alerta')?.ligada
  const alertas = alertaLigado && sessao ? tickets.filter((t) => t.prioridade === 'Alta' && t.status === 'Aberto') : []
  const altas = tickets.filter((t) => t.prioridade === 'Alta' && t.status !== 'Resolvido').length
  const ocorrenciaPendente = raly.mensagens.length > 0 && raly.revisao === 'pendente' ? 1 : 0

  const porCategoria = CATEGORIAS_TICKET.map((c) => tickets.filter((t) => t.categoria === c).length)
  const dadosGrafico = {
    labels: CATEGORIAS_TICKET,
    datasets: [{ label: 'Tickets', data: porCategoria, backgroundColor: '#6d4aff', borderRadius: 6 }],
  }
  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  }

  return (
    <div className="pagina">
      <section className="hero">
        <p className="hero__etiqueta">Challenge Motiva · FIAP · 2TIAPR</p>
        <h1>Uma plataforma para organizar a informação de quem opera e de quem usa a rodovia</h1>
        <p>
          O problema escolhido: o profissional de campo precisa registrar e consultar informações sem digitar e sem perder a atenção da via.
          O Raly é o agente de voz e o coração desta plataforma: é ele que comanda as demais frentes. O SmartDeskAI atende passageiros e agentes, o TicketRal é o app do coordenador de trânsito (acesso com login) e o Prazy é o guia dos passageiros.
        </p>
        <div className="hero__acoes">
          <button type="button" className="btn btn--primario" onClick={() => navegar('raly', 'conversa')}><Icon nome="mic" /> Falar com o Raly</button>
          <button type="button" className="btn btn--claro" onClick={() => navegar('sobre', 'quem')}><Icon nome="help" /> Conhecer o Raly</button>
          <button type="button" className="btn btn--claro" onClick={() => navegar('smartdesk', 'areas')}><Icon nome="inbox" /> Abrir o SmartDeskAI</button>
        </div>
      </section>

      {alertas.length > 0 && (
        <DemoNotice tom="alerta">
          <strong>Alerta automático (simulado):</strong> {alertas.length} ticket(s) de prioridade alta ainda abertos: {alertas.map((t) => t.id).join(', ')}.{' '}
          <button type="button" className="link" onClick={() => navegar('ticketral', 'lista')}>Abrir TicketRal</button>
        </DemoNotice>
      )}

      <div className="grade grade--4">
        <div className="kpi"><span className="kpi__valor">{sessao ? abertos : '—'}</span><span className="kpi__rotulo">Tickets em aberto</span>{sessao ? <SourceTag fonte="simulada" /> : <span className="selo-restrito"><Icon nome="lock" tamanho={13} /> Só coordenador</span>}</div>
        <div className="kpi"><span className="kpi__valor">{sessao ? altas : '—'}</span><span className="kpi__rotulo">Tickets de prioridade alta</span>{sessao ? <SourceTag fonte="simulada" /> : <span className="selo-restrito"><Icon nome="lock" tamanho={13} /> Só coordenador</span>}</div>
        <div className="kpi"><span className="kpi__valor">{ocorrencias.length}</span><span className="kpi__rotulo">Ocorrências revisadas pelo Raly</span><SourceTag fonte="confirmada" /></div>
        <div className="kpi"><span className="kpi__valor">{ocorrenciaPendente}</span><span className="kpi__rotulo">Relato do Raly aguardando revisão</span><SourceTag fonte="relato" /></div>
      </div>

      <h2 className="secao">Módulos da plataforma</h2>
      <div className="grade grade--4">
        {MODULOS.map((m) => (
          <button key={m.id} type="button" className="modulo" onClick={() => navegar(m.id, m.sub)}>
            <span className="modulo__icone"><Icon nome={m.icone} tamanho={22} /></span>
            <strong>{m.nome}</strong>
            <span className="modulo__publico">{m.publico}</span>
            <span>{m.texto}</span>
            <span className="modulo__abrir">Abrir <Icon nome="forward" tamanho={14} /></span>
          </button>
        ))}
      </div>

      <div className="grade grade--2">
        {sessao ? (
        <Card titulo="Tickets por categoria" subtitulo="Dados fictícios · gráfico acompanha as mudanças feitas no TicketRal">
          <div className="grafico" role="img" aria-label={`Tickets por categoria: ${CATEGORIAS_TICKET.map((c, i) => `${c} ${porCategoria[i]}`).join('; ')}`}>
            <Bar data={dadosGrafico} options={opcoes} />
          </div>
        </Card>
        ) : (
          <Card titulo="Tickets por categoria" subtitulo="Área do coordenador de trânsito">
            <EmptyState icone="lock" titulo="Gráfico restrito">Os dados do TicketRal só aparecem para o coordenador de trânsito autenticado.</EmptyState>
            <button type="button" className="btn btn--primario" onClick={() => navegar('ticketral', 'lista')}><Icon nome="lock" tamanho={16} /> Entrar como coordenador</button>
          </Card>
        )}
        <Card titulo="Fluxo de emergência (simulação)" subtitulo="Etapas e responsabilidades, resumidas dos documentos do desafio">
          <ol className="fluxo">
            {ETAPAS_FLUXO.map((e) => (
              <li key={e.id}>
                <span className="fluxo__num">{e.id}</span>
                <div>
                  <strong>{e.titulo}</strong> <span className="texto-suave">· {e.quem}</span>
                  <p className="texto-suave">{e.nota}</p>
                </div>
              </li>
            ))}
          </ol>
          <DemoNotice tom="alerta">O Raly não decide gravidade, não despacha equipes e não controla emergências. Decisões ficam com pessoas autorizadas.</DemoNotice>
        </Card>
      </div>

      <div className="grade grade--2">
        <Card titulo="Quem usa" subtitulo="As cinco personas do desafio">
          <ul className="lista-simples">
            {PERSONAS.map((p) => (
              <li key={p.id}><Icon nome="users" tamanho={16} /> <div><strong>{p.nome}</strong><span className="texto-suave"> · {p.foco}</span></div></li>
            ))}
          </ul>
        </Card>
        <Card titulo="O que é real e o que é futuro" subtitulo="Transparência sobre os limites desta demonstração">
          <ul className="lista-simples">
            <li><Icon nome="check" tamanho={16} /> <span><strong>Funciona agora:</strong> voz no navegador (Chrome/Edge), comandos do Raly, tickets locais e o SmartDeskAI do grupo embutido quando está ligado.</span></li>
            <li><Icon nome="clock" tamanho={16} /> <span><strong>Representado:</strong> encaminhamento entre equipes, revisão humana, automações (só criam registros locais).</span></li>
            <li><Icon nome="database" tamanho={16} /> <span><strong>Evolução futura:</strong> núcleo local e offline do SmartDeskAI (app) e troca de dados entre os módulos. Ainda não implementado nem validado.</span></li>
            <li><Icon nome="shield" tamanho={16} /> <span><strong>Não existe:</strong> integração com CCO, despacho, localização, telefonia ou dados em tempo real.</span></li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
