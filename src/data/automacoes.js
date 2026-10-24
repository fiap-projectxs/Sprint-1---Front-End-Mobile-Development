// Regras de automação DEMONSTRATIVAS. Elas só criam registros locais para revisão humana;
// nenhuma delas envia algo a equipes, ao CCO ou a sistemas reais.
export const AUTOMACOES_PADRAO = [
  {
    id: 'pendencias',
    titulo: 'Relato revisado com campos faltando → abrir ticket de pendência',
    descricao: 'Quando uma revisão é confirmada e ainda há campos “não informados”, o TicketRal recebe um ticket de “Registro incompleto” listando o que falta.',
    ligada: true,
  },
  {
    id: 'ocorrencia',
    titulo: 'Revisão confirmada → guardar a ocorrência na lista do Raly',
    descricao: 'A ocorrência revisada aparece em Raly › Ocorrências, com data, campos e o ticket relacionado.',
    ligada: true,
  },
  {
    id: 'alerta',
    titulo: 'Ticket de prioridade alta ainda aberto → alerta na Visão geral',
    descricao: 'A Visão geral destaca tickets de prioridade alta que continuam com status “Aberto”.',
    ligada: true,
  },
]
