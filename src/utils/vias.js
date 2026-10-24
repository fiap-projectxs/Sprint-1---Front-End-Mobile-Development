import { RODOVIAS_ESTADUAIS, RODOVIAS_FEDERAIS, TELEFONES_EMERGENCIA, UFS } from '../data/rodovias.js'
import { norm } from './comandos.js'

// Regra de numeração das rodovias federais (BR-xxx): o primeiro dígito indica a categoria.
export function classificarBR(n) {
  const num = Number(n)
  if (!Number.isInteger(num) || num < 10 || num > 499) return null
  if (num < 100) return { categoria: 'Radial', texto: `A BR-${String(num).padStart(3, '0')} é radial: parte de Brasília rumo a capitais e fronteiras. Numeração de 010 a 090.` }
  const d = Math.floor(num / 100)
  if (d === 1) return { categoria: 'Longitudinal', texto: `A BR-${num} é longitudinal: corre no sentido norte-sul. Os números crescem de leste para oeste (BR-101 no litoral, BR-153 e BR-163 no interior).` }
  if (d === 2) return { categoria: 'Transversal', texto: `A BR-${num} é transversal: corre no sentido leste-oeste. Os números crescem de norte para sul (BR-230 mais ao norte, BR-290 no extremo sul).` }
  if (d === 3) return { categoria: 'Diagonal', texto: `A BR-${num} é diagonal: ${num % 2 === 0 ? 'número par, direção noroeste a sudeste... ' : 'número ímpar, direção nordeste a sudoeste... '}`.replace('... ', '.') + ' Numeração de 300 a 398.' }
  return { categoria: 'Ligação', texto: `A BR-${num} é de ligação: conecta pontos importantes entre outras rodovias, capitais ou fronteiras. Numeração de 400 a 497.` }
}

const nomeUFs = (ufs) => ufs.map((s) => UFS.find((u) => u.sigla === s)?.nome || s).join(', ')

// Responde a uma pergunta sobre uma via. Devolve null se o texto não trouxer uma via reconhecível.
export function consultarVia(texto) {
  const t = norm(texto)
  const br = t.match(/\bbr[- ]?0*(\d{2,3})\b/)
  if (br) {
    const num = Number(br[1])
    const r = RODOVIAS_FEDERAIS.find((x) => x.numero === num)
    const cl = classificarBR(num)
    if (r) {
      return `BR-${String(num).padStart(3, '0')}${r.nome.startsWith('BR-') ? '' : `, ${r.nome}`}. Trecho: ${r.trecho}. Estados: ${nomeUFs(r.ufs)}. ${r.nota}${cl ? ` Categoria: ${cl.categoria}.` : ''}`
    }
    if (cl) return `${cl.texto} Não tenho o traçado detalhado dessa rodovia na minha base. Consulte o DNIT ou o PNV.`
    return 'Esse número não existe na numeração das rodovias federais, que vai de BR-010 a BR-497.'
  }
  const est = t.match(/\b(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)[- ]0*(\d{1,3})\b/)
  if (est) {
    const uf = est[1].toUpperCase()
    const num = Number(est[2])
    const r = RODOVIAS_ESTADUAIS.find((x) => x.uf === uf && x.numero === num)
    const nome = UFS.find((u) => u.sigla === uf)?.nome
    if (r) return `${uf}-${String(num).padStart(3, '0')}, ${r.nome}. Trecho: ${r.trecho}. ${r.nota}`
    return `${uf}-${String(num).padStart(3, '0')} é rodovia estadual de ${nome}, mas não tenho o traçado dela na minha base. Consulte o órgão rodoviário do estado.`
  }
  const nomeado = [...RODOVIAS_FEDERAIS, ...RODOVIAS_ESTADUAIS].find((r) => {
    const apelidos = (r.apelidos || []).map(norm)
    return apelidos.some((a) => t.includes(a))
  })
  if (nomeado) {
    const rot = nomeado.uf ? `${nomeado.uf}-${String(nomeado.numero).padStart(3, '0')}` : `BR-${String(nomeado.numero).padStart(3, '0')}`
    return `${nomeado.nome} é a ${rot}. Trecho: ${nomeado.trecho}. ${nomeado.nota}`
  }
  const uf = UFS.find((u) => new RegExp(`\\b${norm(u.nome)}\\b`).test(t))
  if (uf && /\b(rodovias?|estradas?|vias)\b/.test(t)) {
    const fed = RODOVIAS_FEDERAIS.filter((r) => r.ufs.includes(uf.sigla)).map((r) => `BR-${String(r.numero).padStart(3, '0')}`)
    const est2 = RODOVIAS_ESTADUAIS.filter((r) => r.uf === uf.sigla).map((r) => `${r.uf}-${String(r.numero).padStart(3, '0')}`)
    return `${uf.nome}, capital ${uf.capital}. Rodovias estaduais levam o prefixo ${uf.sigla}. Federais que passam por lá: ${fed.join(', ') || 'consulte o DNIT'}.${est2.length ? ` Estaduais conhecidas: ${est2.join(', ')}.` : ''}`
  }
  if (/\b(telefones?|numero|emergencia|socorro)\b/.test(t)) {
    return `Telefones úteis na estrada: ${TELEFONES_EMERGENCIA.map(([n, v]) => `${n}, ${v}`).join('; ')}.`
  }
  return null
}
