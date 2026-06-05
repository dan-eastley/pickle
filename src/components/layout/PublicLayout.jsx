import { NavLink, Outlet } from 'react-router-dom'
import Footer from './Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 bg-white border-b-2 border-brand-600 flex items-center px-6 gap-6 sticky top-0 z-40">
        <NavLink to="/" className="flex items-baseline gap-3 flex-shrink-0">
          <span className="text-lg font-bold tracking-tight text-gray-900 uppercase">Pickle</span>
          <span className="text-lg text-gray-400 hidden sm:block">Agentic Architecture as a Service</span>
        </NavLink>
        <div className="flex-1" />
        <NavLink
          to="/clients"
          className={({ isActive }) =>
            `text-sm font-medium px-3 py-1.5 transition-colors ${isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`
          }
        >
          Clients
        </NavLink>
        <NavLink
          to="/docs"
          className={({ isActive }) =>
            `text-sm font-medium px-3 py-1.5 transition-colors ${isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`
          }
        >
          Docs
        </NavLink>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
