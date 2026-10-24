// Perfis e o que cada um pode abrir. null = público; 'logado' = qualquer pessoa autenticada.
export const PERFIS = {
  passageiro: { rotulo: 'Passageiro', descricao: 'Usa o Prazy e o atendimento do SmartDeskAI.' },
  agente: { rotulo: 'Agente de campo', descricao: 'Registra ocorrências com o Raly e usa o SmartDeskAI.' },
  coordenador: { rotulo: 'Coordenador de trânsito', descricao: 'Tudo do agente, mais o TicketRal.' },
  admin: { rotulo: 'Administrador', descricao: 'Tudo, mais o painel administrativo.' },
}
export const LISTA_PERFIS = Object.keys(PERFIS)

export const MODULOS_ACESSO = [
  { id: 'apresentacao', rotulo: 'Apresentação', quem: null },
  { id: 'sobre', rotulo: 'Sobre o Raly', quem: null },
  { id: 'agentes', rotulo: 'Agentes', quem: null },
  { id: 'prazy', rotulo: 'Prazy', quem: ['passageiro', 'agente', 'coordenador', 'admin'] },
  { id: 'inicio', rotulo: 'Visão geral', quem: null },
  { id: 'smartdesk', rotulo: 'SmartDeskAI', quem: ['passageiro', 'agente', 'coordenador', 'admin'] },
  { id: 'raly', rotulo: 'Raly (operacional)', quem: ['agente', 'coordenador', 'admin'] },
  { id: 'consultas', rotulo: 'Consultas', quem: ['agente', 'coordenador', 'admin'] },
  { id: 'interacoes', rotulo: 'Interações', quem: ['agente', 'coordenador', 'admin'] },
  { id: 'ticketral', rotulo: 'TicketRal', quem: ['coordenador', 'admin'] },
  { id: 'admin', rotulo: 'Painel administrativo', quem: ['admin'] },
  { id: 'conta', rotulo: 'Minha conta', quem: 'logado' },
  { id: 'entrar', rotulo: 'Entrar', quem: null },
]

export function podeAcessar(pagina, sessao) {
  const m = MODULOS_ACESSO.find((x) => x.id === pagina)
  if (!m || m.quem === null) return true
  if (!sessao) return false
  if (m.quem === 'logado') return true
  return m.quem.includes(sessao.perfil)
}

// Quem pode ver ou criar tickets (TicketRal).
export const podeTickets = (sessao) => podeAcessar('ticketral', sessao)
