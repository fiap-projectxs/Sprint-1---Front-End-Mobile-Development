import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

export default function Modal({ titulo, onFechar, children, largura = 560 }) {
  const ref = useRef(null)
  const fecharRef = useRef(onFechar)
  useEffect(() => { fecharRef.current = onFechar })
  useEffect(() => {
    const anterior = document.activeElement
    ref.current?.focus()
    const aoTeclar = (e) => { if (e.key === 'Escape') fecharRef.current() }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      anterior?.focus?.()
    }
  }, [])

  return (
    <div className="modal__fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} ref={ref} style={{ maxWidth: largura }}>
        <div className="modal__topo">
          <h3>{titulo}</h3>
          <button type="button" className="btn btn--icone" onClick={onFechar} aria-label="Fechar">
            <Icon nome="x" />
          </button>
        </div>
        <div className="modal__corpo">{children}</div>
      </div>
    </div>
  )
}
