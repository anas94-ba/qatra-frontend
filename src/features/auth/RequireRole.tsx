import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '../../api/types';
import { Spinner } from '../../components/State';
import { homeFor, landingPath, useAuth } from './AuthContext';

/**
 * Route guard. Not signed in -> /login. Account not approved/suspended -> its status page.
 * Wrong role -> that user's own dashboard. The server enforces the same rules on every request.
 */
export function RequireRole({ role }: { role: Role }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (session.landing !== 'DASHBOARD') return <Navigate to={landingPath(session)} replace />;
  if (session.user.role !== role) return <Navigate to={homeFor(session.user.role)} replace />;
  return <Outlet />;
}

/** Guard for the status pages: only users whose account is NOT in the DASHBOARD state */
export function RequireStatus() {
  const { session, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (session.landing === 'DASHBOARD') return <Navigate to={homeFor(session.user.role)} replace />;
  return <Outlet />;
}
