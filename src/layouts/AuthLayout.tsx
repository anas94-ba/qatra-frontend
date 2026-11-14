import { Suspense } from 'react';
import logo from '../assets/images/logo.webp';
import { Credit } from '../components/Credit';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { PageLoader } from '../components/State';
import { Link, Outlet } from 'react-router-dom';
import { t } from '../i18n';

/** Centered card used by login, registration and the account status pages */
export function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-card stack">
        <div className="row" style={{ justifyContent: 'flex-end' }}><LanguageSwitcher /></div>
        <Link to="/"><img className="logo" src={logo} alt={t("قطرة")} width={62} height={84} /></Link>
        <div className="card"><Suspense fallback={<PageLoader inline />}><Outlet /></Suspense></div>
        <Credit />
      </div>
    </div>
  );
}
