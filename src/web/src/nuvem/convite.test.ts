import { beforeEach, describe, expect, it } from 'vitest'
import { capturarConviteDaUrl, esquecerConvite, lerConvite, linkDeConvite, normalizarConvite } from './convite'

describe('convite', () => {
  beforeEach(() => esquecerConvite())

  it('normaliza o código digitado', () => expect(normalizarConvite(' ab12-cd 34 ')).toBe('AB12CD34'))

  it('guarda o código do link e limpa a barra de endereço', () => {
    history.replaceState(null, '', '/painel?convite=ab12cd&x=1')
    capturarConviteDaUrl()
    expect(lerConvite()).toBe('AB12CD')
    expect(location.pathname + location.search).toBe('/painel?x=1')
  })

  it('sem convite no link, não guarda nada', () => {
    history.replaceState(null, '', '/')
    capturarConviteDaUrl()
    expect(lerConvite()).toBeNull()
  })

  it('monta o link de convite', () =>
    expect(linkDeConvite('AB12', 'https://enxoval.app')).toBe('https://enxoval.app/?convite=AB12'))
})
