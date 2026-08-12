import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PosList from './pages/PosList'
import PartnersList from './pages/PartnersList'
import PrimesListPage from './pages/PrimesListPage'
import BTSListPage from './pages/bts/BTSListPage'
import BTSCreatePage from './pages/bts/BTSCreatePage'
import BTSDetailPage from './pages/bts/BTSDetailPage'
import BTSRelevesPage from './pages/bts/BTSRelevesPage'
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
          <Route path="bts">
            <Route index element={<BTSListPage />} />
            <Route path="nouveau" element={<BTSCreatePage />} />
            <Route path=":id" element={<BTSDetailPage />} />
            <Route path=":id/modifier" element={<BTSCreatePage />} />
            <Route path="releves" element={<BTSRelevesPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

