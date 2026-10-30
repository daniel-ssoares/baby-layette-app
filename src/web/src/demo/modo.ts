// Demonstração: mesmas telas, sem conta real; os dados ficam só no navegador (demo/servidor.ts).
// Ligada pelo botão "Ver demonstração" da tela de entrada (fica salvo neste navegador) ou por VITE_DEMO=true no build.

const CHAVE = 'enxoval-modo-demo'

function lerFlag() {
  try { return localStorage.getItem(CHAVE) === '1' } catch { return false }
}

export const modoDemo = import.meta.env.VITE_DEMO === 'true' || lerFlag()

/** Só o build com VITE_DEMO=true não tem como sair da demonstração. */
export const demoFixa = import.meta.env.VITE_DEMO === 'true'

export function entrarNaDemo() {
  try { localStorage.setItem(CHAVE, '1') } catch { /* sem armazenamento: não há como lembrar */ }
  location.assign('/')
}

export function sairDaDemo() {
  try { localStorage.removeItem(CHAVE) } catch { /* nada guardado */ }
  location.assign('/')
}

/** Conta com dados fictícios da demonstração. */
export const contaDemo = { email: 'demo@enxoval.local', senha: 'demo1234' }
