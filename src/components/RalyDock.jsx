import { useState } from 'react'
import Icon from './Icon.jsx'
import { lazy, Suspense } from 'react'
import RalyRosto from './RalyRosto.jsx'

const RalyRosto3D = lazy(() => import('./RalyRosto3D.jsx'))
import PersonalizarVoz from './PersonalizarVoz.jsx'

// Painel fixo do Raly, presente em todas as telas: voz, texto e respostas.
export default function RalyDock({ voz, falaAtiva, onFalaAtiva, continuo, onContinuo, ultimaFala, ultimaResposta, pendente, onTexto, aberto, onAbrir }) {
  const [texto, setTexto] = useState('')
  const estado = voz.ouvindo ? 'Ouvindo…' : voz.falando ? 'Falando…' : 'Pronto'

  return (
    <aside className={`dock ${aberto ? 'dock--aberto' : ''}`} aria-label="Raly, assistente de voz">
      <button type="button" className="dock__alca" onClick={onAbrir} aria-expanded={aberto} aria-controls="dock-corpo">
        <span className="dock__rosto" aria-hidden="true">{(() => { const est = voz.ouvindo ? 'ouvindo' : voz.falando ? 'falando' : 'pronto'; return <Suspense fallback={<RalyRosto tamanho={56} estado={est} />}><RalyRosto3D tamanho={56} estado={est} /></Suspense> })()}</span>
        <span><strong>Raly</strong> <span className="dock__estado">{estado}</span></span>
        <Icon nome={aberto ? 'x' : 'chat'} tamanho={16} />
      </button>

      {aberto && (
        <div id="dock-corpo" className="dock__corpo">
          <button
            type="button"
            className={`btn btn--primario dock__botao ${voz.ouvindo ? 'dock__botao--ouvindo' : ''}`}
            onClick={voz.ouvindo ? voz.parar : voz.iniciar}
            aria-pressed={voz.ouvindo}
            disabled={!voz.suportaReconhecimento}
          >
            <Icon nome="mic" tamanho={22} /> {voz.ouvindo ? 'Parar de ouvir' : 'Falar com o Raly'}
          </button>

          {!voz.suportaReconhecimento && (
            <p className="dock__aviso" role="alert">Este navegador não oferece reconhecimento de voz. Use Chrome ou Edge. A entrada por texto abaixo funciona em qualquer navegador.</p>
          )}
          {voz.erro && <p className="dock__aviso" role="alert">{voz.erro}</p>}

          <div className="dock__linha" aria-live="polite">
            <p className="dock__rotulo">{voz.ouvindo && voz.parcial ? 'Ouvindo' : 'Você disse'}</p>
            <p>{voz.parcial || ultimaFala || '—'}</p>
          </div>
          <div className="dock__linha" aria-live="polite">
            <p className="dock__rotulo">Raly</p>
            <p>{ultimaResposta || 'Diga, por exemplo: “abrir tickets” ou descreva uma ocorrência.'}</p>
          </div>
          {pendente && <p className="dock__pendente" role="status"><Icon nome="help" tamanho={14} /> Aguardando sua confirmação: diga “sim, confirmo” ou “cancelar”.</p>}

          <form className="dock__form" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) { onTexto(texto.trim()); setTexto('') } }}>
            <label className="sr-only" htmlFor="dock-texto">Comando ou relato por texto</label>
            <input id="dock-texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ou escreva aqui" autoComplete="off" />
            <button type="submit" className="btn btn--secundario" disabled={!texto.trim()} aria-label="Enviar texto"><Icon nome="send" tamanho={16} /></button>
          </form>

          <div className="dock__opcoes">
            <label className="marcar"><input type="checkbox" checked={falaAtiva} onChange={(e) => onFalaAtiva(e.target.checked)} disabled={!voz.suportaFala} /> <span>Resposta falada</span></label>
            <label className="marcar"><input type="checkbox" checked={continuo} onChange={(e) => onContinuo(e.target.checked)} disabled={!voz.suportaReconhecimento} /> <span>Escuta contínua (comece com “Raly”)</span></label>
          </div>
          {voz.suportaFala && voz.vozPt === false && <p className="dock__aviso--voz" role="status">Sem voz em português neste computador: o Raly não vai falar em inglês e mostra só o texto. Instale uma voz “Português (Brasil)” ou use o Edge.</p>}
          <PersonalizarVoz voz={voz} compacto />
          <p className="dock__nota">O áudio é processado pelo serviço de voz do navegador. Esta demonstração não grava nem envia o áudio.</p>
        </div>
      )}
    </aside>
  )
}

