import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from '../api/client'
import { contaDemo } from './modo'

// Sem rede: Open-Meteo "fora do ar" (clima fica nulo, como na API real).
beforeAll(async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))
  ;(await import('./servidor')).instalar()
})
beforeEach(() => api.sair().catch(() => undefined))

const falha = (p: Promise<unknown>) => p.then(() => null, (e: ApiError) => ({ status: e.status, mensagem: e.message }))

describe('servidor da demonstração', () => {
  it('sem login responde 401; senha errada não entra', async () => {
    expect(await api.eu()).toBeNull()
    expect(await falha(api.entrar(contaDemo.email, 'errada'))).toMatchObject({ status: 401, mensagem: 'E-mail ou senha incorretos.' })
  })

  it('conta demo vem com dados fictícios e progresso', async () => {
    await api.entrar(contaDemo.email, contaDemo.senha)
    expect(await api.eu()).toMatchObject({ email: contaDemo.email })
    const e = await api.enxoval()
    expect(e).toMatchObject({ nomeBebe: 'Theo', boasVindasConcluidas: true })
    const p = await api.painel()
    expect(p.resumo.concluidos).toBeGreaterThan(0)
    expect(p.resumo.gestacao?.diasParaParto).toBe(150)
  })

  it('registrar compra atualiza item e gasto', async () => {
    await api.entrar(contaDemo.email, contaDemo.senha)
    const antes = (await api.painel()).resumo.totalGasto
    const alvo = (await api.itens()).find(i => i.status === 'Pendente')!
    const i = await api.registrarCompra({ id: alvo.id, quantidade: 1, origem: 'Comprado', valor: 42 })
    expect(i.qtdAdquirida).toBe(1)
    expect((await api.painel()).resumo.totalGasto).toBe(antes + 42)
    expect(await falha(api.registrarCompra({ id: alvo.id, quantidade: 0, origem: 'Comprado', valor: null }))).toMatchObject({ status: 400 })
  })

  it('criar conta: lista-padrão sem compras, boas-vindas pendente, e-mail repetido recusado', async () => {
    await api.cadastrar('casal@exemplo.com', 'senha-boa-123')
    await api.entrar('casal@exemplo.com', 'senha-boa-123')
    expect((await api.enxoval()).boasVindasConcluidas).toBe(false)
    expect((await api.itens()).every(i => i.qtdAdquirida === 0)).toBe(true)
    expect((await api.enxoval()).tema).toBe('Oliveira')
    expect(await falha(api.concluirBoasVindas({ nomeBebe: 'Alice', dataPrevistaParto: null, sexo: 'Masculino', tema: 'Jardim' })))
      .toMatchObject({ status: 400 })
    await api.concluirBoasVindas({ nomeBebe: 'Alice', dataPrevistaParto: null, sexo: 'Feminino', tema: 'Jardim' })
    expect(await api.enxoval()).toMatchObject({ nomeBebe: 'Alice', sexo: 'Feminino', tema: 'Jardim' })
    await api.trocarTema('Oceano')
    expect((await api.enxoval()).tema).toBe('Oceano')
    expect(await falha(api.cadastrar('casal@exemplo.com', 'outra-senha-1'))).toMatchObject({ mensagem: 'Já existe uma conta com este e-mail.' })
    expect(await falha(api.cadastrar('novo@exemplo.com', 'curta'))).toMatchObject({ mensagem: 'A senha precisa ter pelo menos 8 caracteres.' })
  })

  it('categoria com itens não pode ser excluída; foto vira data URL', async () => {
    await api.entrar(contaDemo.email, contaDemo.senha)
    const [c] = await api.categorias()
    expect(await falha(api.excluirCategoria(c.id))).toMatchObject({ status: 409 })
    const [i] = await api.itens()
    const comFoto = await api.enviarFoto(i.id, new Blob(['x'], { type: 'image/png' }))
    expect(comFoto.fotoUrl).toMatch(/^data:image\/png/)
  })
})
