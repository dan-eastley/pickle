import { NavLink } from 'react-router-dom'
import Footer from './Footer'
import RouteContent from './RouteContent'
import UserMenu from '../auth/UserMenu'
import Logo from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'

export default function PublicLayout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 bg-white border-b-2 border-brand-600 flex items-center px-6 gap-6 sticky top-0 z-40">
        <Logo align="left" size="sm" to="/" />
        <div className="flex-1" />
        <NavLink
          to={user ? '/architectures' : '/register'}
          className={({ isActive }) =>
            `text-sm font-medium px-3 py-1.5 transition-colors ${isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`
          }
        >
          {user ? 'View Architectures' : 'Get Started'}
        </NavLink>
        <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
        <UserMenu />
      </header>
      <main className="relative flex-1 bg-gray-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="relative">
          <RouteContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
