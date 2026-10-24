// Autenticação SIMULADA no navegador (demonstração). Não oferece segurança real:
// os dados ficam no armazenamento local e qualquer pessoa com acesso ao navegador pode alterá-los.
// Mesmo assim, as senhas nunca são guardadas em texto: usam PBKDF2 com sal por usuário.
import { USUARIOS_DEMO } from '../demo/usuarios.js'

const CHAVE_USUARIOS = 'raly:usuarios:v2'
const CHAVE_AUDITORIA = 'raly:auditoria'
const CHAVE_SESSAO = 'raly:sessao'

function ler(armazem, chave, padrao) {
  try { const b = armazem.getItem(chave); return b ? JSON.parse(b) : padrao } catch { return padrao }
}
function gravar(armazem, chave, valor) {
  try { armazem.setItem(chave, JSON.stringify(valor)) } catch { /* sem armazenamento: vale só nesta aba */ }
}
const local = () => (typeof window !== 'undefined' ? window.localStorage : null)
const aba = () => (typeof window !== 'undefined' ? window.sessionStorage : null)

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
export function novoSal() {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return hex(a)
}
export async function hashSenha(senha, sal) {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(sal), iterations: 100000, hash: 'SHA-256' }, chave, 256)
  return hex(bits)
}

export async function criarRegistro({ id, nome, usuario, senha, perfil }) {
  const sal = novoSal()
  return { id, nome, usuario: usuario.trim().toLowerCase(), perfil, ativo: true, sal, hash: await hashSenha(senha, sal), criadoEm: new Date().toISOString(), ultimoAcesso: null }
}

export async function carregarUsuarios() {
  const salvos = ler(local(), CHAVE_USUARIOS, null)
  if (salvos?.length) return salvos
  // Contas de demonstração só em desenvolvimento ou com VITE_SEED_DEMO=true. Em produção a lista começa vazia
  // e a primeira conta criada vira administradora.
  const semear = import.meta.env.DEV || import.meta.env.VITE_SEED_DEMO === 'true'
  const semente = semear ? await Promise.all(USUARIOS_DEMO.map((u) => criarRegistro(u))) : []
  if (semente.length) gravar(local(), CHAVE_USUARIOS, semente)
  return semente
}
export const salvarUsuarios = (lista) => gravar(local(), CHAVE_USUARIOS, lista)

export const carregarAuditoria = () => ler(local(), CHAVE_AUDITORIA, [])
export const salvarAuditoria = (lista) => gravar(local(), CHAVE_AUDITORIA, lista.slice(0, 300))

export const carregarSessao = () => ler(aba(), CHAVE_SESSAO, null)
export const salvarSessao = (s) => { try { if (s) aba().setItem(CHAVE_SESSAO, JSON.stringify(s)); else aba().removeItem(CHAVE_SESSAO) } catch { /* ignora */ } }

export async function conferirSenha(registro, senha) {
  return (await hashSenha(senha, registro.sal)) === registro.hash
}

// Força da senha: 0 a 4.
export function forcaSenha(s) {
  let n = 0
  if (s.length >= 8) n++
  if (s.length >= 12) n++
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++
  if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) n++
  return { nivel: s.length < 8 ? Math.min(n, 1) : n, rotulo: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][s.length < 8 ? Math.min(n, 1) : n] }
}
// Validação de formato (sem servidor, não há como confirmar que a caixa de e-mail existe).
export const ehEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim()) && String(s).trim().length <= 120
export const senhaValida = (s) => s.length >= 8

export const sessaoDe = (u) => ({ id: u.id, nome: u.nome, usuario: u.usuario, perfil: u.perfil })
