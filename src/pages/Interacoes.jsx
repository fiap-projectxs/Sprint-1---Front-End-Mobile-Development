import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatarDataHora } from '../utils/datas.js'

export default function Interacoes({ interacoes }) {
  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>Interações · histórico de comandos do operador</h1>
          <p className="texto-suave">Comandos simulados e os enviados ao Raly nesta sessão, com data e resposta simulada.</p>
        </div>
      </div>
      {interacoes.length === 0 ? (
        <EmptyState icone="list" titulo="Sem interações ainda" />
      ) : (
        <ul className="interacoes">
          {interacoes.map((i) => (
            <li key={i.id}>
              <Card>
                <p className="texto-suave">{i.id} · {formatarDataHora(i.data)} · origem: {i.origem}</p>
                <p><strong>Comando:</strong> “{i.texto}”</p>
                <p><strong>Resposta:</strong> {i.resposta}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
