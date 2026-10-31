import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { uagrmTheme } from '@/theme/uagrmTheme'
import { AuthProvider } from '@/context/AuthContext'
import { AlertasProvider } from '@/context/AlertasContext'
import { AppRouter } from '@/routes/AppRouter'

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={uagrmTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AlertasProvider>
              <AppRouter />
            </AlertasProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}