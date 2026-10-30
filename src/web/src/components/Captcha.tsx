import { useEffect, useRef } from 'react'
import { Box, useTheme } from '@mui/material'
import { captchaAtivo, chaveSite } from '../lib/captcha'

interface Turnstile {
  render: (el: HTMLElement, opcoes: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global { interface Window { turnstile?: Turnstile } }

let script: Promise<void> | null = null
function carregarScript() {
  script ??= new Promise((ok, erro) => {
    const s = Object.assign(document.createElement('script'), {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', async: true,
    })
    s.onload = () => ok()
    s.onerror = () => { script = null; erro(new Error('Não foi possível carregar a verificação anti-robô.')) }
    document.head.append(s)
  })
  return script
}

/**
 * Verificação anti-robô. Chama `onToken` com o token (ou null quando expira). O token vale uma vez:
 * troque `versao` depois de cada tentativa para gerar outro.
 */
export default function Captcha({ onToken, versao = 0 }: { onToken: (t: string | null) => void; versao?: number }) {
  const el = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const retorno = useRef(onToken)
  const modo = useTheme().palette.mode

  useEffect(() => { retorno.current = onToken })

  useEffect(() => {
    if (!captchaAtivo) return
    let ativo = true
    carregarScript().then(() => {
      if (!ativo || !el.current || !window.turnstile) return
      widget.current = window.turnstile.render(el.current, {
        sitekey: chaveSite, language: 'pt-br', theme: modo === 'dark' ? 'dark' : 'light', size: 'flexible',
        callback: (t: string) => retorno.current(t),
        'expired-callback': () => retorno.current(null),
        'error-callback': () => retorno.current(null),
      })
    }).catch(() => retorno.current(null))
    return () => {
      ativo = false
      if (widget.current) window.turnstile?.remove(widget.current)
      widget.current = null
    }
  }, [modo])

  useEffect(() => {
    if (versao && widget.current) { window.turnstile?.reset(widget.current); retorno.current(null) }
  }, [versao])

  if (!captchaAtivo) return null
  return <Box ref={el} sx={{ minHeight: 65, width: '100%' }} />
}
