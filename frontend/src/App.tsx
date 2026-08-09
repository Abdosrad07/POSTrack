import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PosList from './pages/PosList'
import PartnersList from './pages/PartnersList'
import PrimesListPage from './pages/PrimesListPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<PosList />} />
        <Route path="partenaires" element={<PartnersList />} />
        <Route path="primes" element={<PrimesListPage />} />
      </Route>
    </Routes>
  )
}

export default App
