/** Evento do Chrome/Android que permite mostrar o pedido de instalação no nosso botão. */
export interface PedidoInstalacao extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type ComoInstalar = 'botao' | 'ios' | null

/** iPhone/iPad (o iPadOS se apresenta como Mac, mas tem toque). */
export const ehIos = (userAgent: string, pontosDeToque: number) =>
  /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && pontosDeToque > 1)

/**
 * Que dica de instalação mostrar: nenhuma se já abriu como app;
 * botão quando o navegador oferece o pedido (Android/Chrome/Edge);
 * instrução manual no iOS (o Safari não tem pedido de instalação).
 */
export function comoInstalar(o: { instalado: boolean; temPedido: boolean; ios: boolean }): ComoInstalar {
  if (o.instalado) return null
  if (o.temPedido) return 'botao'
  return o.ios ? 'ios' : null
}

/** Aberto pelo ícone da tela inicial (modo app). */
export const abertoComoApp = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true
