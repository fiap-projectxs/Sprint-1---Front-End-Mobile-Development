// Cliente do servidor local do Raly (raly-local/server.py): vozes Piper offline e ponte para o Ollama.
// Tudo em 127.0.0.1. Se o servidor não estiver rodando, o app volta para a voz do navegador e para as regras.
const BASE = 'http://127.0.0.1:8765'

let cache = null // { quando, valor }

async function comTempo(url, opcoes = {}, ms = 1500) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  try { return await fetch(url, { ...opcoes, signal: ctl.signal }) } finally { clearTimeout(t) }
}

// { perfis: { id: { rotulo, descricao, pronto } }, llm: { ok, modelo } } ou null se o servidor local não responde.
export async function statusLocal(forcar = false) {
  if (!forcar && cache && Date.now() - cache.quando < 15000) return cache.valor
  let valor = null
  try {
    const r = await comTempo(`${BASE}/api/status`)
    if (r.ok) valor = await r.json()
  } catch { /* servidor local desligado */ }
  cache = { quando: Date.now(), valor }
  return valor
}

// Devolve um <audio> pronto para tocar, com a voz do perfil (padrao, motorista, alerta, noturno).
export async function falarLocal(perfil, texto) {
  const r = await comTempo(`${BASE}/api/tts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ perfil, texto }),
  }, 30000)
  if (!r.ok) throw new Error('tts local indisponível')
  const url = URL.createObjectURL(await r.blob())
  const audio = new Audio(url)
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
  return audio
}

// Reconhecimento de voz offline (Whisper no servidor local). Recebe o áudio gravado e devolve o texto.
export async function transcreverLocal(blob) {
  const r = await comTempo(`${BASE}/api/stt`, { method: 'POST', body: blob }, 120000)
  if (!r.ok) throw new Error('reconhecimento local indisponível')
  return ((await r.json()).texto || '').trim()
}

// Pergunta ao modelo do seu Ollama (via servidor local). Devolve { texto, modelo }.
export async function perguntarLLM(mensagem, historico = []) {
  const r = await comTempo(`${BASE}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensagem, historico }),
  }, 120000)
  if (!r.ok) throw new Error('modelo local indisponível')
  return r.json()
}
