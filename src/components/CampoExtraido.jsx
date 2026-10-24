import Icon from './Icon.jsx'

const ESTADOS = {
  informado: { rotulo: 'Informado', icone: 'check' },
  confirmar: { rotulo: 'Precisa confirmar', icone: 'help' },
  nao_informado: { rotulo: 'Não informado', icone: 'x' },
}

export default function CampoExtraido({ rotulo, campo }) {
  const e = ESTADOS[campo.estado]
  return (
    <li className="extraido">
      <span className="extraido__rotulo">{rotulo}</span>
      <span className="extraido__valor">{campo.estado === 'nao_informado' ? '—' : campo.valor}</span>
      <span className={`estado estado--${campo.estado}`}>
        <Icon nome={e.icone} tamanho={12} /> {e.rotulo}
      </span>
    </li>
  )
}
