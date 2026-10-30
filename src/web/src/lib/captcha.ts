import { modoDemo } from '../demo/modo'

// Cloudflare Turnstile (gratuito): o Supabase Auth exige o token em cadastro, login e "esqueci a senha" quando a
// proteção por CAPTCHA está ligada no painel (Authentication → Attack Protection). Sem VITE_TURNSTILE_SITE_KEY, desligado.
export const chaveSite = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export const captchaAtivo = !!chaveSite && !modoDemo
