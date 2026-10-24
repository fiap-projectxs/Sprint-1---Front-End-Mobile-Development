// Dados de demonstração (fictícios). Fica separado do código da plataforma.
export const TICKETS_INICIAIS = [
  { id: 'TK-0101', titulo: 'Veículo parado no acostamento', categoria: 'Trânsito', prioridade: 'Média', status: 'Em andamento', trecho: 'DEMO-101 · km 42 · sentido interior', equipe: 'Inspeção de Tráfego', abertura: '2026-10-24T07:55:00', origem: 'Relato (simulado)',
    historico: [
      { quando: '2026-10-24T07:55:00', autor: 'Raly (simulado)', texto: 'Ticket de demonstração criado a partir de relato. Aguardando revisão humana.' },
      { quando: '2026-10-24T08:05:00', autor: 'Operador Demo', texto: 'Revisão visual confirmada (simulação). Nada foi enviado a sistemas reais.' },
    ] },
  { id: 'TK-0102', titulo: 'Vegetação alta na faixa de domínio', categoria: 'Manutenção', prioridade: 'Baixa', status: 'Aberto', trecho: 'DEMO-101 · km 55 · sentido interior', equipe: 'Conservação', abertura: '2026-10-24T07:42:00', origem: 'Relato (simulado)',
    historico: [{ quando: '2026-10-24T07:42:00', autor: 'Raly (simulado)', texto: 'Ticket de demonstração criado. Campo "município" não informado.' }] },
  { id: 'TK-0103', titulo: 'Registro sem sentido da via', categoria: 'Registro incompleto', prioridade: 'Média', status: 'Aguardando informação', trecho: 'DEMO-205 · km 18', equipe: 'Supervisão de Operações', abertura: '2026-10-24T06:30:00', origem: 'Revisão de registros',
    historico: [{ quando: '2026-10-24T06:30:00', autor: 'Sistema (simulado)', texto: 'Campo obrigatório ausente: sentido da via. Pergunta enviada ao autor do relato (simulação).' }] },
  { id: 'TK-0104', titulo: 'Pendência: horário de chegada do recurso', categoria: 'Pendência de informação', prioridade: 'Alta', status: 'Aberto', trecho: 'DEMO-101 · km 82', equipe: 'Guincho e Recursos', abertura: '2026-10-24T08:20:00', origem: 'Solicitação (SmartDeskAI)',
    historico: [{ quando: '2026-10-24T08:20:00', autor: 'SmartDeskAI (simulado)', texto: 'Solicitação S-2003 gerou este ticket de acompanhamento.' }] },
  { id: 'TK-0105', titulo: 'Apoio para sinalização de serviço', categoria: 'Apoio operacional', prioridade: 'Média', status: 'Resolvido', trecho: 'DEMO-205 · km 30', equipe: 'Conservação', abertura: '2026-10-23T14:10:00', origem: 'Relato (simulado)',
    historico: [
      { quando: '2026-10-23T14:10:00', autor: 'Operador Demo', texto: 'Solicitação de apoio registrada.' },
      { quando: '2026-10-23T16:40:00', autor: 'Operador Demo', texto: 'Atendimento encerrado (dado fictício).' },
    ] },
]
