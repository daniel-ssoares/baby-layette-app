// Modo demonstração (VITE_DEMO=true): substitui a API interceptando fetch('/api/...') no navegador.
// Reproduz as rotas de src/Enxoval.Api/Endpoints.cs e AuthEndpoints.cs; os dados ficam no localStorage.
import type { Local, PerfilClima, SexoBebe, TemaVisual } from '../api/types'
import dados from './dados.json'
import { contaDemo } from './modo'
import { temasDisponiveis, todosOsTemas } from '../temas/paletas'
import {
  analisarClima, painel, paraDto, registrarCompra,
  type CategoriaSalva, type EnxovalSalvo, type ItemSalvo, type TemperaturaDiaria,
} from './dominio'

interface Conta {
  senha: string
  enxoval: EnxovalSalvo
  categorias: CategoriaSalva[]
  itens: ItemSalvo[]
  proximoId: number
}
interface Banco {
  contas: Record<string, Conta>
  logado: string | null
}

const CHAVE = 'enxoval-demo-v1'
const fetchOriginal = window.fetch.bind(window)
let memoria: Banco | null = null

const hoje = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const somarDias = (iso: string, dias: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10)
const agora = () => new Date().toISOString()

/** Conta nova com a lista-padrão (ListaPadrao.Criar). */
function novaConta(senha: string): Conta {
  const categorias = dados.padrao.categorias.map((c, k) => ({ id: k + 1, nome: c.nome, ordem: c.ordem }))
  const itens: ItemSalvo[] = dados.padrao.itens.map((i, k) => ({
    id: k + 1, categoriaId: i.categoria + 1, nome: i.nome, tamanho: i.tamanho ?? null, qtdDesejada: i.qtdDesejada,
    qtdAdquirida: 0, prioridade: i.prioridade as ItemSalvo['prioridade'], clima: i.clima as ItemSalvo['clima'],
    precoUnitarioEstimado: i.precoUnitarioEstimado ?? null, valorPago: null, origem: null, lojaLink: null,
    observacoes: i.observacoes ?? null, fotoUrl: null, atualizadoEm: agora(),
  }))
  return {
    senha, categorias, itens, proximoId: itens.length + 1,
    enxoval: { boasVindasConcluidas: false, nomeBebe: null, sexo: 'NaoInformado', dataPrevistaParto: null, orcamento: null,
      cidade: null, latitude: null, longitude: null },
  }
}

/** DadosDemonstracao.cs: bebê fictício, parto relativo a hoje, compras e presentes registrados. */
function novaContaDemo(): Conta {
  const conta = novaConta(contaDemo.senha)
  const { diasParaParto, ...enxoval } = dados.demo.enxoval
  conta.enxoval = { ...conta.enxoval, ...enxoval, sexo: enxoval.sexo as EnxovalSalvo['sexo'], tema: enxoval.tema as TemaVisual,
    boasVindasConcluidas: true,
    dataPrevistaParto: somarDias(hoje(), diasParaParto) }
  for (const c of dados.demo.compras)
    Object.assign(conta.itens[c.indice], { qtdAdquirida: c.qtdAdquirida, valorPago: c.valorPago, origem: c.origem })
  return conta
}

function carregar(): Banco {
  if (memoria) return memoria
  try { memoria = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') } catch { memoria = null }
  memoria ??= { contas: {}, logado: null }
  memoria.contas[contaDemo.email] ??= novaContaDemo()
  return memoria
}

/** Grava no localStorage; falha (sem espaço, modo privado) mantém os dados só nesta aba. */
function salvar(): boolean {
  try { localStorage.setItem(CHAVE, JSON.stringify(memoria)); return true } catch { return false }
}

// ---- Respostas no formato da API (ProblemDetails) ----
const resposta = (status: number, corpo?: unknown) =>
  new Response(corpo === undefined ? null : JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })
const ok = (corpo?: unknown) => resposta(corpo === undefined ? 204 : 200, corpo)
const validacao = (errors: Record<string, string[]>) => resposta(400, { status: 400, title: 'One or more validation errors occurred.', errors })
const conflito = (detail: string) => resposta(409, { status: 409, detail })
const naoEncontrado = () => resposta(404, { status: 404, detail: 'Não encontrado.' })
const naoAutorizado = () => resposta(401, { status: 401, detail: 'Failed' })
const limpar = (s: unknown) => (typeof s === 'string' && s.trim() ? s.trim() : null)

// ---- Clima (Open-Meteo direto do navegador; ClimaService.cs) ----
const historicos = new Map<string, Promise<TemperaturaDiaria[] | null>>()

function historico(lat: number, lon: number) {
  const chave = `${lat.toFixed(2)}:${lon.toFixed(2)}`
  if (!historicos.has(chave)) {
    const ultimoAno = new Date().getFullYear() - 1
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
      `&start_date=${ultimoAno - 4}-01-01&end_date=${ultimoAno}-12-31&daily=temperature_2m_mean,temperature_2m_min&timezone=auto`
    historicos.set(chave, fetchOriginal(url).then(r => (r.ok ? r.json() : null)).then(j => {
      const d = j?.daily
      if (!d) return null
      return (d.time as string[]).map((dia, k) => ({ dia, media: d.temperature_2m_mean[k], minima: d.temperature_2m_min[k] }))
        .filter(t => t.media != null && t.minima != null)
    }).catch(() => null))
  }
  return historicos.get(chave)!
}

async function perfilClima(e: EnxovalSalvo): Promise<PerfilClima | null> {
  if (e.latitude == null || e.longitude == null || !e.dataPrevistaParto) return null
  const h = await historico(e.latitude, e.longitude)
  return h?.length ? analisarClima(e.cidade, e.latitude, e.dataPrevistaParto, h) : null
}

async function buscarLocais(q: string): Promise<Local[]> {
  if (q.trim().length < 2) return []
  try {
    const r = await fetchOriginal(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=pt&format=json&name=${encodeURIComponent(q.trim())}`)
    const j = await r.json()
    return (j.results ?? []).map((l: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) =>
      ({ nome: l.name, estado: l.admin1 ?? null, pais: l.country ?? null, latitude: l.latitude, longitude: l.longitude }))
  } catch { return [] }
}

// ---- Validação (Validacao.cs) ----
type Corpo = Record<string, unknown>
const num = (v: unknown) => (typeof v === 'number' ? v : null)

function validarItem(c: Conta, r: Corpo) {
  const erros: Record<string, string[]> = {}
  if (!limpar(r.nome)) erros.nome = ['Informe o nome.']
  if ((num(r.qtdDesejada) ?? 0) < 1) erros.qtdDesejada = ['Deve ser pelo menos 1.']
  if ((num(r.qtdAdquirida) ?? 0) < 0) erros.qtdAdquirida = ['Não pode ser negativa.']
  if ((num(r.precoUnitarioEstimado) ?? 0) < 0) erros.precoUnitarioEstimado = ['Não pode ser negativo.']
  if ((num(r.valorPago) ?? 0) < 0) erros.valorPago = ['Não pode ser negativo.']
  if (!c.categorias.some(x => x.id === r.categoriaId)) erros.categoriaId = ['Categoria inválida.']
  return Object.keys(erros).length ? validacao(erros) : null
}

function aplicarItem(i: ItemSalvo, r: Corpo) {
  Object.assign(i, {
    categoriaId: r.categoriaId, nome: limpar(r.nome), tamanho: limpar(r.tamanho), qtdDesejada: r.qtdDesejada,
    qtdAdquirida: r.qtdAdquirida ?? 0, prioridade: r.prioridade ?? 'Media', clima: r.clima ?? 'Todos',
    precoUnitarioEstimado: num(r.precoUnitarioEstimado), valorPago: num(r.valorPago), origem: r.origem ?? null,
    lojaLink: limpar(r.lojaLink), observacoes: limpar(r.observacoes), atualizadoEm: agora(),
  })
}

const lerArquivo = (b: Blob) => new Promise<string>((ok, erro) => {
  const leitor = new FileReader()
  leitor.onload = () => ok(leitor.result as string)
  leitor.onerror = () => erro(leitor.error)
  leitor.readAsDataURL(b)
})

// ---- Rotas ----
async function tratar(metodo: string, url: URL, corpoBruto: BodyInit | null | undefined): Promise<Response> {
  const banco = carregar()
  const caminho = url.pathname.replace(/^\/api/, '')
  const corpo: Corpo = typeof corpoBruto === 'string' ? JSON.parse(corpoBruto) : {}
  const rota = `${metodo} ${caminho}`

  // Conta (MapIdentityApi)
  if (rota === 'POST /auth/register') {
    const email = String(corpo.email ?? '').trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) return validacao({ InvalidEmail: ['E-mail inválido.'] })
    if (banco.contas[email]) return validacao({ DuplicateUserName: ['Já existe uma conta com este e-mail.'] })
    if (String(corpo.password ?? '').length < 8) return validacao({ PasswordTooShort: ['Senha curta.'] })
    banco.contas[email] = novaConta(String(corpo.password))
    salvar()
    return ok()
  }
  if (rota === 'POST /auth/login') {
    const email = String(corpo.email ?? '').trim().toLowerCase()
    if (banco.contas[email]?.senha !== corpo.password) return naoAutorizado()
    banco.logado = email
    salvar()
    return ok()
  }

  const conta = banco.logado ? banco.contas[banco.logado] : undefined
  if (!conta) return naoAutorizado()
  const e = conta.enxoval

  if (rota === 'GET /auth/manage/info') return ok({ email: banco.logado, isEmailConfirmed: false })
  if (rota === 'POST /auth/manage/info') {
    if (corpo.oldPassword !== conta.senha) return validacao({ PasswordMismatch: ['Senha incorreta.'] })
    if (String(corpo.newPassword ?? '').length < 8) return validacao({ PasswordTooShort: ['Senha curta.'] })
    conta.senha = String(corpo.newPassword)
    salvar()
    return ok({ email: banco.logado, isEmailConfirmed: false })
  }
  if (rota === 'POST /auth/sair') {
    banco.logado = null
    salvar()
    return ok()
  }

  // Enxoval
  if (rota === 'GET /enxoval') return ok({ id: 1, tema: 'Oliveira', ...e })
  if (rota === 'PUT /enxoval/tema') {
    if (!todosOsTemas.includes(corpo.tema as TemaVisual)) return validacao({ tema: ['Tema inválido.'] })
    e.tema = corpo.tema as TemaVisual
    salvar()
    return ok()
  }
  if (rota === 'PUT /enxoval') {
    const erros: Record<string, string[]> = {}
    if ((num(corpo.orcamento) ?? 0) < 0) erros.orcamento = ['Não pode ser negativo.']
    if (Object.keys(erros).length) return validacao(erros)
    Object.assign(e, {
      nomeBebe: limpar(corpo.nomeBebe), sexo: corpo.sexo, dataPrevistaParto: corpo.dataPrevistaParto ?? null,
      orcamento: num(corpo.orcamento), cidade: corpo.latitude == null ? null : limpar(corpo.cidade),
      latitude: num(corpo.latitude), longitude: num(corpo.longitude),
    })
    salvar()
    return ok()
  }
  if (rota === 'POST /enxoval/boas-vindas') {
    const sexo = (corpo.sexo as SexoBebe | undefined) ?? null
    if (corpo.tema && !temasDisponiveis(sexo ?? 'NaoInformado').includes(corpo.tema as TemaVisual))
      return validacao({ tema: ['Escolha um dos temas oferecidos para o sexo informado.'] })
    if (sexo) e.sexo = sexo
    if (corpo.tema) e.tema = corpo.tema as TemaVisual
    e.nomeBebe = limpar(corpo.nomeBebe) ?? e.nomeBebe
    e.dataPrevistaParto = (corpo.dataPrevistaParto as string | null) ?? e.dataPrevistaParto
    e.boasVindasConcluidas = true
    salvar()
    return ok()
  }

  // Categorias
  if (rota === 'GET /categorias')
    return ok([...conta.categorias].sort((a, b) => a.ordem - b.ordem)
      .map(c => ({ ...c, totalItens: conta.itens.filter(i => i.categoriaId === c.id).length })))
  if (rota === 'POST /categorias') {
    const nome = limpar(corpo.nome)
    if (!nome) return validacao({ nome: ['Informe o nome.'] })
    if (conta.categorias.some(c => c.nome === nome)) return conflito('Já existe uma categoria com esse nome.')
    const c = { id: conta.proximoId++, nome, ordem: num(corpo.ordem) ?? 0 }
    conta.categorias.push(c)
    salvar()
    return resposta(201, { ...c, totalItens: 0 })
  }
  const mCategoria = caminho.match(/^\/categorias\/(\d+)$/)
  if (mCategoria) {
    const c = conta.categorias.find(x => x.id === Number(mCategoria[1]))
    if (!c) return naoEncontrado()
    if (metodo === 'PUT') {
      const nome = limpar(corpo.nome)
      if (!nome) return validacao({ nome: ['Informe o nome.'] })
      if (conta.categorias.some(x => x.nome === nome && x.id !== c.id)) return conflito('Já existe uma categoria com esse nome.')
      Object.assign(c, { nome, ordem: num(corpo.ordem) ?? c.ordem })
    } else if (metodo === 'DELETE') {
      if (conta.itens.some(i => i.categoriaId === c.id)) return conflito('Mova ou exclua os itens desta categoria antes de excluí-la.')
      conta.categorias = conta.categorias.filter(x => x !== c)
    }
    salvar()
    return ok()
  }

  // Itens
  if (rota === 'GET /itens') {
    const clima = await perfilClima(e)
    return ok(conta.itens.map(i => paraDto(i, clima)))
  }
  if (rota === 'POST /itens') {
    const erro = validarItem(conta, corpo)
    if (erro) return erro
    const i = { id: conta.proximoId++, fotoUrl: null } as ItemSalvo
    aplicarItem(i, corpo)
    conta.itens.push(i)
    salvar()
    return resposta(201, paraDto(i, null))
  }
  const mItem = caminho.match(/^\/itens\/(\d+)(?:\/(\w+))?$/)
  if (mItem) {
    const i = conta.itens.find(x => x.id === Number(mItem[1]))
    if (!i) return naoEncontrado()
    const acao = `${metodo} ${mItem[2] ?? ''}`
    if (acao === 'PUT ') {
      const erro = validarItem(conta, corpo)
      if (erro) return erro
      aplicarItem(i, corpo)
    } else if (acao === 'DELETE ') {
      conta.itens = conta.itens.filter(x => x !== i)
      salvar()
      return ok()
    } else if (acao === 'POST adquirir') i.qtdAdquirida += 1
    else if (acao === 'POST remover') i.qtdAdquirida = Math.max(i.qtdAdquirida - 1, 0)
    else if (acao === 'POST concluir') i.qtdAdquirida = Math.max(i.qtdAdquirida, i.qtdDesejada)
    else if (acao === 'POST compra') {
      const erros: Record<string, string[]> = {}
      if ((num(corpo.quantidade) ?? 0) < 1) erros.quantidade = ['Deve ser pelo menos 1.']
      if ((num(corpo.valor) ?? 0) < 0) erros.valor = ['Não pode ser negativo.']
      if (Object.keys(erros).length) return validacao(erros)
      registrarCompra(i, num(corpo.quantidade)!, corpo.origem as 'Comprado' | 'Ganhado', num(corpo.valor))
    } else if (acao === 'PUT foto') {
      const foto = corpoBruto instanceof FormData ? corpoBruto.get('foto') : null
      if (!(foto instanceof Blob)) return validacao({ foto: ['Envie uma foto.'] })
      if (foto.size > 5 * 1024 * 1024) return validacao({ foto: ['A foto pode ter no máximo 5 MB.'] })
      const anterior = i.fotoUrl
      i.fotoUrl = await lerArquivo(foto)
      if (!salvar()) {
        i.fotoUrl = anterior
        return validacao({ foto: ['Sem espaço no navegador para mais fotos nesta demonstração.'] })
      }
    } else if (acao === 'DELETE foto') {
      i.fotoUrl = null
      salvar()
      return ok()
    } else return naoEncontrado()
    // Endpoints.AlterarQuantidade: ações rápidas assumem "Comprado" quando a origem ainda não foi informada.
    if (['POST adquirir', 'POST remover', 'POST concluir'].includes(acao)) i.origem ??= 'Comprado'
    i.atualizadoEm = agora()
    salvar()
    return ok(paraDto(i, await perfilClima(e)))
  }

  if (rota === 'GET /painel') {
    const clima = await perfilClima(e)
    return ok(painel(e, conta.categorias, conta.itens, hoje(), clima))
  }
  if (rota === 'GET /clima') {
    const clima = await perfilClima(e)
    return clima ? ok(clima) : ok()
  }
  if (rota === 'GET /localizacao') return ok(await buscarLocais(url.searchParams.get('q') ?? ''))

  return naoEncontrado()
}

/** Passa a responder as chamadas /api/* no navegador. */
export function instalar() {
  window.fetch = async (input, init) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const url = new URL(href, location.origin)
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return fetchOriginal(input, init)
    await new Promise(r => setTimeout(r, 120)) // latência de rede simulada
    return tratar((init?.method ?? 'GET').toUpperCase(), url, init?.body)
  }
}
