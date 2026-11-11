import { Suspense } from 'react';
import { PageLoader } from '../components/State';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { Brand } from './PublicLayout';
import { t } from '../i18n';

export interface NavItem { to: string; label: string; end?: boolean }

/** Sidebar + topbar shell shared by the camp, organization and admin dashboards */
export function DashboardLayout({ items }: { items: NavItem[] }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="dash">
      <aside className="sidebar">
        <Brand />
        <nav style={{ display: "contents" }} aria-label={t("القائمة")}>
          {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end}>{t(i.label)}</NavLink>)}
        </nav>
      </aside>
      <div className="dash-main">
        <header className="topbar">
          <span className="muted">{session?.user.fullName}</span>
          <div className="row">
            <LanguageSwitcher />
            <NotificationBell />
            <Button variant="secondary" small onClick={signOut}>{t("خروج")}</Button>
          </div>
        </header>
        <main className="dash-content"><Suspense fallback={<PageLoader inline />}><Outlet /></Suspense></main>
      </div>
    </div>
  );
}
