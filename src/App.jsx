// Deploy marker: 2026-06-23 — redeploy to pick up the 2026-06 batch (decisions,
// TOGAF/SAFe, activity history, Discovery, i18n).
import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ArchitectureProvider, useArchitecture } from './context/ArchitectureContext'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/auth/RequireAuth'
import NavigationProgress from './components/ui/NavigationProgress'
import Layout from './components/layout/Layout'
import PublicLayout from './components/layout/PublicLayout'
import DocsLayout from './components/layout/DocsLayout'
import Spinner from './components/ui/Spinner'

// Pages are route-split — each loads its own chunk on first navigation, so the
// heavy ones (ArtefactPage's view renderers, DocsPage's markdown stack) stay
// out of the initial bundle. The Suspense boundary lives inside each layout
// (see RouteContent) so the chrome stays put while a chunk loads.
const HomePage = lazy(() => import('./pages/HomePage'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const VersionsPage = lazy(() => import('./pages/VersionsPage'))
const DecisionsPage = lazy(() => import('./pages/DecisionsPage'))
const DecisionEditorPage = lazy(() => import('./pages/DecisionEditorPage'))
const DecisionDetailPage = lazy(() => import('./pages/DecisionDetailPage'))
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'))
const DiscoveryEditorPage = lazy(() => import('./pages/DiscoveryEditorPage'))
const DiscoveryDetailPage = lazy(() => import('./pages/DiscoveryDetailPage'))
const DomainsPage = lazy(() => import('./pages/DomainsPage'))
const DomainPage = lazy(() => import('./pages/DomainPage'))
const AbstractionPage = lazy(() => import('./pages/AbstractionPage'))
const ArtefactPage = lazy(() => import('./pages/ArtefactPage'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

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
        {/* Authentication (full-screen, no app chrome) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public / marketing pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/clients"
            element={
              <RequireAuth>
                <ClientsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/clients/:clientId/versions"
            element={
              <RequireAuth>
                <VersionsPage />
              </RequireAuth>
            }
          />
        </Route>

        {/* Architecture browser — includes decisions (so TopBar + DomainNav stay visible) */}
        <Route
          path="/clients/:clientId/:versionId"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="domains" replace />} />
          <Route path="domains" element={<DomainsPage />} />
          <Route path="domains/:domain" element={<DomainPage />} />
          <Route path="domains/:domain/:abstraction" element={<AbstractionPage />} />
          <Route path="domains/:domain/:abstraction/:artefactId" element={<ArtefactPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="decisions/new" element={<DecisionEditorPage />} />
          <Route path="decisions/:decisionId" element={<DecisionDetailPage />} />
          <Route path="discovery" element={<DiscoveryPage />} />
          <Route path="discovery/new" element={<DiscoveryEditorPage />} />
          <Route path="discovery/:discoveryId" element={<DiscoveryDetailPage />} />
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
      <AuthProvider>
        <ArchitectureProvider>
          <AppRoutes />
        </ArchitectureProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
