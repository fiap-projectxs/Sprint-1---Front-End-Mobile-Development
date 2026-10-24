import { formatarHora } from '../utils/datas.js'
import SourceTag from './SourceTag.jsx'

export default function Mensagem({ autor, texto, quando, fonte, nome }) {
  const doUsuario = autor === 'usuario'
  return (
    <div className={`msg ${doUsuario ? 'msg--usuario' : 'msg--agente'}`}>
      <div className="msg__balao">
        <p>{texto}</p>
      </div>
      <p className="msg__meta">
        {doUsuario ? 'Você' : nome} · {formatarHora(quando)}
        {fonte && <> · <SourceTag fonte={fonte} /></>}
      </p>
    </div>
  )
}
