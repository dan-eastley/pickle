import { NavLink } from 'react-router-dom'
import Footer from './Footer'
import RouteContent from './RouteContent'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 bg-white border-b-2 border-brand-600 flex items-center px-6 gap-6 sticky top-0 z-40">
        <NavLink to="/" className="flex items-baseline gap-3 flex-shrink-0">
          <span className="text-lg font-bold tracking-widest uppercase leading-none bg-gradient-to-r from-brand-700 to-rose-600 bg-clip-text text-transparent">
            Pickle
          </span>
          <span className="text-lg text-gray-400 hidden sm:block">
            Agentic Architecture as a Service
          </span>
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
