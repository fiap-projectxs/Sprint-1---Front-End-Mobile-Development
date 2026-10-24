import { useCallback, useEffect, useRef, useState } from 'react'
import {
  carregarAuditoria, carregarSessao, carregarUsuarios, conferirSenha, criarRegistro, hashSenha, novoSal,
  salvarAuditoria, salvarSessao, salvarUsuarios, senhaValida, sessaoDe, ehEmail,
} from './auth.js'

const MAX_TENTATIVAS = 5
const BLOQUEIO_MS = 60000

// Estado de autenticação, usuários e auditoria da demonstração.
export default function useAuth() {
  const [usuarios, setUsuarios] = useState([])
  const [pronto, setPronto] = useState(false)
  const [sessao, setSessao] = useState(carregarSessao)
  const [auditoria, setAuditoria] = useState(carregarAuditoria)
  const falhas = useRef({}) // usuario -> { n, ate }
  const refUsuarios = useRef([])

  useEffect(() => {
    let vivo = true
    carregarUsuarios().then((l) => { if (vivo) { refUsuarios.current = l; setUsuarios(l); setPronto(true) } })
    return () => { vivo = false }
  }, [])

  const registrar = useCallback((acao, detalhe, quem) => {
    const item = { id: `A-${Date.now()}-${Math.floor(Math.random() * 1000)}`, quando: new Date().toISOString(), quem: quem || 'sistema', acao, detalhe }
    setAuditoria((l) => { const n = [item, ...l].slice(0, 300); salvarAuditoria(n); return n })
  }, [])

  const gravarUsuarios = useCallback((fn) => {
    const novo = fn(refUsuarios.current)
    refUsuarios.current = novo
    setUsuarios(novo)
    salvarUsuarios(novo)
  }, [])

  const entrar = useCallback(async (usuarioBruto, senha) => {
    const usuario = usuarioBruto.trim().toLowerCase()
    const f = falhas.current[usuario]
    if (f && f.ate > Date.now()) return { ok: false, erro: `Muitas tentativas. Tente de novo em ${Math.ceil((f.ate - Date.now()) / 1000)} s.` }
    const u = refUsuarios.current.find((x) => x.usuario === usuario)
    const certo = u && u.ativo && (await conferirSenha(u, senha))
    if (!certo) {
      const n = (f?.n || 0) + 1
      falhas.current[usuario] = { n, ate: n >= MAX_TENTATIVAS ? Date.now() + BLOQUEIO_MS : 0 }
      registrar('login_falhou', u && !u.ativo ? 'Conta desativada' : 'E-mail ou senha incorretos', usuario || '—')
      return { ok: false, erro: u && !u.ativo ? 'Esta conta está desativada. Fale com o administrador.' : 'E-mail ou senha incorretos.' }
    }
    delete falhas.current[usuario]
    gravarUsuarios((l) => l.map((x) => (x.id === u.id ? { ...x, ultimoAcesso: new Date().toISOString() } : x)))
    const s = sessaoDe(u)
    setSessao(s); salvarSessao(s)
    registrar('login', `Perfil ${u.perfil}`, u.usuario)
    return { ok: true, sessao: s }
  }, [gravarUsuarios, registrar])

  const sair = useCallback(() => {
    setSessao((s) => { if (s) registrar('logout', '', s.usuario); return null })
    salvarSessao(null)
  }, [registrar])

  // Cadastro público: só cria conta de passageiro.
  const cadastrar = useCallback(async ({ nome, usuario, senha }) => {
    const u = usuario.trim().toLowerCase()
    if (!nome.trim() || !ehEmail(u)) return { ok: false, erro: 'Informe o nome e um e-mail válido (exemplo: nome@dominio.com).' }
    if (!senhaValida(senha)) return { ok: false, erro: 'A senha precisa de pelo menos 8 caracteres.' }
    if (refUsuarios.current.some((x) => x.usuario === u)) return { ok: false, erro: 'Já existe uma conta com este e-mail.' }
    const id = `U-${String(refUsuarios.current.length + 1).padStart(3, '0')}-${Math.floor(Math.random() * 90 + 10)}`
    const primeira = refUsuarios.current.length === 0 // instalação nova: a primeira conta administra
    const reg = await criarRegistro({ id, nome: nome.trim(), usuario: u, senha, perfil: primeira ? 'admin' : 'passageiro' })
    gravarUsuarios((l) => [...l, reg])
    registrar('cadastro', refUsuarios.current.length === 1 ? 'Primeira conta criada (administrador)' : 'Conta de passageiro criada', u)
    const s = sessaoDe(reg)
    setSessao(s); salvarSessao(s)
    return { ok: true }
  }, [gravarUsuarios, registrar])

  // ----- Administração (a tela só abre para o perfil admin) -----
  const criarUsuario = useCallback(async ({ nome, usuario, senha, perfil }, autor) => {
    const u = usuario.trim().toLowerCase()
    if (!nome.trim() || !ehEmail(u)) return { ok: false, erro: 'Informe o nome e um e-mail válido.' }
    if (!senhaValida(senha)) return { ok: false, erro: 'A senha precisa de pelo menos 8 caracteres.' }
    if (refUsuarios.current.some((x) => x.usuario === u)) return { ok: false, erro: 'Já existe uma conta com este e-mail.' }
    const id = `U-${String(refUsuarios.current.length + 1).padStart(3, '0')}-${Math.floor(Math.random() * 90 + 10)}`
    const reg = await criarRegistro({ id, nome: nome.trim(), usuario: u, senha, perfil })
    gravarUsuarios((l) => [...l, reg])
    registrar('usuario_criado', `${u} (${perfil})`, autor)
    return { ok: true }
  }, [gravarUsuarios, registrar])

  const atualizarUsuario = useCallback((id, mudanca, autor) => {
    const alvo = refUsuarios.current.find((x) => x.id === id)
    if (!alvo) return { ok: false, erro: 'Usuário não encontrado.' }
    const admins = refUsuarios.current.filter((x) => x.perfil === 'admin' && x.ativo)
    const perdeAdmin = alvo.perfil === 'admin' && alvo.ativo && (mudanca.perfil && mudanca.perfil !== 'admin' || mudanca.ativo === false)
    if (perdeAdmin && admins.length <= 1) return { ok: false, erro: 'É preciso manter pelo menos um administrador ativo.' }
    gravarUsuarios((l) => l.map((x) => (x.id === id ? { ...x, ...mudanca } : x)))
    registrar('usuario_alterado', `${alvo.usuario}: ${Object.entries(mudanca).map(([k, v]) => `${k}=${v}`).join(', ')}`, autor)
    return { ok: true }
  }, [gravarUsuarios, registrar])

  const redefinirSenha = useCallback(async (id, nova, autor) => {
    if (!senhaValida(nova)) return { ok: false, erro: 'A senha precisa de pelo menos 8 caracteres.' }
    const alvo = refUsuarios.current.find((x) => x.id === id)
    if (!alvo) return { ok: false, erro: 'Usuário não encontrado.' }
    const sal = novoSal()
    const hash = await hashSenha(nova, sal)
    gravarUsuarios((l) => l.map((x) => (x.id === id ? { ...x, sal, hash } : x)))
    registrar('senha_redefinida', alvo.usuario, autor)
    return { ok: true }
  }, [gravarUsuarios, registrar])

  const removerUsuario = useCallback((id, autor) => {
    const alvo = refUsuarios.current.find((x) => x.id === id)
    if (!alvo) return { ok: false, erro: 'Usuário não encontrado.' }
    if (alvo.perfil === 'admin' && refUsuarios.current.filter((x) => x.perfil === 'admin').length <= 1) return { ok: false, erro: 'Não dá para remover o único administrador.' }
    gravarUsuarios((l) => l.filter((x) => x.id !== id))
    registrar('usuario_removido', alvo.usuario, autor)
    return { ok: true }
  }, [gravarUsuarios, registrar])

  const alterarSenha = useCallback(async (atual, nova) => {
    const u = refUsuarios.current.find((x) => x.id === sessao?.id)
    if (!u || !(await conferirSenha(u, atual))) return { ok: false, erro: 'A senha atual está incorreta.' }
    return redefinirSenha(u.id, nova, u.usuario)
  }, [sessao, redefinirSenha])

  const limparAuditoria = useCallback(() => { setAuditoria([]); salvarAuditoria([]) }, [])

  return { pronto, usuarios, sessao, auditoria, registrar, entrar, sair, cadastrar, criarUsuario, atualizarUsuario, redefinirSenha, removerUsuario, alterarSenha, limparAuditoria }
}
