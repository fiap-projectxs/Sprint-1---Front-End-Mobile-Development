import {
  aplicarRespostaPergunta,
  camposVazios,
  extrairCampos,
  mesclarCampos,
  proximaPergunta,
  resumirCampos,
  ORDEM_CAMPOS,
} from './extrair.js'

export const AVISO_RALY =
  'Demonstração. O Raly organiza relatos para revisão humana. Esta versão não substitui procedimentos oficiais nem serviços de emergência e não envia nada a equipes, ao CCO ou a sistemas reais.'

export const EXEMPLOS_RALY = [
  'Registrar vegetação alta no km 42.',
  'Há um veículo parado no acostamento, sentido interior.',
  'Consultar informações de uma ocorrência fictícia.',
]

export const OCORRENCIA_FICTICIA = {
  id: 'OC-DEMO-01',
  descricao: 'Veículo parado, DEMO-101, km 82, sentido interior, município Exemplo C.',
  situacao: 'Informação simulada. Não foi verificada nem confirmada por nenhuma fonte real.',
}

export function estadoInicialRaly() {
  return { campos: camposVazios(), pergunta: null, relatos: 0 }
}

function temAlgumCampo(c) {
  return ORDEM_CAMPOS.some((k) => c[k].estado !== 'nao_informado')
}

// Recebe a mensagem e o estado atual da conversa. Devolve a resposta e o novo estado.
export function responderRaly(texto, estado) {
  const t = texto.trim()

  if (/consultar.*ocorr[eê]ncia/i.test(t) || /\bOC-DEMO-01\b/i.test(t)) {
    return {
      estado,
      resposta: `Encontrei a ocorrência fictícia ${OCORRENCIA_FICTICIA.id}: ${OCORRENCIA_FICTICIA.descricao} ${OCORRENCIA_FICTICIA.situacao}`,
      fonte: 'simulada',
      consulta: true,
    }
  }

  const novos = extrairCampos(t)
  let campos = estado.campos
  const trouxeCampos = temAlgumCampo(novos)

  if (estado.pergunta && !trouxeCampos) {
    campos = aplicarRespostaPergunta(campos, estado.pergunta, t)
  } else {
    campos = mesclarCampos(campos, novos)
    // Resposta curta a uma pergunta que também trouxe algum campo (ex.: "interior")
    if (estado.pergunta && campos[estado.pergunta].estado === 'nao_informado') {
      campos = aplicarRespostaPergunta(campos, estado.pergunta, t)
    }
  }

  if (!temAlgumCampo(campos)) {
    return {
      estado: { ...estado, campos, pergunta: 'tipo', relatos: estado.relatos + 1 },
      resposta:
        'Ainda não identifiquei uma ocorrência no que você escreveu. Qual é o tipo de ocorrência? Por exemplo: veículo parado, vegetação alta ou acidente.',
      fonte: 'relato',
      semOcorrencia: true,
    }
  }

  const prox = proximaPergunta(campos)
  const resumo = resumirCampos(campos)
  const primeira = estado.relatos === 0
  let resposta = resumo ? `Entendi: ${resumo}. ` : 'Anotei o que você informou. '
  if (prox) {
    resposta += prox.texto
    if (primeira) resposta += ' Não consigo confirmar a ocorrência por conta própria; vou organizar o relato para revisão.'
  } else {
    resposta +=
      'Os campos principais estão preenchidos a partir do seu relato. Não consigo confirmar a ocorrência: o cartão abaixo vai para revisão humana.'
  }

  return {
    estado: { campos, pergunta: prox ? prox.campo : null, relatos: estado.relatos + 1 },
    resposta,
    fonte: 'relato',
  }
}
