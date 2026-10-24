// Conteúdo da página "Sobre o Raly". Texto de marca proposto pelo grupo; baseado nos documentos do desafio.

export const PROMESSA = 'Fale. O Raly organiza.'

export const O_QUE_E = [
  'O Raly é um agente de voz para quem trabalha na rodovia. Ele ouve um relato, organiza as informações em campos claros, aponta o que ainda falta e entrega um resumo para uma pessoa revisar.',
  'Ele não é “uma IA que sabe tudo” nem “uma IA que detecta acidentes sozinha”. É uma camada de comunicação e organização: menos relato incompleto, menos digitação em campo, mais informação confiável para quem decide.',
]

export const ETAPAS_TRABALHO = [
  { titulo: 'Ouve', texto: 'Recebe o relato por voz (ou texto, quando a voz não está disponível). O profissional fala; as mãos e os olhos ficam na via.', real: 'Funciona na demonstração: voz do navegador (Chrome/Edge) e texto.' },
  { titulo: 'Entende', texto: 'Extrai tipo de ocorrência, rodovia, km, sentido, município, faixa, veículos, fumaça ou fogo, vítimas e apoio relatados.', real: 'Funciona: extração por regras, com dados fictícios.' },
  { titulo: 'Pergunta', texto: 'Se falta algo importante, faz uma pergunta curta por vez. Nunca completa um campo por suposição: o que não foi dito fica “não informado”.', real: 'Funciona.' },
  { titulo: 'Resume', texto: 'Monta um cartão com cada campo marcado como informado, precisa confirmar ou não informado, sempre dizendo se veio do relato, de simulação ou de confirmação.', real: 'Funciona.' },
  { titulo: 'Espera um humano', texto: 'Antes de qualquer ação crítica, pede confirmação explícita (“sim, confirmo”). Quem decide é a pessoa autorizada.', real: 'Funciona como confirmação visual de demonstração.' },
  { titulo: 'Passa adiante', texto: 'Com a revisão feita, o coordenador de trânsito autenticado pode abrir um ticket. O Raly nunca diz que acionou equipe ou CCO sem confirmação real.', real: 'Ticket local de demonstração. Sem integração real.' },
]

export const OBJETIVOS = [
  { icone: 'mic', titulo: 'Reduzir a digitação', texto: 'Registrar e consultar por voz, mantendo a atenção do profissional no ambiente rodoviário.' },
  { icone: 'list', titulo: 'Registros completos e padronizados', texto: 'Transformar fala livre em campos estruturados e apontar as lacunas na hora.' },
  { icone: 'shield', titulo: 'Decisão humana', texto: 'Confirmação explícita antes de registrar, encaminhar ou encerrar. Decisões críticas ficam com pessoas autorizadas.' },
  { icone: 'clock', titulo: 'Rastreabilidade', texto: 'Cada interação com texto, horário e resposta, para auditar depois quem disse o quê.' },
  { icone: 'info', titulo: 'Honestidade sobre o que sabe', texto: 'Diferenciar relato, informação simulada e informação confirmada. Dizer quando não consegue confirmar.' },
  { icone: 'users', titulo: 'Privacidade por perfil', texto: 'Mostrar o mínimo necessário para cada perfil. Por isso o TicketRal exige login do coordenador.' },
]

export const PERSONAS_NECESSIDADES = [
  {
    persona: 'Agente de Inspeção de Tráfego',
    precisa: 'Registrar ocorrência, informar local e sentido, ouvir o resumo do trecho, pedir apoio e encerrar o atendimento, tudo por voz.',
    dificuldade: 'Digitar em campo tira a atenção da via. O relato sai incompleto, sem sentido ou km.',
  },
  {
    persona: 'Agente de Guincho / Recurso Operacional',
    precisa: 'Ouvir o resumo da missão, confirmar recebimento, registrar chegada, relatar condições e finalizar com histórico.',
    dificuldade: 'Chega sem saber riscos e acesso. Atualizar etapas manualmente atrasa o registro.',
  },
  {
    persona: 'Agente de APH',
    precisa: 'Consultar protocolo aprovado, registrar dados e horários do atendimento e validar o resumo antes do envio.',
    dificuldade: 'Mãos ocupadas no atendimento. Campos obrigatórios esquecidos. O Raly apoia o registro, nunca o julgamento clínico.',
  },
  {
    persona: 'Supervisor de Operações',
    precisa: 'Panorama das ocorrências, priorização, alertas de exceção, validação de registros e passagem de turno.',
    dificuldade: 'Registros incompletos ou inconsistentes escondem prioridades e atrasos.',
  },
  {
    persona: 'Coordenador / Gerente de Operações',
    precisa: 'Visão consolidada e apoio à decisão, com dados de qualidade e acesso controlado.',
    dificuldade: 'Informação espalhada e de qualidade desigual. Sem trilha, é difícil confiar nos números.',
  },
]

export const NAO_FAZ = [
  'Não decide gravidade nem despacha equipes.',
  'Não afirma que o CCO foi avisado ou que uma equipe foi acionada sem confirmação real.',
  'Não inventa localização, protocolo, telefone, tempo de chegada ou disponibilidade.',
  'Não faz diagnóstico, nem lê emoção ou lesão pela voz.',
  'Não substitui procedimentos oficiais nem serviços de emergência.',
]

export const PERSONALIDADE = [
  { traco: 'Confiável', texto: 'Diz o que sabe e o que ainda não sabe.' },
  { traco: 'Sereno', texto: 'Voz calma, mesmo em situação tensa.' },
  { traco: 'Direto', texto: 'Uma pergunta curta por vez.' },
  { traco: 'Cordial', texto: 'Humano, sem excesso de informalidade.' },
]

export const DIZ = [
  'Entendi: veículo parado no acostamento, perto do km 42. O sentido ainda não foi informado. Você confirma?',
  'Isso veio do seu relato e ainda não foi verificado.',
  'Posso preparar o resumo. A revisão é sua.',
]
export const NUNCA_DIZ = [
  'Já enviei o guincho.',
  'A ocorrência foi confirmada.',
  'Não se preocupe, está tudo sob controle.',
]

export const VALORES = [
  { titulo: 'Atenção na via', texto: 'A tecnologia some para o profissional olhar para a estrada.' },
  { titulo: 'Verdade antes de velocidade', texto: 'Informação clara sobre origem e confiança, sempre.' },
  { titulo: 'Pessoa no comando', texto: 'O Raly prepara. Gente decide.' },
  { titulo: 'Cuidado com os dados', texto: 'Cada perfil enxerga só o que precisa.' },
]

export const CORES = [
  { nome: 'Azul-marinho', hex: '#0f1f3d', uso: 'Base, confiança, cabeçalho' },
  { nome: 'Azul-escuro', hex: '#1b2e4c', uso: 'Menus e painéis' },
  { nome: 'Roxo Raly', hex: '#6d4aff', uso: 'Destaque, ação e voz' },
  { nome: 'Lilás', hex: '#9a84ff', uso: 'Detalhes e brilho' },
  { nome: 'Âmbar sinal', hex: '#ffb020', uso: 'Luz da antena, atenção' },
]
