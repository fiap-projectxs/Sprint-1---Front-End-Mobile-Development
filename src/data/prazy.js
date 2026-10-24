// Base de conteúdo DEMONSTRATIVA do Prazy. Não contém tarifas, telefones,
// horários, links nem condições de tráfego: quem não estiver aqui vira "não consigo confirmar".
export const TEMAS_PRAZY = [
  { id: 'viagem', rotulo: 'Informações sobre a viagem', sugestoes: ['Como me preparar para uma viagem de carro?', 'O que fazer se meu carro parar no acostamento?'] },
  { id: 'servicos', rotulo: 'Dúvidas sobre serviços', sugestoes: ['Quais tipos de serviço existem na rodovia?', 'Como funciona o atendimento a usuários?'] },
  { id: 'orientacao', rotulo: 'Orientação geral', sugestoes: ['O que é a faixa de acostamento?', 'Como pedir ajuda com segurança?'] },
]

export const CONTEUDO_PRAZY = [
  { id: 'c1', tema: 'viagem', chaves: ['preparar', 'viagem', 'antes de sair', 'revisar'],
    resposta: 'Em geral, vale revisar pneus, combustível e itens de segurança antes de viajar, e informar-se por um canal oficial sobre a sua rota.',
    fonte: 'Conteúdo demonstrativo do Prazy (texto genérico, não oficial)' },
  { id: 'c2', tema: 'viagem', chaves: ['parar', 'acostamento', 'pane', 'quebrou', 'parou'],
    resposta: 'Se o veículo parar, a orientação geral é sair da pista com segurança sempre que possível, ligar o pisca-alerta e manter-se em local seguro. Para ajuda, use o canal oficial de atendimento da concessionária.',
    fonte: 'Conteúdo demonstrativo do Prazy (texto genérico, não oficial)' },
  { id: 'c3', tema: 'servicos', chaves: ['serviço', 'servico', 'servicos', 'serviços', 'tipos'],
    resposta: 'Esta demonstração não traz a lista oficial de serviços. Para saber o que está disponível, consulte o canal oficial da concessionária.',
    fonte: 'Conteúdo demonstrativo do Prazy' },
  { id: 'c4', tema: 'servicos', chaves: ['atendimento', 'usuário', 'usuario', 'funciona'],
    resposta: 'O Prazy é um guia informativo de demonstração. Ele não abre chamados nem aciona equipes. Para atendimento real, use um canal oficial.',
    fonte: 'Conteúdo demonstrativo do Prazy' },
  { id: 'c5', tema: 'orientacao', chaves: ['acostamento', 'faixa', 'o que é'],
    resposta: 'O acostamento é a área ao lado da pista usada em situações de necessidade. Regras de uso são definidas pela legislação e pela concessionária.',
    fonte: 'Conteúdo demonstrativo do Prazy (texto genérico, não oficial)' },
  { id: 'c6', tema: 'orientacao', chaves: ['ajuda', 'socorro', 'pedir', 'emergência', 'emergencia'],
    resposta: 'Em emergência, procure imediatamente os serviços oficiais de emergência. Esta demonstração não substitui esses serviços e não consegue chamar ajuda.',
    fonte: 'Conteúdo demonstrativo do Prazy' },
]
