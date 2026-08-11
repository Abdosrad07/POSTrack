import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PosList from './pages/PosList'
import PartnersList from './pages/PartnersList'
import PrimesListPage from './pages/PrimesListPage'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<PosList />} />
          <Route path="partenaires" element={<PartnersList />} />
          <Route path="primes" element={<PrimesListPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

