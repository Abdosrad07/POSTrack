import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PosList from './pages/PosList'
import PartnersList from './pages/PartnersList'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<PosList />} />
        <Route path="partenaires" element={<PartnersList />} />
      </Route>
    </Routes>
  )
}

export default App
