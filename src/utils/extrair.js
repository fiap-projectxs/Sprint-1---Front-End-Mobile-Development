// Extração DEMONSTRATIVA de informações de um relato em texto.
// Só preenche o que está escrito no relato. Nada é completado por suposição.
// Estados: 'informado' | 'confirmar' | 'nao_informado'.
// Toda informação aqui vem do "relato do usuário": nunca é "confirmada".

export const ROTULOS = {
  tipo: 'Tipo de ocorrência',
  rodovia: 'Rodovia',
  km: 'Km ou referência',
  sentido: 'Sentido',
  municipio: 'Município',
  local: 'Faixa / acostamento',
  veiculos: 'Veículos envolvidos',
  fumaca: 'Fumaça ou fogo relatados',
  vitimas: 'Vítimas relatadas',
  apoio: 'Apoio solicitado',
}

export const ORDEM_CAMPOS = ['tipo', 'rodovia', 'km', 'sentido', 'municipio', 'local', 'veiculos', 'fumaca', 'vitimas', 'apoio']

// Ordem em que o Raly pergunta o que falta (uma pergunta por vez).
const PERGUNTAS = [
  ['tipo', 'Qual é o tipo de ocorrência? Por exemplo: veículo parado, vegetação alta ou acidente.'],
  ['rodovia', 'Em qual rodovia isso acontece?'],
  ['km', 'Qual é o km ou uma referência próxima?'],
  ['sentido', 'Qual é o sentido da via?'],
  ['municipio', 'Qual é o município ou uma referência próxima?'],
  ['local', 'O veículo ou a situação está na faixa ou no acostamento?'],
  ['vitimas', 'Há vítimas relatadas? Responda “sim”, “não” ou “não sei”.'],
]

const TIPOS = [
  [/vegeta[cç][aã]o/i, 'Vegetação alta'],
  [/acidente|colis[aã]o|batida|capot/i, 'Possível acidente'],
  [/(ve[ií]culo|carro|caminh[aã]o|carreta|[oô]nibus|moto).{0,25}(parad|pane|quebrad)|pane/i, 'Veículo parado'],
  [/animal/i, 'Animal na pista'],
  [/buraco|afundamento/i, 'Defeito no pavimento'],
  [/objeto|carga caída|pedra|entulho/i, 'Objeto na pista'],
  [/fuma[cç]a|inc[eê]ndio|fogo|chamas/i, 'Fumaça ou fogo relatados'],
]

const vazio = () => ({ valor: '', estado: 'nao_informado' })

export function camposVazios() {
  return Object.fromEntries(ORDEM_CAMPOS.map((c) => [c, vazio()]))
}

export function extrairCampos(texto) {
  const t = texto || ''
  const c = camposVazios()
  const set = (campo, valor, estado = 'informado') => { c[campo] = { valor, estado } }

  for (const [re, nome] of TIPOS) if (re.test(t)) { set('tipo', nome); break }

  const rod = t.match(/\b(DEMO|SP|BR)[-\s]?(\d{2,3})\b/i)
  if (rod) set('rodovia', `${rod[1].toUpperCase()}-${rod[2]}`)

  const km = t.match(/\bkm\.?\s*(\d{1,3}(?:[.,]\d+)?)/i)
  if (km) set('km', `km ${km[1].replace(',', '.')}`, rod ? 'informado' : 'confirmar')
  else if (/\b(ponte|viaduto|pra[cç]a de ped[aá]gio|retorno|trevo|acesso)\b/i.test(t)) set('km', t.match(/\b(ponte|viaduto|pra[cç]a de ped[aá]gio|retorno|trevo|acesso)\b/i)[0], 'confirmar')

  const sent = t.match(/sentido\s+(interior|capital|norte|sul|leste|oeste|crescente|decrescente)/i) || t.match(/\b(interior|capital)\b/i)
  if (sent) set('sentido', sent[1].toLowerCase())

  const mun = t.match(/munic[ií]pio de ([A-ZÀ-Ú][\wÀ-ú]+(?: [A-ZÀ-Ú][\wÀ-ú]+)*)/) || t.match(/cidade de ([A-ZÀ-Ú][\wÀ-ú]+(?: [A-ZÀ-Ú][\wÀ-ú]+)*)/)
  if (mun) set('municipio', mun[1])

  const local = t.match(/acostamento|faixa (?:da )?(direita|esquerda|central)|faixa \d/i)
  if (local) set('local', local[0].toLowerCase())

  const veic = t.match(/(\d+|um|uma|dois|duas|tr[eê]s)?\s*(carros?|caminh[oõ]es|caminh[aã]o|carretas?|[oô]nibus|motos?|ve[ií]culos?)/i)
  if (veic) set('veiculos', `${(veic[1] || '').trim()} ${veic[2]}`.trim().toLowerCase(), veic[1] ? 'informado' : 'confirmar')

  if (/sem fuma[cç]a|sem fogo|n[aã]o (h[aá]|tem) (fuma[cç]a|fogo)/i.test(t)) set('fumaca', 'Não relatado', 'confirmar')
  else if (/fuma[cç]a|fogo|inc[eê]ndio|chamas/i.test(t)) set('fumaca', 'Relatado', 'confirmar')

  if (/sem v[ií]timas|n[aã]o h[aá] v[ií]timas|ningu[eé]m ferido|sem feridos/i.test(t)) set('vitimas', 'Nenhuma relatada', 'confirmar')
  else if (/v[ií]timas?|ferid[oa]s?|machucad/i.test(t)) set('vitimas', 'Relatadas', 'confirmar')

  const apoios = []
  if (/guincho|reboque/i.test(t)) apoios.push('guincho')
  if (/ambul[aâ]ncia|samu|aph|resgate|socorro m[eé]dico/i.test(t)) apoios.push('atendimento médico')
  if (/bombeiro/i.test(t)) apoios.push('bombeiros')
  if (/conserva[cç][aã]o|ro[cç]ada/i.test(t)) apoios.push('conservação')
  if (apoios.length) set('apoio', apoios.join(', '), 'confirmar')

  return c
}

// Une campos já preenchidos (de mensagens anteriores) com os novos. O novo vale se informado.
export function mesclarCampos(antigos, novos) {
  const r = { ...antigos }
  for (const k of ORDEM_CAMPOS) if (novos[k].estado !== 'nao_informado') r[k] = novos[k]
  return r
}

// Responde a uma pergunta pendente com texto curto ("sim", "interior", "km 42"...).
export function aplicarRespostaPergunta(campos, pergunta, texto) {
  const r = { ...campos }
  const t = texto.trim()
  if (!pergunta || !t) return r
  if (pergunta === 'vitimas') {
    if (/^(n[aã]o|nao|nenhuma|ningu[eé]m)/i.test(t)) r.vitimas = { valor: 'Nenhuma relatada', estado: 'confirmar' }
    else if (/^(sim|h[aá]|tem)/i.test(t)) r.vitimas = { valor: 'Relatadas', estado: 'confirmar' }
    else if (/n[aã]o sei|incerto/i.test(t)) r.vitimas = { valor: 'Incerto, precisa confirmar', estado: 'confirmar' }
  } else if (pergunta === 'municipio' || pergunta === 'local' || pergunta === 'sentido' || pergunta === 'rodovia' || pergunta === 'km') {
    const lim = t.replace(/^(é|e|no|na|em|sentido|km)\s+/i, '')
    r[pergunta] = { valor: pergunta === 'km' && /^\d/.test(lim) ? `km ${lim}` : lim, estado: 'informado' }
  } else if (pergunta === 'tipo') {
    r.tipo = { valor: t, estado: 'informado' }
  }
  return r
}

export function proximaPergunta(campos) {
  for (const [campo, texto] of PERGUNTAS) {
    if (campos[campo].estado === 'nao_informado') return { campo, texto }
  }
  return null
}

export function resumirCampos(campos) {
  const partes = []
  const v = (k) => (campos[k].estado !== 'nao_informado' ? campos[k].valor : null)
  if (v('tipo')) partes.push(v('tipo').toLowerCase())
  if (v('local')) partes.push(v('local'))
  const lugar = [v('rodovia'), v('km')].filter(Boolean).join(', ')
  if (lugar) partes.push(`em ${lugar}`)
  if (v('sentido')) partes.push(`sentido ${v('sentido')}`)
  if (v('municipio')) partes.push(`município ${v('municipio')}`)
  if (v('fumaca') === 'Relatado') partes.push('com fumaça ou fogo relatados')
  return partes.join(', ')
}
