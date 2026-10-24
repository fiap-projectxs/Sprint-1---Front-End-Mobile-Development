// Interpretação DEMONSTRATIVA de comandos falados ou digitados no Raly.
// Funções puras: recebem o texto e o contexto e devolvem uma intenção. Quem executa é o App.

export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()

// Destinos de navegação. O primeiro que casar vence (os mais específicos vêm antes).
export const DESTINOS = [
  { pagina: 'apresentacao', rotulo: 'Apresentação', chaves: ['apresentacao', 'tela de abertura', 'pagina de apresentacao'] },
  { pagina: 'sobre', sub: 'marca', rotulo: 'Sobre o Raly · A marca', chaves: ['a marca', 'marca do raly', 'identidade do raly'] },
  { pagina: 'sobre', sub: 'trabalho', rotulo: 'Sobre o Raly · Como ele trabalha', chaves: ['como o raly trabalha', 'como funciona o raly'] },
  { pagina: 'sobre', sub: 'quem', rotulo: 'Sobre o Raly', chaves: ['sobre o raly', 'quem e o raly', 'o que e o raly'] },
  { pagina: 'raly', sub: 'voz', rotulo: 'Raly · Voz e comandos', chaves: ['voz e comandos', 'comandos de voz', 'ajuda de voz'] },
  { pagina: 'raly', sub: 'ocorrencias', rotulo: 'Raly · Ocorrências', chaves: ['ocorrencias do raly', 'ocorrencias revisadas', 'lista de ocorrencias'] },
  { pagina: 'raly', sub: 'automacoes', rotulo: 'Raly · Automações', chaves: ['automacoes'] },
  { pagina: 'smartdesk', sub: 'areas', rotulo: 'SmartDeskAI · Áreas', chaves: ['areas', 'areas do smartdesk', 'area do passageiro', 'area do agente'] },
  { pagina: 'smartdesk', sub: 'conexao', rotulo: 'SmartDeskAI · Conexão com o Raly', chaves: ['conexao', 'conexao do smartdesk', 'status do smartdesk'] },
  { pagina: 'ticketral', sub: 'quadro', rotulo: 'TicketRal · Quadro', chaves: ['quadro', 'kanban'] },
  { pagina: 'ticketral', sub: 'pendencias', rotulo: 'TicketRal · Pendências', chaves: ['pendencias', 'pendencia'] },
  { pagina: 'prazy', sub: 'conteudo', rotulo: 'Prazy · Conteúdo disponível', chaves: ['conteudo do prazy', 'temas e fontes', 'fontes do prazy'] },
  { pagina: 'inicio', rotulo: 'Visão geral', chaves: ['inicio', 'visao geral', 'painel geral', 'pagina inicial', 'home'] },
  { pagina: 'smartdesk', sub: 'app', rotulo: 'SmartDeskAI', chaves: ['smartdesk', 'smart desk', 'smartdeskai', 'solicitacoes', 'caixa de entrada', 'atendimento'] },
  { pagina: 'ticketral', sub: 'lista', rotulo: 'TicketRal', chaves: ['ticketral', 'ticket ral', 'tickets', 'ticket'] },
  { pagina: 'prazy', sub: 'conversa', rotulo: 'Prazy', chaves: ['prazy', 'guia do usuario'] },
  { pagina: 'consultas', rotulo: 'Consultas', chaves: ['consultas', 'trechos'] },
  { pagina: 'interacoes', rotulo: 'Interações', chaves: ['interacoes', 'historico de comandos', 'historico'] },
  { pagina: 'raly', sub: 'conversa', rotulo: 'Raly', chaves: ['raly', 'assistente', 'conversa'] },
]

export const STATUS_FALADOS = [
  ['aguardando informacao', 'Aguardando informação'],
  ['em andamento', 'Em andamento'],
  ['resolvido', 'Resolvido'],
  ['aberto', 'Aberto'],
]

const CAMPOS_FALADOS = [
  [/^(km|quilometro)$/, 'km'],
  [/^sentido$/, 'sentido'],
  [/^rodovia$/, 'rodovia'],
  [/^(municipio|cidade)$/, 'municipio'],
  [/^(faixa|local|acostamento)$/, 'local'],
  [/^tipo$/, 'tipo'],
  [/^vitimas?$/, 'vitimas'],
]

export function acharDestino(t) {
  return DESTINOS.find((d) => d.chaves.some((c) => new RegExp(`(^|\\s)${c}(\\s|$)`).test(t)))
}

export function interpretar(texto, ctx = {}) {
  const original = texto.trim()
  let t = norm(original).replace(/^(hey |ei |ola |oi )?raly[,:. ]*/, '').trim()
  if (!t) return { tipo: 'vazio' }

  if (ctx.pendente) {
    if (/^(sim|confirmo|confirmar|confirma|pode confirmar|pode|isso|ok|certo)\b/.test(t)) return { tipo: 'confirmar' }
    if (/^(nao|cancela|cancelar|deixa|esquece|volta)\b/.test(t)) return { tipo: 'cancelar' }
    // qualquer outra fala cancela a confirmação pendente e é interpretada normalmente
  }

  if (/\b(ajuda|o que voce faz|quais comandos|o que posso (falar|dizer))\b/.test(t)) return { tipo: 'ajuda' }
  if (/\b(desativar|desligar|silenciar|parar de falar)\b.*\b(voz|resposta|fala)/.test(t) || /^(silencio|cala)/.test(t)) return { tipo: 'voz_resposta', ligar: false }
  if (/\b(ativar|ligar)\b.*\b(voz|resposta falada|fala)/.test(t)) return { tipo: 'voz_resposta', ligar: true }
  if (/\b(novo relato|limpar relato|recomecar|reiniciar relato|comecar de novo)\b/.test(t)) return { tipo: 'novo_relato' }
  if (/\b(confirmar|confirmo)\b.*\brevisao\b|\brevisao confirmada\b/.test(t)) return { tipo: 'pedir_revisao' }
  if (/\b(criar|abrir|gerar|crie|abra)\b.*\bticket\b/.test(t) && !/(ticket|tk)[ -]?\d/.test(t)) return { tipo: 'pedir_ticket' }

  const corr = t.match(/^(?:corrigir|corrija|alterar|altere|mudar|mude|trocar|troque)\s+(?:o |a )?(\w+)\s+(?:para|pra|como|:)\s*(.+)$/)
  if (corr) {
    const campo = CAMPOS_FALADOS.find(([re]) => re.test(corr[1]))
    if (campo) {
      // pega o valor do texto original para preservar acentos e maiúsculas
      const idx = original.toLowerCase().search(/(?:para|pra|como|:)\s*[^\s]/)
      const valor = idx >= 0 ? original.slice(idx).replace(/^(?:para|pra|como|:)\s*/i, '').trim() : corr[2]
      return { tipo: 'corrigir', campo: campo[1], valor }
    }
  }

  if (/\b(ler|leia|le)\b.*\b(ocorrencia|cartao|relato|resumo)\b|^resumo da ocorrencia/.test(t)) return { tipo: 'ler_cartao' }

  const st = t.match(/(?:atualizar|alterar|mudar|marcar)\b.*\b(?:ticket|tk)[ -]?0*(\d{1,4})\b.*\b(?:para|como)\s+(.+)$/)
  if (st) {
    const alvo = STATUS_FALADOS.find(([k]) => st[2].includes(k))
    if (alvo) return { tipo: 'pedir_status', numero: st[1], status: alvo[1] }
  }
  const tk = t.match(/\b(?:ticket|tk)[ -]?0*(\d{1,4})\b/)
  if (tk) return { tipo: 'ver_ticket', numero: tk[1] }

  if (/\b(quantos|quantas)\b.*\btickets?\b|\btickets? (abertos|em aberto)\b|\bresumo dos tickets\b/.test(t)) return { tipo: 'resumo_tickets' }
  if (/\b(panorama|resumo operacional|resumo geral|como esta a operacao)\b/.test(t)) return { tipo: 'panorama' }

  if (/^(o que e|qual e|qual|onde fica|onde passa|por onde passa|me fale|fale|fala|informacoes?|quais|como e|extensao|telefones?)\b.*\b(br[- ]?\d{2,3}|(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)[- ]\d{1,3}|rodovias?|estradas?|dutra|fernao dias|anhanguera|bandeirantes|imigrantes|anchieta|transamazonica|regis bittencourt|castello branco|castelo branco|emergencia)\b/.test(t) && !/\bticket\b/.test(t)) return { tipo: 'via', pergunta: original }

  const pz = t.match(/^(?:perguntar|pergunte|perguntar|pergunta)\s+(?:ao|para o|pro)\s+prazy[,: ]*(.+)$/) || t.match(/^prazy[,: ]+(.+)$/)
  if (pz) return { tipo: 'prazy', pergunta: pz[1] }

  const verbo = t.match(/^(?:abrir|abre|abra|ir para|ir pra|va para|vai para|mostrar|mostre|ver|veja|navegar para|ir ao|ir a)\s+(?:a |o |as |os |na |no |ao |para )?(.+)$/)
  const alvo = acharDestino(verbo ? verbo[1] : t)
  const perguntaSobre = /^(quem e|o que e|sobre|como (o raly )?(trabalha|funciona))\b.*\braly\b|^como o raly (trabalha|funciona)/.test(t)
  if (alvo && (verbo || perguntaSobre || t.split(' ').length <= 3)) return { tipo: 'navegar', destino: alvo }

  if (ctx.pagina === 'prazy') return { tipo: 'prazy', pergunta: original }
  return { tipo: 'relato', texto: original }
}

export const AJUDA_COMANDOS = [
  ['Navegar', '“Abrir tickets”, “abrir SmartDeskAI”, “abrir quadro”, “abrir Prazy”, “abrir consultas”'],
  ['Relatar', '“Veículo parado no acostamento, DEMO-101, km 42, sentido interior”'],
  ['Corrigir', '“Corrigir sentido para capital”, “corrigir município para Exemplo A”'],
  ['Revisar', '“Confirmar revisão” e depois “sim, confirmo”'],
  ['Ticket', '“Criar ticket” (só depois da revisão) e depois “sim, confirmo”'],
  ['Consultar', '“Quantos tickets abertos?”, “ticket 101”, “panorama”'],
  ['Atualizar', '“Atualizar status do ticket 101 para em andamento” e depois “sim”'],
  ['Prazy', '“Perguntar ao Prazy o que fazer se o carro parar”'],
  ['Outros', '“Ler resumo da ocorrência”, “novo relato”, “desativar resposta falada”, “ajuda”'],
]
