import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 5,
        pb: 2.5,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        borderTop: '1px solid #f1ece5',
      }}
    >
      {/* Izquierda: Indicador de salud de servicios */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}
        >
          Todos los servicios operativos
        </Typography>
      </Box>

      {/* Derecha: Enlaces de utilidad y versión */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Typography
          component="a"
          href="#"
          onClick={(e) => e.preventDefault()}
          sx={{
            color: '#64748b',
            fontSize: '0.8rem',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.15s ease',
            '&:hover': { color: '#1e2b4d' },
          }}
        >
          Soporte
        </Typography>
        <Typography
          component="a"
          href="#"
          onClick={(e) => e.preventDefault()}
          sx={{
            color: '#64748b',
            fontSize: '0.8rem',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.15s ease',
            '&:hover': { color: '#1e2b4d' },
          }}
        >
          Documentación
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}
        >
          v1.0
        </Typography>
      </Box>
    </Box>
  )
}

