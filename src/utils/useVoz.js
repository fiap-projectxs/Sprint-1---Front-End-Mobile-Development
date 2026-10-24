import { useCallback, useEffect, useRef, useState } from 'react'
import { falarLocal, statusLocal, transcreverLocal } from './local.js'

// Voz pelo navegador (Web Speech API). Reconhecimento: SpeechRecognition (pt-BR).
// Fala: speechSynthesis. A aplicação não grava nem envia áudio; o processamento do
// reconhecimento é feito pelo navegador e, no Chrome/Edge, normalmente por serviço online.
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
const TEM_FALA = typeof window !== 'undefined' && 'speechSynthesis' in window

// Nomes de vozes pt conhecidos, usados para separar feminina e masculina (o navegador não informa o gênero).
const NOMES_FEM = /francisca|maria|luciana|fernanda|vit[oó]ria|helo[ií]sa|camila|brenda|elza|leila|raquel|thalita|yara|giovanna|manuela|google.*portugu/i
const NOMES_MASC = /antonio|ant[oô]nio|daniel|felipe|ricardo|donato|humberto|val[eé]rio|fabio|julio|nicolau|cl[aá]udio/i
// As vozes do navegador carregam de forma assíncrona: espera até 1,5 s por elas.
function aguardarVozes() {
  return new Promise((resolve) => {
    if (!TEM_FALA || window.speechSynthesis.getVoices().length > 0) { resolve(); return }
    const fim = () => { window.speechSynthesis.removeEventListener?.('voiceschanged', fim); resolve() }
    window.speechSynthesis.addEventListener?.('voiceschanged', fim)
    setTimeout(fim, 1500)
  })
}

const PERFIL_PADRAO = { genero: 'feminina', velocidade: 1, tom: 1, perfilLocal: 'feminina' }
const CHAVE_PERFIL = 'raly:voz'

function lerPerfil() {
  try {
    const bruto = window.localStorage.getItem(CHAVE_PERFIL)
    return bruto ? { ...PERFIL_PADRAO, ...JSON.parse(bruto) } : PERFIL_PADRAO
  } catch { return PERFIL_PADRAO }
}

function vozesPt() {
  if (!TEM_FALA) return []
  const todas = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('pt'))
  const br = todas.filter((v) => v.lang.toLowerCase().replace('_', '-') === 'pt-br')
  return br.length ? br : todas
}

const ordenar = (l) => [...l].sort((a, b) => Number(/natural|online/i.test(b.name)) - Number(/natural|online/i.test(a.name)))

// Escolhe a melhor voz em português para o gênero pedido. exato=false quando só há voz do outro gênero.
function escolherVozPt(genero = 'feminina') {
  const lista = vozesPt()
  if (!lista.length) return { voz: null, exato: false }
  const alvo = genero === 'masculina' ? NOMES_MASC : NOMES_FEM
  const outro = genero === 'masculina' ? NOMES_FEM : NOMES_MASC
  const exatas = ordenar(lista.filter((v) => alvo.test(v.name)))
  if (exatas.length) return { voz: exatas[0], exato: true }
  const neutras = ordenar(lista.filter((v) => !outro.test(v.name)))
  return { voz: (neutras[0] || ordenar(lista)[0]), exato: false }
}

const MENSAGENS_ERRO = {
  'not-allowed': 'Permissão do microfone negada. Libere o microfone no navegador para usar a voz.',
  'service-not-allowed': 'O navegador bloqueou o serviço de voz. Tente no Chrome ou Edge.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale de novo.',
  'audio-capture': 'Nenhum microfone encontrado.',
  network: 'O reconhecimento de voz do navegador precisa de internet e não conseguiu conectar.',
}

export default function useVoz({ aoOuvir, continuo }) {
  const [ouvindo, setOuvindo] = useState(false)
  const [parcial, setParcial] = useState('')
  const [erro, setErro] = useState('')
  const [falando, setFalando] = useState(false)
  // null = ainda verificando (as vozes do navegador carregam depois).
  const [vozPt, setVozPt] = useState(() => (TEM_FALA && window.speechSynthesis.getVoices().length > 0 ? !!escolherVozPt().voz : null))
  const [perfil, setPerfilEstado] = useState(lerPerfil)
  const vozPtFinal = useRef(false)
  const perfilRef = useRef(perfil)
  useEffect(() => { perfilRef.current = perfil }, [perfil])
  const setPerfil = useCallback((mudanca) => {
    setPerfilEstado((p) => {
      const novo = { ...p, ...mudanca }
      try { window.localStorage.setItem(CHAVE_PERFIL, JSON.stringify(novo)) } catch { /* sem armazenamento: vale só nesta sessão */ }
      return novo
    })
  }, [])
  // Servidor local (vozes Piper offline + Ollama). null = não encontrado: usa a voz do navegador.
  const [local, setLocal] = useState(null)
  const localRef = useRef(null)
  const audioRef = useRef(null)
  useEffect(() => { localRef.current = local }, [local])
  useEffect(() => {
    let ativo = true
    statusLocal().then((s) => { if (ativo) setLocal(s) })
    return () => { ativo = false }
  }, [])
  const recRef = useRef(null)
  const querOuvirRef = useRef(false)
  const aoOuvirRef = useRef(aoOuvir)
  useEffect(() => { aoOuvirRef.current = aoOuvir }, [aoOuvir])

  const parar = useCallback(() => {
    querOuvirRef.current = false
    recRef.current?.stop?.()
    setOuvindo(false)
    setParcial('')
  }, [])

  // Reconhecimento offline: grava o microfone, detecta o fim da fala pelo silêncio e manda ao Whisper local.
  // Funciona em qualquer navegador (inclusive Brave, que bloqueia o reconhecimento online).
  const iniciarLocalRef = useRef(null)
  const iniciarLocal = useCallback(async () => {
    setErro('')
    querOuvirRef.current = true
    if (TEM_FALA) window.speechSynthesis.cancel()
    audioRef.current?.pause?.()
    let stream
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) } catch { setErro(MENSAGENS_ERRO['not-allowed']); querOuvirRef.current = false; return }
    const ctx = new AudioContext()
    const analisador = ctx.createAnalyser()
    analisador.fftSize = 1024
    ctx.createMediaStreamSource(stream).connect(analisador)
    const amostras = new Uint8Array(analisador.fftSize)
    const gravador = new MediaRecorder(stream)
    const pedacos = []
    gravador.ondataavailable = (e) => { if (e.data.size) pedacos.push(e.data) }
    let falou = false
    let ultimoSom = Date.now()
    const inicio = Date.now()
    const medir = setInterval(() => {
      analisador.getByteTimeDomainData(amostras)
      let soma = 0
      for (const v of amostras) { const x = (v - 128) / 128; soma += x * x }
      const agora = Date.now()
      if (Math.sqrt(soma / amostras.length) > 0.03) { falou = true; ultimoSom = agora }
      const acabou = !querOuvirRef.current || (falou && agora - ultimoSom > 1100) || agora - inicio > 15000 || (!falou && agora - inicio > 8000)
      if (acabou) { clearInterval(medir); if (gravador.state !== 'inactive') gravador.stop() }
    }, 100)
    gravador.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      ctx.close().catch(() => {})
      if (falou && pedacos.length) {
        setParcial('Transcrevendo…')
        try {
          const texto = await transcreverLocal(new Blob(pedacos, { type: gravador.mimeType }))
          if (texto) aoOuvirRef.current?.(texto, 'voz')
        } catch { setErro('Não consegui transcrever. O servidor local está ligado e com o reconhecimento instalado? Rode o iniciar.bat de novo.') }
      }
      setParcial('')
      if (continuo && querOuvirRef.current) iniciarLocalRef.current?.()
      else { querOuvirRef.current = false; setOuvindo(false) }
    }
    gravador.start()
    setOuvindo(true)
    setParcial('Ouvindo…')
  }, [continuo])
  useEffect(() => { iniciarLocalRef.current = iniciarLocal }, [iniciarLocal])

  const iniciar = useCallback(() => {
    if (localRef.current?.stt?.ok) { iniciarLocal(); return }
    if (!SR) { setErro('Este navegador não tem reconhecimento de voz. Use Chrome ou Edge; a entrada por texto continua funcionando.'); return }
    if (TEM_FALA) window.speechSynthesis.cancel() // evita o Raly ouvir a própria fala
    setErro('')
    querOuvirRef.current = true
    const rec = new SR()
    rec.lang = 'pt-BR'
    rec.interimResults = true
    rec.continuous = !!continuo
    rec.onstart = () => setOuvindo(true)
    rec.onresult = (ev) => {
      let final = ''
      let interino = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const txt = ev.results[i][0].transcript
        if (ev.results[i].isFinal) final += txt
        else interino += txt
      }
      setParcial(interino)
      if (final.trim()) aoOuvirRef.current?.(final.trim(), 'voz')
    }
    rec.onerror = (ev) => {
      if (ev.error === 'no-speech' && continuo) return
      if (ev.error === 'network' && localRef.current?.stt?.ok) { querOuvirRef.current = true; iniciarLocalRef.current?.(); return }
      setErro(MENSAGENS_ERRO[ev.error] || `Erro de voz: ${ev.error}`)
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed' || ev.error === 'audio-capture') querOuvirRef.current = false
    }
    rec.onend = () => {
      setParcial('')
      if (continuo && querOuvirRef.current) {
        try { rec.start() } catch { setOuvindo(false) }
      } else {
        querOuvirRef.current = false
        setOuvindo(false)
      }
    }
    recRef.current = rec
    try { rec.start() } catch { setErro('Não foi possível iniciar o microfone.') }
  }, [continuo, iniciarLocal])

  useEffect(() => {
    if (!TEM_FALA) return undefined
    const atualizar = () => { if (window.speechSynthesis.getVoices().length > 0 || vozPtFinal.current) setVozPt(!!escolherVozPt().voz) }
    window.speechSynthesis.addEventListener?.('voiceschanged', atualizar)
    const t = setTimeout(() => { vozPtFinal.current = true; atualizar() }, 1500)
    atualizar()
    return () => { clearTimeout(t); window.speechSynthesis.removeEventListener?.('voiceschanged', atualizar) }
  }, [])

  const seqFala = useRef(0)
  const calar = useCallback(() => {
    seqFala.current += 1
    audioRef.current?.pause?.()
    audioRef.current = null
    if (TEM_FALA) window.speechSynthesis.cancel()
    setFalando(false)
  }, [])

  // Nunca fala com voz de outro idioma: sem voz em português, só mostra o texto e avisa.
  const falar = useCallback(async (texto, opcoes = {}) => {
    if (!texto) return
    const minha = ++seqFala.current
    audioRef.current?.pause?.()
    audioRef.current = null
    // 1º: voz local offline do perfil escolhido (padrao, motorista, alerta, noturno).
    const idLocal = perfilRef.current.perfilLocal
    if (localRef.current?.perfis?.[idLocal]?.pronto) {
      try {
        const audio = await falarLocal(idLocal, texto)
        if (minha !== seqFala.current) return
        // Perfil com "tom" > 1: acelera o áudio sem preservar o tom (voz mais aguda); o servidor já compensa o ritmo.
        const tom = localRef.current.perfis[idLocal].tom || 1
        if (tom !== 1) audio.preservesPitch = false
        audio.playbackRate = perfilRef.current.velocidade * tom
        audio.onplay = () => setFalando(true)
        audio.onended = () => { setFalando(false); opcoes.aoFim?.() }
        audio.onerror = () => { setFalando(false); opcoes.aoFim?.() }
        audioRef.current = audio
        await audio.play()
        return
      } catch { /* servidor local caiu: segue para a voz do navegador */ }
      if (minha !== seqFala.current) return
    }
    if (!TEM_FALA) return
    window.speechSynthesis.cancel()
    await aguardarVozes()
    if (minha !== seqFala.current) return
    const p = perfilRef.current
    const genero = opcoes.papel === 'outra' ? (p.genero === 'feminina' ? 'masculina' : 'feminina') : p.genero
    const { voz: pt, exato } = escolherVozPt(genero)
    if (!pt) {
      setVozPt(false)
      if (opcoes.aoFim) setTimeout(() => { if (minha === seqFala.current) opcoes.aoFim() }, Math.max(1500, texto.length * 60))
      return
    }
    const u = new SpeechSynthesisUtterance(texto)
    u.voice = pt
    u.lang = pt.lang
    u.rate = p.velocidade
    // Sem voz do gênero pedido, o tom é ajustado para aproximar (limite do navegador).
    const ajuste = exato ? 0 : genero === 'masculina' ? -0.35 : 0.2
    u.pitch = Math.min(2, Math.max(0.1, p.tom + ajuste))
    u.onstart = () => setFalando(true)
    u.onend = () => { setFalando(false); opcoes.aoFim?.() }
    u.onerror = (ev) => {
      setFalando(false)
      if (ev.error !== 'interrupted' && ev.error !== 'canceled') opcoes.aoFim?.()
    }
    window.speechSynthesis.speak(u)
  }, [])

  useEffect(() => () => { querOuvirRef.current = false; recRef.current?.abort?.(); audioRef.current?.pause?.(); if (TEM_FALA) window.speechSynthesis.cancel() }, [])

  const localPronto = !!local && Object.values(local.perfis || {}).some((p) => p.pronto)
  return { local, localPronto, suportaReconhecimento: !!SR || !!local?.stt?.ok, suportaFala: TEM_FALA || localPronto, vozPt: localPronto ? true : vozPt, perfil, setPerfil, vozEscolhida: TEM_FALA ? escolherVozPt(perfil.genero) : { voz: null, exato: false }, ouvindo, parcial, erro, falando, iniciar, parar, falar, calar }
}


