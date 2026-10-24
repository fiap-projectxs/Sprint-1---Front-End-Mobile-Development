import { useState } from 'react'
import Card from '../components/Card.jsx'
import Icon from '../components/Icon.jsx'
import { Texto } from '../components/Campo.jsx'
import { PERFIS, MODULOS_ACESSO, podeAcessar } from '../data/permissoes.js'

export default function Conta({ auth, avisar, navegar }) {
  const { sessao } = auth
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [erro, setErro] = useState('')
  const me = auth.usuarios.find((u) => u.id === sessao.id)

  async function trocar(e) {
    e.preventDefault()
    const r = await auth.alterarSenha(atual, nova)
    if (!r.ok) { setErro(r.erro); return }
    setErro(''); setAtual(''); setNova('')
    avisar('Senha alterada.')
  }

  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>Minha conta</h1>
          <p className="texto-suave">Seus dados de acesso e o que o seu perfil pode abrir.</p>
        </div>
        <button type="button" className="btn btn--secundario" onClick={() => { auth.sair(); navegar('apresentacao') }}><Icon nome="logout" tamanho={16} /> Sair</button>
      </div>
      <div className="grade grade--2">
        <Card titulo="Perfil">
          <dl className="dados">
            <div><dt>Nome</dt><dd>{sessao.nome}</dd></div>
            <div><dt>Usuário</dt><dd><code>{sessao.usuario}</code></dd></div>
            <div><dt>Perfil</dt><dd>{PERFIS[sessao.perfil].rotulo}</dd></div>
            <div><dt>Último acesso</dt><dd>{me?.ultimoAcesso ? new Date(me.ultimoAcesso).toLocaleString('pt-BR') : '—'}</dd></div>
          </dl>
          <h4>O que você pode abrir</h4>
          <ul className="lista-simples">
            {MODULOS_ACESSO.filter((m) => !['entrar', 'conta'].includes(m.id)).map((m) => (
              <li key={m.id}><Icon nome={podeAcessar(m.id, sessao) ? 'check' : 'lock'} tamanho={16} /> <span>{m.rotulo}</span></li>
            ))}
          </ul>
        </Card>
        <Card titulo="Alterar senha">
          <form onSubmit={trocar} className="login__form" noValidate>
            <Texto rotulo="Senha atual" valor={atual} onChange={setAtual} tipo="password" id="conta-atual" obrigatorio />
            <Texto rotulo="Nova senha (mín. 8 caracteres)" valor={nova} onChange={setNova} tipo="password" id="conta-nova" obrigatorio />
            {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}
            <button type="submit" className="btn btn--primario" disabled={!atual || !nova}><Icon nome="lock" tamanho={16} /> Alterar senha</button>
          </form>
        </Card>
      </div>
    </div>
  )
}
