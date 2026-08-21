import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import RoleGuard from './components/Layout/RoleGuard'
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
import SelectPartnerPage from './pages/auth/SelectPartnerPage'
import UnauthorizedPage from './pages/auth/UnauthorizedPage'
import SimsStockPage from './pages/sims/SimsStockPage'
import RequetesListPage from './pages/requetes/RequetesListPage'
import ImportExportPage from './pages/import-export/ImportExportPage'
import AuditLogsPage from './pages/audit/AuditLogsPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PartnerRoute from './routes/PartnerRoute'
import { AuthProvider } from './context/AuthContext'
import { PartnerProvider } from './context/PartnerContext'
import PartenaireCreatePage from './pages/partenaires/PartenaireCreatePage'
import POSCreatePage from './pages/pos/POSCreatePage'
import PrimeCreatePage from './pages/primes/PrimeCreatePage'
import { ROLE_GROUPS } from './utils/constants'

function App() {
  return (
    <AuthProvider>
      <PartnerProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/select-partner"
            element={
              <ProtectedRoute>
                <SelectPartnerPage />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <PartnerRoute>
                <MainLayout />
              </PartnerRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />

            <Route path="pos" element={<POSListPage />} />
            <Route path="pos/new" element={<POSCreatePage />} />
            <Route path="pos/nouveau" element={<POSCreatePage />} />
            <Route path="pos/:id" element={<POSDetailPage />} />

            <Route
              path="partenaires"
              element={
                <RoleGuard roles={ROLE_GROUPS.ADMIN_ONLY}>
                  <PartnersList />
                </RoleGuard>
              }
            />
            <Route
              path="partenaires/new"
              element={
                <RoleGuard roles={ROLE_GROUPS.ADMIN_ONLY}>
                  <PartenaireCreatePage />
                </RoleGuard>
              }
            />

            <Route
              path="primes"
              element={
                <RoleGuard roles={ROLE_GROUPS.PARTNER_PORTFOLIO}>
                  <PrimesListPage />
                </RoleGuard>
              }
            />
            <Route
              path="primes/new"
              element={
                <RoleGuard roles={ROLE_GROUPS.PARTNER_PORTFOLIO}>
                  <PrimeCreatePage />
                </RoleGuard>
              }
            />

            <Route
              path="dsm"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <DSMListPage />
                </RoleGuard>
              }
            />
            <Route
              path="dsm/new"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <DSMCreatePage />
                </RoleGuard>
              }
            />
            <Route
              path="dsm/:id"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <DSMDetailPage />
                </RoleGuard>
              }
            />

            <Route
              path="bts"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <BTSListPage />
                </RoleGuard>
              }
            />
            <Route
              path="bts/new"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <BTSCreatePage />
                </RoleGuard>
              }
            />
            <Route
              path="bts/releves"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <BTSRelevesPage />
                </RoleGuard>
              }
            />
            <Route
              path="bts/:id/modifier"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <BTSCreatePage />
                </RoleGuard>
              }
            />
            <Route
              path="bts/:id"
              element={
                <RoleGuard roles={ROLE_GROUPS.OPERATIONS}>
                  <BTSDetailPage />
                </RoleGuard>
              }
            />

            <Route path="sims" element={<SimsStockPage />} />
            <Route path="requetes" element={<RequetesListPage />} />

            <Route
              path="import-export"
              element={
                <RoleGuard roles={ROLE_GROUPS.PARTNER_PORTFOLIO}>
                  <ImportExportPage />
                </RoleGuard>
              }
            />
            <Route
              path="audit"
              element={
                <RoleGuard roles={ROLE_GROUPS.ADMIN_ONLY}>
                  <AuditLogsPage />
                </RoleGuard>
              }
            />
          </Route>
        </Routes>
      </PartnerProvider>
    </AuthProvider>
  )
}

export default App
