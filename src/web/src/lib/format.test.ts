import { describe, expect, it } from 'vitest'
import { nossoBebe, oBebe, preposicaoBebe } from './format'

describe('tratamento do bebê', () => {
  it('usa o sexo informado', () => {
    expect(preposicaoBebe('Alice', 'Feminino')).toBe('da')
    expect(preposicaoBebe('Theo', 'Masculino')).toBe('do')
    expect(oBebe('Alice', 'Feminino')).toBe('a Alice')
    expect(oBebe('Theo', 'Masculino')).toBe('o Theo')
  })

  it('sem sexo é neutro e sem nome fala do bebê', () => {
    expect(preposicaoBebe('Sam', 'NaoInformado')).toBe('de')
    expect(oBebe('Sam', 'NaoInformado')).toBe('Sam')
    expect(preposicaoBebe(null, 'NaoInformado')).toBe('do')
    expect(oBebe(null, 'Feminino')).toBe('a bebê')
    expect(nossoBebe('NaoInformado')).toBe('Nosso bebê')
  })
})
