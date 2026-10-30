import { describe, expect, it } from 'vitest'
import { temas, temasDisponiveis, todosOsTemas } from './paletas'

/** Razão de contraste WCAG entre duas cores #RRGGBB. */
function contraste(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

describe('temasDisponiveis', () => {
  it('menina: os quatro femininos e a Oliveira', () =>
    expect(temasDisponiveis('Feminino')).toEqual(['Cerejeira', 'Lavanda', 'Pessego', 'Jardim', 'Oliveira']))
  it('menino: os três masculinos e a Oliveira', () =>
    expect(temasDisponiveis('Masculino')).toEqual(['Ceu', 'Oceano', 'Ursinho', 'Oliveira']))
  it('sem sexo informado: todos', () => expect(temasDisponiveis('NaoInformado')).toHaveLength(8))
})

describe('contraste das paletas', () => {
  for (const id of todosOsTemas)
    for (const modo of ['claro', 'escuro'] as const) {
      const p = temas[id][modo]
      it(`${id} ${modo}: texto legível e principal visível`, () => {
        expect(contraste(p.texto, p.fundo)).toBeGreaterThanOrEqual(7)
        expect(contraste(p.textoSuave, p.superficie)).toBeGreaterThanOrEqual(3.5)
        // Botões: texto branco (claro) ou da cor do fundo (escuro) sobre a principal.
        expect(contraste(p.principal, modo === 'claro' ? '#FFFFFF' : p.fundo)).toBeGreaterThanOrEqual(3)
      })
    }
})
