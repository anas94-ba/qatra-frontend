import { Suspense } from 'react';
import { PageLoader } from '../components/State';
import { Link, NavLink, Outlet } from 'react-router-dom';
import logo from '../assets/images/logo.webp';
import { homeFor, useAuth } from '../features/auth/AuthContext';
import { ButtonLink } from '../components/Button';
import { SiteFooter } from '../components/SiteFooter';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { t } from '../i18n';

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="brand" style={{ textDecoration: 'none' }}>
      <img src={logo} alt="" width={31} height={42} />
      <span>{t("قطرة")}</span>
    </Link>
  );
}

/** Header + footer for the public pages (no login required) */
export function PublicLayout() {
  const { session } = useAuth();
  return (
    <>
      <header className="site-header">
        <div className="container inner">
          <Brand />
          <nav className="nav" aria-label={t("التنقل الرئيسي")}>
            <NavLink to="/">{t("الرئيسية")}</NavLink>
            <NavLink to="/donate">{t("تبرّع")}</NavLink>
            <LanguageSwitcher />
            {session ? (
              <ButtonLink to={homeFor(session.user.role)} small>{t("لوحة التحكم")}</ButtonLink>
            ) : (
              <ButtonLink to="/login" small>{t("تسجيل الدخول")}</ButtonLink>
            )}
          </nav>
        </div>
      </header>
      <main><Suspense fallback={<PageLoader inline />}><Outlet /></Suspense></main>
      <SiteFooter />
    </>
  );
}
