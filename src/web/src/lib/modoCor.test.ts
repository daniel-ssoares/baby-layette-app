import { describe, expect, it } from 'vitest'
import { lerPreferencia, proximaPreferencia, resolverModo, salvarPreferencia } from './modoCor'

const memoria = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

describe('modo de cor', () => {
  it('automático segue o sistema; claro e escuro forçam', () => {
    expect(resolverModo('automatico', true)).toBe('escuro')
    expect(resolverModo('automatico', false)).toBe('claro')
    expect(resolverModo('claro', true)).toBe('claro')
    expect(resolverModo('escuro', false)).toBe('escuro')
  })

  it('guarda a preferência e ignora valores inválidos ou armazenamento bloqueado', () => {
    const a = memoria()
    expect(lerPreferencia(a)).toBe('automatico')
    salvarPreferencia('escuro', a)
    expect(lerPreferencia(a)).toBe('escuro')
    a.setItem('enxoval-modo-cor', 'roxo')
    expect(lerPreferencia(a)).toBe('automatico')
    expect(lerPreferencia({ getItem: () => { throw new Error('bloqueado') } })).toBe('automatico')
  })

  it('o botão percorre automático → claro → escuro', () => {
    expect(proximaPreferencia('automatico')).toBe('claro')
    expect(proximaPreferencia('claro')).toBe('escuro')
    expect(proximaPreferencia('escuro')).toBe('automatico')
  })
})
