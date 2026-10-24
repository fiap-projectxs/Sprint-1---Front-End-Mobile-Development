import Icon from './Icon.jsx'

// Status é sempre mostrado com ícone + texto, nunca só pela cor.
const MAPA = {
  Aberto: ['alert', 'aberto'],
  Recebida: ['inbox', 'aberto'],
  'Em andamento': ['clock', 'andamento'],
  'Em análise': ['clock', 'andamento'],
  'Aguardando informação': ['help', 'espera'],
  'Revisão humana': ['users', 'espera'],
  Encaminhada: ['forward', 'andamento'],
  Resolvido: ['check', 'ok'],
  Concluída: ['check', 'ok'],
}

export function StatusBadge({ status }) {
  const [icone, tom] = MAPA[status] || ['info', 'aberto']
  return (
    <span className={`badge badge--${tom}`}>
      <Icon nome={icone} tamanho={13} /> {status}
    </span>
  )
}

const PRIO = { Alta: ['alert', 'alta'], Média: ['clock', 'media'], Baixa: ['check', 'baixa'] }

export function PrioridadeBadge({ prioridade }) {
  const [icone, tom] = PRIO[prioridade] || ['info', 'baixa']
  return (
    <span className={`badge badge--prio-${tom}`}>
      <Icon nome={icone} tamanho={13} /> {prioridade}
    </span>
  )
}
