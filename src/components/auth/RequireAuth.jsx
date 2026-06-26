import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

// Gate for authenticated areas. Enforcement is behind VITE_REQUIRE_AUTH so the
// app stays usable before Postgres is provisioned — set VITE_REQUIRE_AUTH=true
// (and configure DATABASE_URL / BETTER_AUTH_* ) to turn gating on.
const REQUIRE_AUTH = import.meta.env.VITE_REQUIRE_AUTH === 'true'

export default function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (!REQUIRE_AUTH) return children

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}
