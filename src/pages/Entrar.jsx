import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import RalyRosto from '../components/RalyRosto.jsx'
import SubNav from '../components/SubNav.jsx'
import { Texto } from '../components/Campo.jsx'
import { forcaSenha } from '../utils/auth.js'

function Forca({ senha }) {
  if (!senha) return null
  const f = forcaSenha(senha)
  return (
    <div className="forca" aria-live="polite">
      <span className="forca__barra">{[1, 2, 3, 4].map((n) => <i key={n} className={f.nivel >= n ? `forca__on forca__on--${f.nivel}` : ''} />)}</span>
      <span>Senha: {f.rotulo}</span>
    </div>
  )
}

// Entrar e criar conta. `motivo` explica por que a pessoa caiu aqui (ex.: página restrita).
export default function Entrar({ auth, navegar, motivo, destino }) {
  const [aba, setAba] = useState('entrar')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [ver, setVer] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro(''); setCarregando(true)
    const r = aba === 'entrar' ? await auth.entrar(usuario, senha) : await auth.cadastrar({ nome, usuario, senha })
    setCarregando(false)
    if (!r.ok) { setErro(r.erro); return }
    if (destino) navegar(destino.pagina, destino.sub || null)
    else navegar('inicio')
  }

  return (
    <div className="pagina">
      <div className="login">
        <section className="login__cartao">
          <span className="login__rosto"><RalyRosto tamanho={64} /></span>
          <h1>{aba === 'entrar' ? 'Entrar no Raly' : 'Criar conta de passageiro'}</h1>
          {motivo && <p className="aviso aviso--info" role="status"><Icon nome="lock" tamanho={16} /> {motivo}</p>}
          <SubNav itens={[{ id: 'entrar', rotulo: 'Entrar' }, { id: 'criar', rotulo: 'Criar conta' }]} atual={aba} onMudar={(a) => { setAba(a); setErro('') }} rotulo="Entrar ou criar conta" />
          <form onSubmit={enviar} className="login__form" noValidate>
            {aba === 'criar' && <Texto rotulo="Nome" valor={nome} onChange={setNome} id="login-nome" obrigatorio />}
            <Texto rotulo="E-mail" valor={usuario} onChange={setUsuario} tipo="email" id="login-usuario" obrigatorio />
            <div className="campo-senha">
              <Texto rotulo="Senha" valor={senha} onChange={setSenha} tipo={ver ? 'text' : 'password'} id="login-senha" obrigatorio />
              <button type="button" className="btn btn--secundario" onClick={() => setVer((v) => !v)} aria-pressed={ver}>{ver ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            {aba === 'criar' && <Forca senha={senha} />}
            {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}
            <button type="submit" className="btn btn--primario" disabled={carregando || !auth.pronto}>
              <Icon nome="lock" tamanho={16} /> {carregando ? 'Verificando…' : aba === 'entrar' ? 'Entrar' : 'Criar conta e entrar'}
            </button>
          </form>
          {aba === 'criar' && <p className="texto-suave">Contas criadas aqui são de passageiro. Outros perfis são criados pelo administrador.</p>}
        </section>

        <aside className="login__lado">
          <h2>Cada perfil, seu acesso</h2>
          <p className="texto-suave">Passageiros usam o Prazy e o SmartDeskAI. Agentes de campo usam também o Raly. O TicketRal é só de coordenadores e administradores.</p>
          <p className="texto-suave"><Icon nome="info" tamanho={14} /> Login simulado no navegador, sem segurança real. As senhas ficam protegidas por hash neste navegador. O e-mail é validado só no formato.</p>
        </aside>
      </div>
    </div>
  )
}

