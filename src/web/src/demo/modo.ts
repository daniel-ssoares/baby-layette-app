/** Build de demonstração (VITE_DEMO=true, ver .env.production): sem API, dados só no navegador. */
export const modoDemo = import.meta.env.VITE_DEMO === 'true'

/** Conta com dados fictícios (mesma de src/Enxoval.Api/Data/DadosDemonstracao.cs). */
export const contaDemo = { email: 'demo@enxoval.local', senha: 'demo1234' }
