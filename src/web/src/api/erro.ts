/** Erro de uma chamada (API, Supabase ou demonstração): status HTTP equivalente e mensagem em português. */
export class ApiError extends Error {
  readonly status: number
  readonly codigos: string[]
  constructor(message: string, status: number, codigos: string[] = []) {
    super(message)
    this.status = status
    this.codigos = codigos
  }
}
