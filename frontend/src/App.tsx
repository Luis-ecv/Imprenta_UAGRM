import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AlertasProvider } from '@/context/AlertasContext'
import { AppRouter } from '@/routes/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertasProvider>
          <AppRouter />
        </AlertasProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}