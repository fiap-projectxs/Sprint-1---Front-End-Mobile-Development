import { useEffect, useRef } from 'react'

// Fundo 3D global (three.js): rodovia em perspectiva com faixas tracejadas vindo na direção da câmera,
// grade luminosa, partículas azul/roxo/ciano e leve paralaxe com o ponteiro. Fica atrás de todas as páginas.
// Sem WebGL ou com "reduzir movimento": um quadro estático. Pausa com a aba oculta.
function temWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function Fundo3D() {
  const caixa = useRef(null)

  useEffect(() => {
    const el = caixa.current
    if (!el || !temWebGL()) return undefined
    let cancelado = false
    let limpar = () => {}
    import('three').then((THREE) => {
      if (cancelado) return
      const reduzir = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

      const cena = new THREE.Scene()
      cena.fog = new THREE.FogExp2(0x1b2e49, 0.045)
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120)
      camera.position.set(0, 1.6, 6)
      camera.lookAt(0, 1.2, -20)

      // Pista: plano escuro + bordas e faixa central tracejada que correm em loop.
      const grupo = new THREE.Group(); cena.add(grupo)
      const COMP = 80
      const pista = new THREE.Mesh(new THREE.PlaneGeometry(9, COMP), new THREE.MeshBasicMaterial({ color: 0x14233a, transparent: true, opacity: 0.55 }))
      pista.rotation.x = -Math.PI / 2; pista.position.set(0, 0, -COMP / 2 + 8); grupo.add(pista)
      const matBorda = new THREE.MeshBasicMaterial({ color: 0x7fe0f0 })
      for (const x of [-4.4, 4.4]) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, COMP), matBorda)
        b.position.set(x, 0.02, -COMP / 2 + 8); grupo.add(b)
      }
      const matFaixa = new THREE.MeshBasicMaterial({ color: 0x3fb3cc })
      const faixas = []
      const PASSO = 4
      for (let i = 0; i < COMP / PASSO; i += 1) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 1.6), matFaixa)
        f.position.set(0, 0.025, 8 - i * PASSO); grupo.add(f); faixas.push(f)
      }
      // Grade lateral (laterais da estrada) para dar profundidade.
      const grade = new THREE.GridHelper(120, 60, 0x0b6f86, 0x2c3e57)
      grade.position.y = -0.01; grade.material.transparent = true; grade.material.opacity = 0.35; cena.add(grade)

      // Partículas flutuantes.
      const N = 420
      const pos = new Float32Array(N * 3); const cor = new Float32Array(N * 3)
      const paleta = [new THREE.Color(0x5fd0e6), new THREE.Color(0x3fb3cc), new THREE.Color(0x7fe0f0)]
      for (let i = 0; i < N; i += 1) {
        pos[i * 3] = (Math.random() - 0.5) * 60
        pos[i * 3 + 1] = Math.random() * 18 + 0.5
        pos[i * 3 + 2] = -Math.random() * 70 + 6
        const c = paleta[i % 3]; cor.set([c.r, c.g, c.b], i * 3)
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(cor, 3))
      const pontos = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true }))
      cena.add(pontos)

      let px = 0; let py = 0
      const aoMover = (e) => { px = (e.clientX / window.innerWidth - 0.5) * 2; py = (e.clientY / window.innerHeight - 0.5) * 2 }
      window.addEventListener('pointermove', aoMover, { passive: true })
      const ajustar = () => {
        const w = el.clientWidth || 1; const h = el.clientHeight || 1
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
      }
      ajustar()
      const ro = new ResizeObserver(ajustar); ro.observe(el)

      const relogio = new THREE.Clock()
      let raf = 0
      const quadro = () => {
        if (!reduzir) raf = requestAnimationFrame(quadro)
        if (document.hidden) return
        const t = relogio.getElapsedTime()
        const desloc = (t * 6) % PASSO
        faixas.forEach((f, i) => { f.position.z = 8 - i * PASSO + desloc })
        grade.position.z = (t * 6) % 2
        pontos.rotation.y = t * 0.012
        camera.position.x += (px * 0.8 - camera.position.x) * 0.04
        camera.position.y += (1.6 - py * 0.35 - camera.position.y) * 0.04
        camera.lookAt(0, 1.2, -20)
        renderer.render(cena, camera)
      }
      quadro()

      limpar = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('pointermove', aoMover)
        ro.disconnect()
        cena.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.() })
        renderer.dispose(); renderer.domElement.remove()
      }
    }).catch(() => {})
    return () => { cancelado = true; limpar() }
  }, [])

  return <div ref={caixa} className="fundo3d" aria-hidden="true" />
}
