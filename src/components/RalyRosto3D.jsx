import { useEffect, useRef, useState } from 'react'
import RalyRosto from './RalyRosto.jsx'

// Rosto do Raly em 3D (three.js). Segue o ponteiro, pisca, e mexe a boca quando fala.
// Sem WebGL ou com "reduzir movimento": mostra o rosto 2D.
function temWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function RalyRosto3D({ estado = 'pronto', tamanho = 320, className = '' }) {
  const caixa = useRef(null)
  const estadoRef = useRef(estado)
  const [falhou, setFalhou] = useState(() => typeof window === 'undefined' || !temWebGL())
  useEffect(() => { estadoRef.current = estado }, [estado])

  useEffect(() => {
    if (falhou) return undefined
    const el = caixa.current
    if (!el) return undefined
    let cancelado = false
    let limpar = () => {}
    import('three')
      .then(async (THREE) => {
        const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js')
        if (cancelado) return
        const reduzir = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.15
        el.appendChild(renderer.domElement)
        renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

        const cena = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
        camera.position.set(0, 0.55, 10)

        // Luzes: preenchimento, principal, contraluz roxo e luz âmbar da antena.
        cena.add(new THREE.HemisphereLight(0xe6eef5, 0x14304f, 0.9))
        const principal = new THREE.DirectionalLight(0xffffff, 2.4); principal.position.set(3, 4, 6); cena.add(principal)
        const contra = new THREE.PointLight(0x3fb3cc, 60, 20); contra.position.set(-5, 2, -2); cena.add(contra)
        const ciano = new THREE.PointLight(0x7fe0f0, 25, 20); ciano.position.set(5, -2, 3); cena.add(ciano)

        const cabeca = new THREE.Group(); cena.add(cabeca)

        const matRoxo = new THREE.MeshPhysicalMaterial({ color: 0x0b6f86, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.15 })
        const matBranco = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, clearcoat: 0.6 })
        const matViseira = new THREE.MeshPhysicalMaterial({ color: 0x14233a, roughness: 0.08, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.03 })
        const matLilas = new THREE.MeshPhysicalMaterial({ color: 0x3fb3cc, roughness: 0.3, metalness: 0.2, clearcoat: 0.8 })
        const matOlho = new THREE.MeshStandardMaterial({ color: 0x7fe0f0, emissive: 0x5fd0e6, emissiveIntensity: 0.55, roughness: 0.2 })
        const matPupila = new THREE.MeshStandardMaterial({ color: 0x1b2e49, emissive: 0x1b2e49, emissiveIntensity: 0.2 })
        const matLuz = new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xffb020, emissiveIntensity: 1.4 })

        const matCapacete = new THREE.MeshPhysicalMaterial({ color: 0x13869f, roughness: 0.18, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05 })
        const matAba = new THREE.MeshPhysicalMaterial({ color: 0x0a5568, roughness: 0.22, metalness: 0.3, clearcoat: 1 })
        // Aro branco e corpo da cabeça.
        const aro = new THREE.Mesh(new RoundedBoxGeometry(3.0, 2.5, 1.9, 8, 0.78), matBranco); cabeca.add(aro)
        const corpo = new THREE.Mesh(new RoundedBoxGeometry(2.8, 2.3, 2.0, 8, 0.7), matRoxo); cabeca.add(corpo)
        // Capacete de rodovia: cúpula roxa, aba azul e faixa de pista tracejada por cima.
        const cupula = new THREE.Mesh(new THREE.SphereGeometry(1.45, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), matCapacete)
        cupula.scale.set(1, 0.85, 0.75); cupula.position.y = 0.95; cabeca.add(cupula)
        const aba = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.16, 48), matAba)
        aba.scale.z = 0.72; aba.position.y = 0.95; cabeca.add(aba)
        // Nervura de ciano luminoso sobre a cúpula (de trás para a frente), no lugar de blocos brancos.
        const matNervura = new THREE.MeshStandardMaterial({ color: 0x7fe0f0, emissive: 0x5fd0e6, emissiveIntensity: 0.8, roughness: 0.3 })
        const nervura = new THREE.Mesh(new THREE.TorusGeometry(1.47, 0.045, 12, 56, 2.0), matNervura)
        nervura.rotation.y = Math.PI / 2; nervura.scale.set(0.75, 0.85, 1); nervura.position.y = 0.95; cabeca.add(nervura)
        // Emblema do Raly (R de rodovia com ondas de voz), sem branco: R em degradê ciano→lilás sobre fundo azul-marinho.
        const tela = document.createElement('canvas'); tela.width = 256; tela.height = 256
        const cx = tela.getContext('2d')
        const fundo = cx.createRadialGradient(128, 110, 20, 128, 128, 126)
        fundo.addColorStop(0, '#0b6f86'); fundo.addColorStop(1, '#14233a')
        cx.fillStyle = fundo; cx.beginPath(); cx.arc(128, 128, 120, 0, Math.PI * 2); cx.fill()
        cx.lineWidth = 10; cx.strokeStyle = '#7fe0f0'; cx.beginPath(); cx.arc(128, 128, 116, 0, Math.PI * 2); cx.stroke()
        cx.save(); cx.translate(28, 18); cx.scale(0.78, 0.78)
        const grad = cx.createLinearGradient(80, 64, 200, 192); grad.addColorStop(0, '#7fe0f0'); grad.addColorStop(1, '#3fb3cc')
        cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.lineWidth = 24; cx.strokeStyle = grad
        cx.stroke(new Path2D('M80 192V64h44a36 36 0 0 1 0 72H80M124 136l44 56'))
        cx.setLineDash([12, 14]); cx.lineWidth = 7; cx.strokeStyle = '#14233a'; cx.stroke(new Path2D('M80 88v80'))
        cx.setLineDash([]); cx.lineWidth = 12; cx.strokeStyle = '#3fb3cc'
        cx.stroke(new Path2D('M188 84a36 36 0 0 1 0 48')); cx.globalAlpha = 0.6; cx.stroke(new Path2D('M208 64a64 64 0 0 1 0 88'))
        cx.restore()
        const texEmblema = new THREE.CanvasTexture(tela); texEmblema.colorSpace = THREE.SRGBColorSpace; texEmblema.anisotropy = 4
        const emblema = new THREE.Mesh(new THREE.CircleGeometry(0.38, 56), new THREE.MeshBasicMaterial({ map: texEmblema, transparent: true, toneMapped: false }))
        emblema.position.set(0, 0.95 + 1.45 * 0.85 * Math.cos(0.87) * 1.03, 1.45 * 0.75 * Math.sin(0.87) * 1.03)
        emblema.rotation.x = -0.72; cabeca.add(emblema)
        // Viseira escura na frente.
        const viseira = new THREE.Mesh(new RoundedBoxGeometry(2.15, 1.12, 0.3, 6, 0.5), matViseira); viseira.position.set(0, 0.28, 0.98); cabeca.add(viseira)
        // Olhos de farol.
        const olhos = new THREE.Group(); olhos.position.set(0, 0.3, 1.14); cabeca.add(olhos)
        const olhoE = new THREE.Group(); const olhoD = new THREE.Group()
        for (const [g, x] of [[olhoE, -0.52], [olhoD, 0.52]]) {
          g.position.x = x
          const esfera = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), matOlho); esfera.scale.z = 0.55
          const pupila = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), matPupila); pupila.position.set(0.04, 0.04, 0.17)
          g.add(esfera, pupila); olhos.add(g)
        }
        // Sorriso: arco de toro; escala em Y simula a fala.
        const boca = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.085, 16, 40, Math.PI), matBranco)
        boca.rotation.z = Math.PI; boca.position.set(0, -0.62, 1.04); cabeca.add(boca)
        // Orelhas.
        for (const x of [-1.55, 1.55]) { const o = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.8, 0.8, 4, 0.14), matLilas); o.position.set(x, 0.05, 0); cabeca.add(o) }
        // Antena com luz de sinalização.
        const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 16), matLilas); haste.position.set(0, 2.35, 0); cabeca.add(haste)
        const luz = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), matLuz); luz.position.set(0, 2.73, 0); cabeca.add(luz)
        const luzPonto = new THREE.PointLight(0xffb020, 8, 6); luzPonto.position.set(0, 2.75, 0.4); cabeca.add(luzPonto)

        let alvoX = 0; let alvoY = 0
        const aoMover = (e) => {
          const r = el.getBoundingClientRect()
          const cx = r.left + r.width / 2; const cy = r.top + r.height / 2
          alvoY = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))) * 0.6
          alvoX = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))) * 0.35
        }
        window.addEventListener('pointermove', aoMover, { passive: true })

        const ajustar = () => {
          const w = el.clientWidth || 1; const h = el.clientHeight || 1
          renderer.setSize(w, h, false)
          camera.aspect = w / h; camera.updateProjectionMatrix()
        }
        ajustar()
        const ro = new ResizeObserver(ajustar); ro.observe(el)

        let visivel = true
        const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting }, { threshold: 0.01 }); io.observe(el)

        const relogio = new THREE.Clock()
        let proximaPiscada = 2.5; let piscando = -1
        let raf = 0
        const quadro = () => {
          raf = requestAnimationFrame(quadro)
          if (!visivel || document.hidden) return
          const t = relogio.getElapsedTime()
          const est = estadoRef.current
          cabeca.rotation.y += ((reduzir ? 0 : alvoY + Math.sin(t * 0.6) * 0.12) - cabeca.rotation.y) * 0.08
          cabeca.rotation.x += ((reduzir ? 0 : alvoX) - cabeca.rotation.x) * 0.08
          cabeca.position.y = reduzir ? 0 : Math.sin(t * 1.4) * 0.09
          // Piscar.
          if (est !== 'ouvindo' && t > proximaPiscada && piscando < 0) { piscando = t; proximaPiscada = t + 2.5 + Math.random() * 3 }
          let esc = 1
          if (piscando >= 0) { const k = (t - piscando) / 0.16; if (k >= 1) piscando = -1; else esc = 1 - Math.sin(k * Math.PI) * 0.92 }
          const alvoOlho = est === 'ouvindo' ? 1.3 : 1
          olhoE.scale.set(alvoOlho, alvoOlho * esc, alvoOlho); olhoD.scale.copy(olhoE.scale)
          // Boca.
          const alvoBoca = est === 'falando' ? 0.7 + Math.abs(Math.sin(t * 11)) * 1.2 : 1
          boca.scale.y += (alvoBoca - boca.scale.y) * 0.35
          // Antena: âmbar normal, vermelha ao ouvir, ciano ao falar.
          const cor = est === 'ouvindo' ? 0xff4d6d : est === 'falando' ? 0x7fe0f0 : 0xffb020
          matLuz.color.setHex(cor); matLuz.emissive.setHex(cor); luzPonto.color.setHex(cor)
          matLuz.emissiveIntensity = 1 + (Math.sin(t * (est === 'pronto' ? 2.6 : 8)) + 1) * 0.5
          renderer.render(cena, camera)
        }
        quadro()

        limpar = () => {
          cancelAnimationFrame(raf)
          window.removeEventListener('pointermove', aoMover)
          ro.disconnect(); io.disconnect()
          cena.traverse((o) => { o.geometry?.dispose?.() })
          ;[matCapacete, matAba, matNervura, texEmblema, matRoxo, matBranco, matViseira, matLilas, matOlho, matPupila, matLuz].forEach((m) => m.dispose())
          renderer.dispose()
          renderer.domElement.remove()
        }
      })
      .catch(() => { if (!cancelado) setFalhou(true) })
    return () => { cancelado = true; limpar() }
  }, [falhou])

  if (falhou) return <RalyRosto tamanho={tamanho} estado={estado} titulo="Rosto do Raly" />
  return <div ref={caixa} className={`rosto3d ${className}`} style={{ width: tamanho, height: tamanho, maxWidth: '100%' }} role="img" aria-label="Rosto do Raly em 3D" />
}





