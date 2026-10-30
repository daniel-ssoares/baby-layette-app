import type {
  AtualizarEnxoval, BoasVindas, Categoria, Conta, Enxoval, Item, Local, Painel, RegistrarCompra, SalvarCategoria, SalvarItem,
  TemaVisual,
} from './types'
import { mensagemDeErro } from '../lib/erros'

export class ApiError extends Error {
  readonly status: number
  readonly codigos: string[]
  constructor(message: string, status: number, codigos: string[] = []) {
    super(message)
    this.status = status
    this.codigos = codigos
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const formulario = body instanceof FormData
  const res = await fetch(`/api${url}`, {
    method,
    headers: body && !formulario ? { 'Content-Type': 'application/json' } : undefined,
    body: formulario ? body : body ? JSON.stringify(body) : undefined,
  }).catch(() => { throw new ApiError('Não foi possível conectar ao servidor. Verifique a internet e tente de novo.', 0) })
  if (!res.ok) {
    // ProblemDetails: códigos de validação (ex.: PasswordTooShort) viram mensagens em português.
    const problem = await res.json().catch(() => null)
    const codigos = problem?.errors ? Object.keys(problem.errors) : []
    const primeiro = problem?.errors ? Object.values(problem.errors).flat()[0] as string : undefined
    throw new ApiError(mensagemDeErro(res.status, codigos, problem?.detail ?? primeiro), res.status, codigos)
  }
  const texto = await res.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

export const api = {
  // Conta (Identity em /api/auth)
  eu: () => request<Conta>('GET', '/auth/manage/info').catch(e => {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }),
  entrar: (email: string, password: string) => request<void>('POST', '/auth/login?useCookies=true', { email, password }),
  cadastrar: (email: string, password: string) => request<void>('POST', '/auth/register', { email, password }),
  sair: () => request<void>('POST', '/auth/sair'),
  trocarSenha: (oldPassword: string, newPassword: string) =>
    request<void>('POST', '/auth/manage/info', { oldPassword, newPassword }),

  enxoval: () => request<Enxoval>('GET', '/enxoval'),
  atualizarEnxoval: (d: AtualizarEnxoval) => request<void>('PUT', '/enxoval', d),
  trocarTema: (tema: TemaVisual) => request<void>('PUT', '/enxoval/tema', { tema }),
  concluirBoasVindas: (d: BoasVindas) => request<void>('POST', '/enxoval/boas-vindas', d),

  categorias: () => request<Categoria[]>('GET', '/categorias'),
  criarCategoria: (d: SalvarCategoria) => request<Categoria>('POST', '/categorias', d),
  atualizarCategoria: (id: number, d: SalvarCategoria) => request<void>('PUT', `/categorias/${id}`, d),
  excluirCategoria: (id: number) => request<void>('DELETE', `/categorias/${id}`),

  itens: () => request<Item[]>('GET', '/itens'),
  criarItem: (d: SalvarItem) => request<Item>('POST', '/itens', d),
  atualizarItem: (id: number, d: SalvarItem) => request<Item>('PUT', `/itens/${id}`, d),
  excluirItem: (id: number) => request<void>('DELETE', `/itens/${id}`),
  adquirirItem: (id: number) => request<Item>('POST', `/itens/${id}/adquirir`),
  removerItem: (id: number) => request<Item>('POST', `/itens/${id}/remover`),
  concluirItem: (id: number) => request<Item>('POST', `/itens/${id}/concluir`),
  registrarCompra: ({ id, ...d }: RegistrarCompra & { id: number }) => request<Item>('POST', `/itens/${id}/compra`, d),
  enviarFoto: (id: number, foto: Blob) => {
    const form = new FormData()
    form.append('foto', foto, 'foto')
    return request<Item>('PUT', `/itens/${id}/foto`, form)
  },
  removerFoto: (id: number) => request<void>('DELETE', `/itens/${id}/foto`),

  painel: () => request<Painel>('GET', '/painel'),
  buscarLocais: (q: string) => request<Local[]>('GET', `/localizacao?q=${encodeURIComponent(q)}`),
}
