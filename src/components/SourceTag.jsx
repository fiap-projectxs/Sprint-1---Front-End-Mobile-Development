import Icon from './Icon.jsx'

// Diferencia "relato do usuário", "informação simulada" e "informação confirmada".
const FONTES = {
  relato: { rotulo: 'Relato do usuário', icone: 'chat', dica: 'Informado por uma pessoa. Não foi verificado.' },
  simulada: { rotulo: 'Informação simulada', icone: 'database', dica: 'Dado fictício criado para a demonstração.' },
  modelo: { rotulo: 'Modelo local (Ollama)', icone: 'chat', dica: 'Resposta gerada por um modelo de linguagem local. Pode errar e não foi verificada.' },
  confirmada: { rotulo: 'Revisão humana (demo)', icone: 'check', dica: 'Confirmação visual simulada. Nada foi enviado a sistemas reais.' },
}

export default function SourceTag({ fonte }) {
  const f = FONTES[fonte] || FONTES.simulada
  return (
    <span className={`fonte fonte--${fonte}`} title={f.dica}>
      <Icon nome={f.icone} tamanho={12} /> {f.rotulo}
    </span>
  )
}
