import { describe, expect, it } from 'vitest'
import { mensagemDeErro } from './erros'

describe('mensagemDeErro', () => {
  it('traduz códigos do Identity', () => {
    expect(mensagemDeErro(400, ['DuplicateUserName', 'DuplicateEmail'])).toBe('Já existe uma conta com este e-mail.')
    expect(mensagemDeErro(400, ['PasswordTooShort'], 'Passwords must be at least 8 characters.'))
      .toBe('A senha precisa ter pelo menos 8 caracteres.')
  })

  it('401 vira credenciais inválidas e LockedOut é reconhecido pelo detalhe', () => {
    expect(mensagemDeErro(401, [], 'Failed')).toBe('E-mail ou senha incorretos.')
    expect(mensagemDeErro(401, [], 'LockedOut')).toMatch(/Muitas tentativas/)
  })

  it('mantém mensagens da própria API', () => {
    expect(mensagemDeErro(409, [], 'Já existe uma categoria com esse nome.')).toBe('Já existe uma categoria com esse nome.')
  })
})
