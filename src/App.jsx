import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ArchitectureProvider, useArchitecture } from './context/ArchitectureContext'
import NavigationProgress from './components/ui/NavigationProgress'
import Layout from './components/layout/Layout'
import PublicLayout from './components/layout/PublicLayout'
import DocsLayout from './components/layout/DocsLayout'
import HomePage from './pages/HomePage'
import ClientsPage from './pages/ClientsPage'
import VersionsPage from './pages/VersionsPage'
import DecisionsPage from './pages/DecisionsPage'
import DecisionEditorPage from './pages/DecisionEditorPage'
import DecisionDetailPage from './pages/DecisionDetailPage'
import DomainsPage from './pages/DomainsPage'
import DomainPage from './pages/DomainPage'
import AbstractionPage from './pages/AbstractionPage'
import ArtefactPage from './pages/ArtefactPage'
import DocsPage from './pages/DocsPage'
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
    <>
      <NavigationProgress />
      <Routes>
      {/* Public / marketing pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:clientId/versions" element={<VersionsPage />} />
      </Route>

      {/* Architecture browser — includes decisions (so TopBar + DomainNav stay visible) */}
      <Route path="/clients/:clientId/:versionId" element={<Layout />}>
        <Route index element={<Navigate to="domains" replace />} />
        <Route path="domains" element={<DomainsPage />} />
        <Route path="domains/:domain" element={<DomainPage />} />
        <Route path="domains/:domain/:abstraction" element={<AbstractionPage />} />
        <Route path="domains/:domain/:abstraction/:artefactId" element={<ArtefactPage />} />
        <Route path="decisions" element={<DecisionsPage />} />
        <Route path="decisions/new" element={<DecisionEditorPage />} />
        <Route path="decisions/:decisionId" element={<DecisionDetailPage />} />
      </Route>

      {/* Docs */}
      <Route path="/docs" element={<DocsLayout />}>
        <Route index element={<Navigate to="/docs/index" replace />} />
        <Route path="*" element={<DocsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
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
