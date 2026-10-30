// Convite pendente: o link "https://site/?convite=CODIGO" guarda o código até a pessoa entrar ou criar a conta.

const CHAVE = 'enxoval-convite'

/** Código digitado ou colado: só letras e números, em maiúsculas. */
export const normalizarConvite = (codigo: string) => codigo.toUpperCase().replace(/[^A-Z0-9]/g, '')

export function lerConvite(): string | null {
  try { return localStorage.getItem(CHAVE) } catch { return null }
}

export function guardarConvite(codigo: string) {
  try { localStorage.setItem(CHAVE, normalizarConvite(codigo)) } catch { /* sem armazenamento: digita o código depois */ }
}

export function esquecerConvite() {
  try { localStorage.removeItem(CHAVE) } catch { /* nada guardado */ }
}

/** Ao abrir o site: tira `?convite=` da barra de endereço e guarda o código. */
export function capturarConviteDaUrl(url: URL = new URL(location.href)) {
  const codigo = url.searchParams.get('convite')
  if (!codigo) return
  guardarConvite(codigo)
  url.searchParams.delete('convite')
  history.replaceState(null, '', url.pathname + url.search + url.hash)
}

export const linkDeConvite = (codigo: string, origem = location.origin) => `${origem}/?convite=${encodeURIComponent(codigo)}`
