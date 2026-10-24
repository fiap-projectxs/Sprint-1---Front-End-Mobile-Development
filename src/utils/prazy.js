import { CONTEUDO_PRAZY } from '../data/prazy.js'

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export const RESPOSTA_SEM_FONTE =
  'Não consigo confirmar isso com o conteúdo desta demonstração. Procure um canal oficial da concessionária para uma resposta confiável. Não vou inventar telefone, link, horário ou condição da via.'

// Procura a melhor entrada da base demonstrativa; sem correspondência, não inventa.
export function responderPrazy(pergunta, temaId) {
  const q = norm(pergunta)
  let melhor = null
  let pontos = 0
  for (const item of CONTEUDO_PRAZY) {
    let p = item.chaves.reduce((acc, ch) => acc + (q.includes(norm(ch)) ? 1 : 0), 0)
    if (p > 0 && item.tema === temaId) p += 0.5
    if (p > pontos) { pontos = p; melhor = item }
  }
  if (!melhor) return { texto: RESPOSTA_SEM_FONTE, fonte: null }
  return { texto: melhor.resposta, fonte: melhor.fonte }
}
