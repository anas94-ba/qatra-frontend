import { Suspense } from 'react';
import { Credit } from '../components/Credit';
import { PageLoader } from '../components/State';
import { Link, Outlet } from 'react-router-dom';

/** Centered card used by login, registration and the account status pages */
export function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-card stack">
        <Link to="/"><img className="logo" src="/logo.png" alt="قطرة" /></Link>
        <div className="card"><Suspense fallback={<PageLoader inline />}><Outlet /></Suspense></div>
        <Credit />
      </div>
    </div>
  );
}
