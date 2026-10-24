// Trechos e informações operacionais FICTÍCIOS (aba Consultas).
// "DEMO-101" e "DEMO-205" não são rodovias reais.
export const TRECHOS = [
  { id: 'T-01', nome: 'Trecho Demo 01', rodovia: 'DEMO-101', kmInicio: 38, kmFim: 52, sentido: 'Interior / Capital', municipio: 'Município Exemplo A', faixas: 3, situacao: 'Operação normal', observacao: 'Acostamento contínuo. Dado demonstrativo.', atualizado: '24/10/2026 08:00' },
  { id: 'T-02', nome: 'Trecho Demo 02', rodovia: 'DEMO-101', kmInicio: 52, kmFim: 71, sentido: 'Interior / Capital', municipio: 'Município Exemplo B', faixas: 2, situacao: 'Atenção: serviço de conservação', observacao: 'Roçada programada (fictícia) no acostamento sentido interior.', atualizado: '24/10/2026 08:00' },
  { id: 'T-03', nome: 'Trecho Demo 03', rodovia: 'DEMO-101', kmInicio: 71, kmFim: 90, sentido: 'Interior / Capital', municipio: 'Município Exemplo C', faixas: 3, situacao: 'Operação normal', observacao: 'Ponto de apoio demonstrativo no km 82.', atualizado: '24/10/2026 08:00' },
  { id: 'T-04', nome: 'Trecho Demo 04', rodovia: 'DEMO-205', kmInicio: 10, kmFim: 28, sentido: 'Norte / Sul', municipio: 'Município Exemplo D', faixas: 2, situacao: 'Atenção: pista molhada (exemplo)', observacao: 'Texto de exemplo para mostrar um alerta. Não é condição real.', atualizado: '24/10/2026 08:00' },
  { id: 'T-05', nome: 'Trecho Demo 05', rodovia: 'DEMO-205', kmInicio: 28, kmFim: 47, sentido: 'Norte / Sul', municipio: 'Município Exemplo E', faixas: 2, situacao: 'Operação normal', observacao: 'Sem observações na base demonstrativa.', atualizado: '24/10/2026 08:00' },
]

export const PROCEDIMENTOS = [
  { id: 'P-01', titulo: 'Veículo parado no acostamento', resumo: 'Exemplo de roteiro: registrar km, sentido e faixa; verificar riscos relatados; solicitar apoio conforme regra oficial.', fonte: 'Material de apoio do desafio (resumo demonstrativo)' },
  { id: 'P-02', titulo: 'Vegetação alta na faixa de domínio', resumo: 'Exemplo de roteiro: registrar km e lado da via; abrir pendência para a equipe de conservação.', fonte: 'Material de apoio do desafio (resumo demonstrativo)' },
]
