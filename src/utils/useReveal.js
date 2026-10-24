import { useEffect, useRef, useState } from 'react'

// Sem IntersectionObserver ou com "reduzir movimento", o conteúdo já nasce visível.
const SEM_ANIMACAO = typeof window === 'undefined'
  || typeof IntersectionObserver === 'undefined'
  || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Marca um elemento como "visto" quando entra na tela (animações de entrada ao rolar).
export default function useReveal() {
  const ref = useRef(null)
  const [visto, setVisto] = useState(SEM_ANIMACAO)
  useEffect(() => {
    const el = ref.current
    if (!el || visto) return undefined
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisto(true); obs.disconnect() } }, { threshold: 0.18 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [visto])
  return [ref, visto]
}
