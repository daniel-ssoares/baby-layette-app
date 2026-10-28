import { useNavigate } from 'react-router'
import { Box, Button, Card, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material'
import SavingsIcon from '@mui/icons-material/Savings'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import { useEnxoval, usePainel } from '../api/hooks'
import { dataBR, moeda, nossoBebe } from '../lib/format'
import { visualCategoria } from '../lib/categorias'
import { cores, fonteNome } from '../theme'
import Carregando from '../components/Carregando'
import ClimaCard from '../components/ClimaCard'
import RamoOliveira from '../components/RamoOliveira'
import IconeCategoria from '../components/IconeCategoria'

function Anel({ valor }: { valor: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <CircularProgress variant="determinate" value={100} size={104} thickness={5} sx={{ color: 'rgba(255,255,255,0.6)' }} />
      <CircularProgress variant="determinate" value={valor} size={104} thickness={5}
        sx={{ position: 'absolute', left: 0, color: 'primary.main', '& circle': { strokeLinecap: 'round' } }} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" sx={{ lineHeight: 1 }}>{Math.round(valor)}%</Typography>
        <Typography variant="caption" color="text.secondary">pronto</Typography>
      </Box>
    </Box>
  )
}

function Valor({ titulo, valor, detalhe, Icone, cor, fundo }: {
  titulo: string; valor: string; detalhe?: string; Icone: typeof SavingsIcon; cor: string; fundo: string
}) {
  return (
    <Card sx={{ p: 2, flex: '1 1 160px' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: fundo, color: cor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icone fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">{titulo}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{valor}</Typography>
        </Box>
      </Stack>
      {detalhe && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{detalhe}</Typography>}
    </Card>
  )
}

export default function PainelPage() {
  const painel = usePainel()
  const enxoval = useEnxoval()
  const navigate = useNavigate()
  if (!painel.data || !enxoval.data) return <Carregando erro={painel.error ?? enxoval.error} />

  const { resumo, pendentesAltaPrioridade } = painel.data
  const g = resumo.gestacao
  const nomeCategoria = new Map(resumo.categorias.map(c => [c.categoriaId, c.nome]))
  const nome = enxoval.data.nomeBebe

  return (
    <Stack spacing={3}>
      <Card sx={{
        p: { xs: 2.5, sm: 3.5 }, border: 'none', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${cores.olivaClara} 0%, ${cores.creme} 55%, ${cores.rosaClaro} 100%)`,
      }}>
        <RamoOliveira tamanho={220} sx={{ position: 'absolute', right: -40, bottom: -30, opacity: 0.18, transform: 'scaleX(-1)' }} />
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <Box>
            <Typography sx={{ fontFamily: fonteNome, fontSize: { xs: 44, sm: 56 }, fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
              {nome || nossoBebe(enxoval.data.sexo)}
            </Typography>
            {g ? (
              <>
                <Typography variant="h5" sx={{ mt: 2, fontSize: { xs: 20, sm: 26 } }}>
                  {g.semanas} semanas{g.dias > 0 && <Box component="span" sx={{ fontWeight: 600 }}> e {g.dias} {g.dias === 1 ? 'dia' : 'dias'}</Box>}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Faltam <b>{g.diasParaParto} dias</b> · previsão {dataBR(enxoval.data.dataPrevistaParto)}
                </Typography>
              </>
            ) : (
              <Typography variant="h5" sx={{ mt: 0.5 }}>{resumo.concluidos} de {resumo.totalItens} itens</Typography>
            )}
            {g && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {resumo.concluidos} de {resumo.totalItens} itens prontos
            </Typography>}
          </Box>
          <Anel valor={resumo.percentualGeral} />
        </Stack>
      </Card>

      <ClimaCard clima={painel.data.clima} foraDaEstacao={resumo.foraDaEstacao} />

      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Valor titulo="Essencial (antes do parto)" valor={moeda(resumo.totalEstimadoEssencial)}
          detalhe={`Com opcionais: ${moeda(resumo.totalEstimado)}`}
          Icone={EventAvailableIcon} cor="#9C7BB5" fundo="#EFE7F5" />
        <Valor titulo="Gasto" valor={moeda(resumo.totalGasto)} Icone={ShoppingBagIcon} cor={cores.rosa} fundo={cores.rosaClaro} />
        <Valor titulo={resumo.saldo != null ? 'Saldo do orçamento' : 'Orçamento'}
          valor={resumo.saldo != null ? moeda(resumo.saldo) : 'Não definido'}
          detalhe={resumo.saldo == null ? `Defina na aba ${nome || 'Bebê'}` : undefined}
          Icone={SavingsIcon} cor={cores.salvia} fundo={cores.salviaClara} />
      </Stack>

      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Categorias</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          {resumo.categorias.map(c => {
            const { cor } = visualCategoria(c.nome)
            return (
              <Card key={c.categoriaId} onClick={() => navigate(`/itens?categoria=${c.categoriaId}`)}
                sx={{ p: 2, cursor: 'pointer', transition: 'transform .15s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <IconeCategoria nome={c.nome} />
                <Typography variant="subtitle1" sx={{ mt: 1.5, lineHeight: 1.2 }} noWrap>{c.nome}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{c.concluidos} de {c.totalItens}</Typography>
                <LinearProgress variant="determinate" value={c.percentual} sx={{ '& .MuiLinearProgress-bar': { bgcolor: cor } }} />
              </Card>
            )
          })}
        </Box>
      </Box>

      {pendentesAltaPrioridade.length > 0 && (
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
            <Typography variant="h6">Prioridades antes do parto</Typography>
            <Button size="small" onClick={() => navigate('/itens?prioridade=Alta')}>
              Ver todas ({pendentesAltaPrioridade.length})
            </Button>
          </Stack>
          <Card>
            {pendentesAltaPrioridade.slice(0, 8).map((i, idx) => (
              <Stack key={i.id} direction="row" spacing={1.5} sx={{
                alignItems: 'center', px: 2, py: 1.5, borderTop: idx ? '1px solid' : 'none', borderColor: 'divider',
              }}>
                <IconeCategoria nome={nomeCategoria.get(i.categoriaId) ?? ''} tamanho={32} />
                <Typography sx={{ flex: 1, minWidth: 0 }} noWrap>
                  {i.nome}{i.tamanho && i.tamanho !== 'Único' ? ` · ${i.tamanho}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {i.qtdAdquirida}/{i.qtdDesejada}
                </Typography>
              </Stack>
            ))}
          </Card>
        </Box>
      )}
    </Stack>
  )
}
