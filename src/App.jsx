import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ArchitectureProvider, useArchitecture } from './context/ArchitectureContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DomainsPage from './pages/DomainsPage'
import DomainPage from './pages/DomainPage'
import AbstractionPage from './pages/AbstractionPage'
import ArtefactPage from './pages/ArtefactPage'
import Spinner from './components/ui/Spinner'

function AppRoutes() {
  const { loading, error } = useArchitecture()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm font-medium text-error-700">Failed to load architecture data</p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/clients/:clientId/:versionId" element={<Layout />}>
        <Route index element={<Navigate to="domains" replace />} />
        <Route path="domains" element={<DomainsPage />} />
        <Route path="domains/:domain" element={<DomainPage />} />
        <Route path="domains/:domain/:abstraction" element={<AbstractionPage />} />
        <Route path="domains/:domain/:abstraction/:artefactId" element={<ArtefactPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ArchitectureProvider>
        <AppRoutes />
      </ArchitectureProvider>
    </BrowserRouter>
  )
}
