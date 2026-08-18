import { NavLink, Outlet } from 'react-router-dom'
import MainLayout from './Layout/MainLayout'

/**
 * Compatibilité : l'ancien Layout.tsx délègue au MainLayout A2.
 * Conservé pour les imports historiques.
 */
function Layout() {
  return <MainLayout />
}

export { MainLayout, NavLink, Outlet }
export default Layout
