const EVENTO_ERRO = 'enxoval:erro'

/** Mostra um aviso de erro global (exibido pelo Snackbar do App). */
export const avisarErro = (mensagem: string) =>
  window.dispatchEvent(new CustomEvent(EVENTO_ERRO, { detail: mensagem }))

export function ouvirErros(callback: (mensagem: string) => void) {
  const ouvir = (e: Event) => callback((e as CustomEvent<string>).detail)
  window.addEventListener(EVENTO_ERRO, ouvir)
  return () => window.removeEventListener(EVENTO_ERRO, ouvir)
}
