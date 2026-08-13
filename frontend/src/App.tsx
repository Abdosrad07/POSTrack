import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import POSListPage from './pages/pos/POSListPage'
import POSDetailPage from './pages/pos/POSDetailPage'
import PartnersList from './pages/PartnersList'
import PrimesListPage from './pages/PrimesListPage'
import BTSListPage from './pages/bts/BTSListPage'
import BTSCreatePage from './pages/bts/BTSCreatePage'
import BTSDetailPage from './pages/bts/BTSDetailPage'
import BTSRelevesPage from './pages/bts/BTSRelevesPage'
import DSMListPage from './pages/dsm/DSMListPage'
import DSMCreatePage from './pages/dsm/DSMCreatePage'
import DSMDetailPage from './pages/dsm/DSMDetailPage'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import PartenaireCreatePage from './pages/partenaires/PartenaireCreatePage'
import POSCreatePage from './pages/pos/POSCreatePage'
import PrimeCreatePage from './pages/primes/PrimeCreatePage'

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
          <Route path="pos" element={<POSListPage />} />
          <Route path="pos/new" element={<POSCreatePage />} />
          <Route path="pos/nouveau" element={<POSCreatePage />} />
          <Route path="pos/:id" element={<POSDetailPage />} />
          <Route path="partenaires" element={<PartnersList />} />
          <Route path="partenaires/new" element={<PartenaireCreatePage />} />
          <Route path="primes" element={<PrimesListPage />} />
          <Route path="primes/new" element={<PrimeCreatePage />} />
          <Route path="dsm">
            <Route index element={<DSMListPage />} />
            <Route path="new" element={<DSMCreatePage />} />
            <Route path=":id" element={<DSMDetailPage />} />
          </Route>
          <Route path="bts">
            <Route index element={<BTSListPage />} />
            <Route path="nouveau" element={<BTSCreatePage />} />
            <Route path="new" element={<BTSCreatePage />} />
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

