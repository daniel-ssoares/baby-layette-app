export const LADO_MAXIMO = 1600

/** Dimensões finais mantendo a proporção, sem ampliar imagens pequenas. */
export function dimensoesReduzidas(largura: number, altura: number, max = LADO_MAXIMO) {
  const escala = Math.min(1, max / Math.max(largura, altura))
  return { largura: Math.round(largura * escala), altura: Math.round(altura * escala) }
}

/**
 * Reduz fotos de celular (vários MB) para JPEG de até 1600px antes do upload.
 * Se o navegador não conseguir processar, envia o arquivo original (a API valida formato e tamanho).
 */
export async function reduzirImagem(arquivo: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
    const { largura, altura } = dimensoesReduzidas(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, largura, altura)
    bitmap.close()
    const blob = await new Promise<Blob | null>(ok => canvas.toBlob(ok, 'image/jpeg', 0.85))
    return blob ?? arquivo
  } catch {
    return arquivo
  }
}
