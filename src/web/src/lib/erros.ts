// Códigos do ASP.NET Core Identity → mensagens em português.
const mensagens: Record<string, string> = {
  PasswordTooShort: 'A senha precisa ter pelo menos 8 caracteres.',
  DuplicateUserName: 'Já existe uma conta com este e-mail.',
  DuplicateEmail: 'Já existe uma conta com este e-mail.',
  InvalidEmail: 'E-mail inválido.',
  InvalidUserName: 'E-mail inválido.',
  PasswordMismatch: 'Senha atual incorreta.',
  LockedOut: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
}

/** Mensagem amigável para um erro da API. */
export function mensagemDeErro(status: number, codigos: string[], detalhe?: string): string {
  const conhecido = codigos.map(c => mensagens[c]).find(Boolean)
  if (conhecido) return conhecido
  if (detalhe && mensagens[detalhe]) return mensagens[detalhe]
  if (status === 401) return 'E-mail ou senha incorretos.'
  return detalhe ?? `Erro ${status}`
}
