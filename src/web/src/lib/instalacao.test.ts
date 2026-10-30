import { describe, expect, it } from 'vitest'
import { comoInstalar, ehIos } from './instalacao'

const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1'
const ipadOs = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15'
const android = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36'

describe('ehIos', () => {
  it('reconhece iPhone e iPad com iPadOS (que se diz Mac, mas tem toque)', () => {
    expect(ehIos(iphone, 5)).toBe(true)
    expect(ehIos(ipadOs, 5)).toBe(true)
  })
  it('Mac de verdade e Android não são iOS', () => {
    expect(ehIos(ipadOs, 0)).toBe(false)
    expect(ehIos(android, 5)).toBe(false)
  })
})

describe('comoInstalar', () => {
  it('não mostra nada se já abriu como app', () => {
    expect(comoInstalar({ instalado: true, temPedido: true, ios: true })).toBeNull()
  })
  it('mostra o botão quando o navegador oferece o pedido de instalação', () => {
    expect(comoInstalar({ instalado: false, temPedido: true, ios: false })).toBe('botao')
  })
  it('no iOS mostra a instrução manual', () => {
    expect(comoInstalar({ instalado: false, temPedido: false, ios: true })).toBe('ios')
  })
  it('sem pedido e fora do iOS (ex.: desktop já instalado ou navegador sem suporte), nada', () => {
    expect(comoInstalar({ instalado: false, temPedido: false, ios: false })).toBeNull()
  })
})
