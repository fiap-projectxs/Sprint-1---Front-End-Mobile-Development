// Etapas do fluxo de emergência (resumo dos documentos de apoio), usadas só como SIMULAÇÃO visual.
export const ETAPAS_FLUXO = [
  { id: 1, titulo: 'Identificação da ocorrência', quem: 'Agente de campo', nota: 'Relato por voz ou texto; o Raly organiza as informações.' },
  { id: 2, titulo: 'Comunicação ao CCO', quem: 'CCO', nota: 'No mundo real, o CCO recebe e avalia. Nesta demo, nada é enviado.' },
  { id: 3, titulo: 'Avaliação e mobilização de recursos', quem: 'CCO / Supervisão', nota: 'Decisão humana. O Raly não decide gravidade nem despacha equipes.' },
  { id: 4, titulo: 'Acompanhamento do atendimento', quem: 'Recursos em campo', nota: 'Chegada, condições e etapas registradas por quem atende.' },
  { id: 5, titulo: 'Encerramento e registro', quem: 'CCO', nota: 'Relatório conclusivo elaborado por pessoas.' },
]

export const PERSONAS = [
  { id: 1, nome: 'Agente de Inspeção de Tráfego', foco: 'Registro e condução de ocorrências no trecho' },
  { id: 2, nome: 'Agente de Guincho / Recurso Operacional', foco: 'Execução e atualização dos atendimentos de apoio' },
  { id: 3, nome: 'Agente de APH', foco: 'Apoio informacional e registro do atendimento em campo' },
  { id: 4, nome: 'Supervisor de Operações', foco: 'Coordenação tática, priorização e exceções' },
  { id: 5, nome: 'Coordenador / Gerente de Operações', foco: 'Visão consolidada e apoio à decisão' },
]
