// Back-end do app sobre o Supabase: mesmas funções de apiHttp (api/client.ts), para as telas não saberem a diferença.
// Login = Supabase Auth; dados = Postgres com RLS (cada um só enxerga o próprio enxoval); fotos = Storage privado.
// Regras de negócio em lib/dominio.ts; esquema e funções em supabase/01-esquema.sql.
import type { AuthError, PostgrestError } from '@supabase/supabase-js'
import type { Api } from '../api/client'
import { ApiError } from '../api/erro'
import type {
  AtualizarEnxoval, BoasVindas, Categoria, Enxoval, Item, Membro, Painel, RegistrarCompra, SalvarCategoria, SalvarItem,
  TemaVisual,
} from '../api/types'
import { buscarLocais, perfilClima } from '../lib/clima'
import { painel, paraDto, registrarCompra, type CategoriaSalva, type ItemSalvo } from '../lib/dominio'
import { temasDisponiveis, todosOsTemas } from '../temas/paletas'
import { supabase } from './supabase'
import { esquecerConvite, lerConvite } from './convite'

// ---- Erros → ApiError (mesmos status/mensagens que a API .NET devolvia) ----

const semConexao = () => new ApiError('Não foi possível conectar ao servidor. Verifique a internet e tente de novo.', 0)

function erroBanco(e: PostgrestError): ApiError {
  if (e.message?.includes('Failed to fetch')) return semConexao()
  switch (e.code) {
    case '23505': return new ApiError('Já existe uma categoria com esse nome.', 409)
    case '23503': return e.message.includes('delete')
      ? new ApiError('Mova ou exclua os itens desta categoria antes de excluí-la.', 409)
      : new ApiError('Categoria inválida.', 400)
    case '23514': return new ApiError('Algum valor está fora do permitido.', 400)
    case 'P0001': return new ApiError(e.message, 400)
    case 'PGRST116': return new ApiError('Não encontrado.', 404)
    case '28000': case 'PGRST301': case 'PGRST303': return new ApiError('Sua sessão expirou. Entre de novo.', 401)
    case '42501': return new ApiError('Sem permissão para isso.', 403)
    default: return new ApiError(e.message || 'Erro inesperado.', 500)
  }
}

const mensagensAuth: Record<string, [string, number]> = {
  invalid_credentials: ['E-mail ou senha incorretos.', 401],
  email_not_confirmed: ['Confirme o e-mail pelo link que enviamos antes de entrar.', 400],
  user_already_exists: ['Já existe uma conta com este e-mail.', 400],
  email_exists: ['Já existe uma conta com este e-mail.', 400],
  weak_password: ['A senha precisa ter pelo menos 8 caracteres.', 400],
  email_address_invalid: ['E-mail inválido.', 400],
  validation_failed: ['E-mail inválido.', 400],
  over_email_send_rate_limit: ['Muitos e-mails enviados agora. Aguarde alguns minutos e tente de novo.', 429],
  over_request_rate_limit: ['Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429],
  same_password: ['A nova senha precisa ser diferente da atual.', 400],
}

function erroAuth(e: AuthError): ApiError {
  if (e.name === 'AuthRetryableFetchError' || e.message?.includes('Failed to fetch')) return semConexao()
  const [mensagem, status] = mensagensAuth[e.code ?? ''] ?? [e.message, e.status ?? 400]
  return new ApiError(mensagem, status, e.code ? [e.code] : [])
}

/** Resultado de uma consulta do Supabase: devolve os dados ou lança ApiError. */
function dados<T>({ data, error }: { data: T; error: PostgrestError | null }): T {
  if (error) throw erroBanco(error)
  return data
}

async function exigirSessao() {
  const { data } = await supabase().auth.getSession()
  if (!data.session) throw new ApiError('Sua sessão expirou. Entre de novo.', 401)
  return data.session
}

// ---- Linhas do banco (snake_case) ↔ objetos do app ----

interface LinhaEnxoval {
  id: number; nome_bebe: string | null; sexo: Enxoval['sexo']; data_prevista_parto: string | null; orcamento: number | null
  cidade: string | null; latitude: number | null; longitude: number | null; tema: TemaVisual; boas_vindas_concluidas: boolean
}
interface LinhaItem {
  id: number; categoria_id: number; nome: string; tamanho: string | null; qtd_desejada: number; qtd_adquirida: number
  prioridade: Item['prioridade']; clima: Item['clima']; preco_unitario_estimado: number | null; valor_pago: number | null
  origem: Item['origem']; loja_link: string | null; observacoes: string | null; foto: string | null; atualizado_em: string
}

const numero = (v: number | string | null) => (v == null ? null : Number(v))

const paraEnxoval = (r: LinhaEnxoval): Enxoval => ({
  id: r.id, nomeBebe: r.nome_bebe, sexo: r.sexo, dataPrevistaParto: r.data_prevista_parto, orcamento: numero(r.orcamento),
  cidade: r.cidade, latitude: r.latitude, longitude: r.longitude, tema: r.tema, boasVindasConcluidas: r.boas_vindas_concluidas,
})

const paraItemSalvo = (r: LinhaItem, fotoUrl: string | null): ItemSalvo => ({
  id: r.id, categoriaId: r.categoria_id, nome: r.nome, tamanho: r.tamanho, qtdDesejada: r.qtd_desejada,
  qtdAdquirida: r.qtd_adquirida, prioridade: r.prioridade, clima: r.clima,
  precoUnitarioEstimado: numero(r.preco_unitario_estimado), valorPago: numero(r.valor_pago), origem: r.origem,
  lojaLink: r.loja_link, observacoes: r.observacoes, fotoUrl, atualizadoEm: r.atualizado_em,
})

const limpar = (s: string | null | undefined) => (s?.trim() ? s.trim() : null)

function validarItem(d: SalvarItem) {
  const erros: Record<string, string> = {}
  if (!limpar(d.nome)) erros.nome = 'Informe o nome.'
  if (!(d.qtdDesejada >= 1)) erros.qtdDesejada = 'Deve ser pelo menos 1.'
  if ((d.qtdAdquirida ?? 0) < 0) erros.qtdAdquirida = 'Não pode ser negativa.'
  if ((d.precoUnitarioEstimado ?? 0) < 0) erros.precoUnitarioEstimado = 'Não pode ser negativo.'
  if ((d.valorPago ?? 0) < 0) erros.valorPago = 'Não pode ser negativo.'
  const [campo, msg] = Object.entries(erros)[0] ?? []
  if (campo) throw new ApiError(msg, 400, [campo])
}

const colunasItem = (d: SalvarItem) => ({
  categoria_id: d.categoriaId, nome: limpar(d.nome), tamanho: limpar(d.tamanho), qtd_desejada: d.qtdDesejada,
  qtd_adquirida: d.qtdAdquirida ?? 0, prioridade: d.prioridade ?? 'Media', clima: d.clima ?? 'Todos',
  preco_unitario_estimado: d.precoUnitarioEstimado, valor_pago: d.valorPago, origem: d.origem ?? null,
  loja_link: limpar(d.lojaLink), observacoes: limpar(d.observacoes),
})

const hoje = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ---- Enxoval da sessão ----

let enxovalId: Promise<number> | null = null

/**
 * Enxoval de quem está logado. Primeiro acesso: aceita o convite guardado (link de convite) ou cria um enxoval novo
 * com a lista-padrão. Quem já tem enxoval e abre um convite decide na tela (AceitarConvite), não aqui.
 */
function meuEnxovalId(): Promise<number> {
  enxovalId ??= (async () => {
    const sessao = await exigirSessao()
    const membro = dados(await supabase().from('membros').select('enxoval_id').eq('usuario_id', sessao.user.id).maybeSingle())
    if (membro) return membro.enxoval_id as number
    const convite = lerConvite()
    if (convite) {
      const aceito = await supabase().rpc('aceitar_convite', { p_codigo: convite })
      esquecerConvite()
      if (!aceito.error) return aceito.data as number
    }
    return dados(await supabase().rpc('garantir_enxoval')) as number
  })().catch(e => { enxovalId = null; throw e })
  return enxovalId
}

/** Login/logout/convite aceito: o enxoval da sessão muda. */
function esquecerEnxoval() { enxovalId = null }

async function carregarEnxoval(): Promise<Enxoval> {
  const id = await meuEnxovalId()
  return paraEnxoval(dados(await supabase().from('enxovais').select('*').eq('id', id).single()) as LinhaEnxoval)
}

// ---- Fotos: URLs assinadas (bucket privado), guardadas para não recarregar as imagens a cada consulta ----

const VALIDADE_URL = 60 * 60 * 24 // 1 dia
const urlsFoto = new Map<string, { url: string; expira: number }>()

async function urlsDasFotos(caminhos: string[]): Promise<Map<string, string>> {
  const agora = Date.now()
  const faltam = caminhos.filter(c => (urlsFoto.get(c)?.expira ?? 0) < agora + 60_000)
  if (faltam.length) {
    const { data } = await supabase().storage.from('fotos').createSignedUrls(faltam, VALIDADE_URL)
    for (const r of data ?? []) if (r.path && r.signedUrl) urlsFoto.set(r.path, { url: r.signedUrl, expira: agora + VALIDADE_URL * 1000 })
  }
  return new Map(caminhos.flatMap(c => (urlsFoto.has(c) ? [[c, urlsFoto.get(c)!.url] as const] : [])))
}

async function itensSalvos(): Promise<ItemSalvo[]> {
  const id = await meuEnxovalId()
  const linhas = dados(await supabase().from('itens').select('*').eq('enxoval_id', id).order('id')) as LinhaItem[]
  const urls = await urlsDasFotos(linhas.flatMap(l => (l.foto ? [l.foto] : [])))
  return linhas.map(l => paraItemSalvo(l, l.foto ? urls.get(l.foto) ?? null : null))
}

async function itemDto(linha: LinhaItem): Promise<Item> {
  const [enxoval, urls] = await Promise.all([carregarEnxoval(), urlsDasFotos(linha.foto ? [linha.foto] : [])])
  return paraDto(paraItemSalvo(linha, linha.foto ? urls.get(linha.foto) ?? null : null), await perfilClima(enxoval))
}

async function lerItem(id: number): Promise<LinhaItem> {
  return dados(await supabase().from('itens').select('*').eq('id', id).single()) as LinhaItem
}

async function gravarItem(id: number, colunas: Partial<LinhaItem>): Promise<Item> {
  return itemDto(dados(await supabase().from('itens').update(colunas).eq('id', id).select('*').single()) as LinhaItem)
}

/** Ações rápidas (+1, −1, concluir) assumem "Comprado" quando a origem ainda não foi informada (como a API .NET). */
async function alterarQuantidade(id: number, nova: (atual: LinhaItem) => number): Promise<Item> {
  const atual = await lerItem(id)
  return gravarItem(id, { qtd_adquirida: nova(atual), origem: atual.origem ?? 'Comprado' })
}

const extensao: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export const apiNuvem: Api = {
  // ---- Conta ----
  eu: async () => {
    const { data } = await supabase().auth.getSession()
    return data.session ? { email: data.session.user.email ?? '' } : null
  },
  entrar: async (email, senha) => {
    esquecerEnxoval()
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error) throw erroAuth(error)
  },
  cadastrar: async (email, senha) => {
    const { error } = await supabase().auth.signUp({ email: email.trim(), password: senha, options: { emailRedirectTo: location.origin } })
    if (error) throw erroAuth(error)
  },
  sair: async () => {
    esquecerEnxoval()
    urlsFoto.clear()
    await supabase().auth.signOut()
  },
  trocarSenha: async (atual, nova) => {
    const sessao = await exigirSessao()
    // Confere a senha atual antes de trocar (o Supabase troca só com a sessão).
    const conferida = await supabase().auth.signInWithPassword({ email: sessao.user.email ?? '', password: atual })
    if (conferida.error) throw new ApiError('Senha atual incorreta.', 400, ['PasswordMismatch'])
    const { error } = await supabase().auth.updateUser({ password: nova })
    if (error) throw erroAuth(error)
  },
  esqueciSenha: async email => {
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/redefinir-senha` })
    if (error) throw erroAuth(error)
  },
  redefinirSenha: async nova => {
    const { error } = await supabase().auth.updateUser({ password: nova })
    if (error) throw erroAuth(error)
  },

  // ---- Casal (convites) ----
  membros: async () => {
    const [sessao, id] = await Promise.all([exigirSessao(), meuEnxovalId()])
    const linhas = dados(await supabase().from('membros').select('usuario_id, email, entrou_em').eq('enxoval_id', id).order('entrou_em'))
    return (linhas as { usuario_id: string; email: string; entrou_em: string }[])
      .map((m): Membro => ({ email: m.email, entrouEm: m.entrou_em, eu: m.usuario_id === sessao.user.id }))
  },
  criarConvite: async () => {
    await meuEnxovalId()
    return dados(await supabase().rpc('criar_convite')) as string
  },
  aceitarConvite: async codigo => {
    await exigirSessao()
    dados(await supabase().rpc('aceitar_convite', { p_codigo: codigo }))
    esquecerConvite()
    esquecerEnxoval()
  },

  // ---- Enxoval ----
  enxoval: carregarEnxoval,
  atualizarEnxoval: async (d: AtualizarEnxoval) => {
    if ((d.orcamento ?? 0) < 0) throw new ApiError('Não pode ser negativo.', 400, ['orcamento'])
    const id = await meuEnxovalId()
    dados(await supabase().from('enxovais').update({
      nome_bebe: limpar(d.nomeBebe), sexo: d.sexo, data_prevista_parto: d.dataPrevistaParto || null, orcamento: d.orcamento,
      cidade: d.latitude == null ? null : limpar(d.cidade), latitude: d.latitude, longitude: d.longitude,
    }).eq('id', id))
  },
  trocarTema: async tema => {
    if (!todosOsTemas.includes(tema)) throw new ApiError('Tema inválido.', 400, ['tema'])
    const id = await meuEnxovalId()
    dados(await supabase().from('enxovais').update({ tema }).eq('id', id))
  },
  concluirBoasVindas: async (d: BoasVindas) => {
    if (d.tema && !temasDisponiveis(d.sexo ?? 'NaoInformado').includes(d.tema))
      throw new ApiError('Escolha um dos temas oferecidos para o sexo informado.', 400, ['tema'])
    const atual = await carregarEnxoval()
    dados(await supabase().from('enxovais').update({
      nome_bebe: limpar(d.nomeBebe) ?? atual.nomeBebe, data_prevista_parto: d.dataPrevistaParto ?? atual.dataPrevistaParto,
      sexo: d.sexo ?? atual.sexo, tema: d.tema ?? atual.tema, boas_vindas_concluidas: true,
    }).eq('id', atual.id))
  },

  // ---- Categorias ----
  categorias: async () => {
    const id = await meuEnxovalId()
    const linhas = dados(await supabase().from('categorias').select('id, nome, ordem, itens(count)').eq('enxoval_id', id).order('ordem'))
    return (linhas as { id: number; nome: string; ordem: number; itens: { count: number }[] }[])
      .map((c): Categoria => ({ id: c.id, nome: c.nome, ordem: c.ordem, totalItens: c.itens[0]?.count ?? 0 }))
  },
  criarCategoria: async (d: SalvarCategoria) => {
    const nome = limpar(d.nome)
    if (!nome) throw new ApiError('Informe o nome.', 400, ['nome'])
    const id = await meuEnxovalId()
    const c = dados(await supabase().from('categorias').insert({ enxoval_id: id, nome, ordem: d.ordem ?? 0 }).select('id, nome, ordem').single())
    return { ...(c as CategoriaSalva), totalItens: 0 }
  },
  atualizarCategoria: async (id, d) => {
    const nome = limpar(d.nome)
    if (!nome) throw new ApiError('Informe o nome.', 400, ['nome'])
    dados(await supabase().from('categorias').update({ nome, ordem: d.ordem }).eq('id', id))
  },
  excluirCategoria: async id => {
    dados(await supabase().from('categorias').delete().eq('id', id))
  },

  // ---- Itens ----
  itens: async () => {
    const [enxoval, itens] = await Promise.all([carregarEnxoval(), itensSalvos()])
    const clima = await perfilClima(enxoval)
    return itens.map(i => paraDto(i, clima))
  },
  criarItem: async d => {
    validarItem(d)
    const id = await meuEnxovalId()
    return itemDto(dados(await supabase().from('itens').insert({ enxoval_id: id, ...colunasItem(d) }).select('*').single()) as LinhaItem)
  },
  atualizarItem: async (id, d) => {
    validarItem(d)
    return gravarItem(id, colunasItem(d) as Partial<LinhaItem>)
  },
  excluirItem: async id => {
    const { foto } = await lerItem(id)
    dados(await supabase().from('itens').delete().eq('id', id))
    if (foto) await supabase().storage.from('fotos').remove([foto])
  },
  adquirirItem: id => alterarQuantidade(id, i => i.qtd_adquirida + 1),
  removerItem: id => alterarQuantidade(id, i => Math.max(i.qtd_adquirida - 1, 0)),
  concluirItem: id => alterarQuantidade(id, i => Math.max(i.qtd_adquirida, i.qtd_desejada)),
  registrarCompra: async ({ id, quantidade, origem, valor }: RegistrarCompra & { id: number }) => {
    if (!(quantidade >= 1)) throw new ApiError('Deve ser pelo menos 1.', 400, ['quantidade'])
    if ((valor ?? 0) < 0) throw new ApiError('Não pode ser negativo.', 400, ['valor'])
    const item = paraItemSalvo(await lerItem(id), null)
    registrarCompra(item, quantidade, origem, valor)
    return gravarItem(id, { qtd_adquirida: item.qtdAdquirida, valor_pago: item.valorPago, origem: item.origem })
  },
  enviarFoto: async (id, foto) => {
    const ext = extensao[foto.type]
    if (!ext) throw new ApiError('Envie uma foto JPEG, PNG ou WebP.', 400, ['foto'])
    if (foto.size > 5 * 1024 * 1024) throw new ApiError('A foto pode ter no máximo 5 MB.', 400, ['foto'])
    const [enxoval, anterior] = await Promise.all([meuEnxovalId(), lerItem(id)])
    const caminho = `${enxoval}/${id}-${Date.now()}.${ext}`
    const envio = await supabase().storage.from('fotos').upload(caminho, foto, { contentType: foto.type })
    if (envio.error) throw new ApiError('Não foi possível enviar a foto. Tente de novo.', 400, ['foto'])
    const item = await gravarItem(id, { foto: caminho })
    if (anterior.foto) await supabase().storage.from('fotos').remove([anterior.foto])
    return item
  },
  removerFoto: async id => {
    const { foto } = await lerItem(id)
    dados(await supabase().from('itens').update({ foto: null }).eq('id', id))
    if (foto) await supabase().storage.from('fotos').remove([foto])
  },

  // ---- Painel e clima ----
  painel: async (): Promise<Painel> => {
    const id = await meuEnxovalId()
    const [enxoval, itens, categorias] = await Promise.all([
      carregarEnxoval(), itensSalvos(),
      supabase().from('categorias').select('id, nome, ordem').eq('enxoval_id', id).order('ordem').then(dados),
    ])
    return painel(enxoval, categorias as CategoriaSalva[], itens, hoje(), await perfilClima(enxoval))
  },
  buscarLocais,
}
