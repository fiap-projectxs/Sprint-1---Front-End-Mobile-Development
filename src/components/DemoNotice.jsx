import Icon from './Icon.jsx'

export default function DemoNotice({ children, tom = 'info' }) {
  return (
    <div className={`aviso aviso--${tom}`} role="note">
      <Icon nome={tom === 'alerta' ? 'alert' : 'info'} tamanho={18} />
      <p>{children}</p>
    </div>
  )
}
