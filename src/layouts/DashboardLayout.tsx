import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { Button } from '../components/Button';
import { Brand } from './PublicLayout';

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
        <nav style={{ display: "contents" }} aria-label="القائمة">
          {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end}>{i.label}</NavLink>)}
        </nav>
      </aside>
      <div className="dash-main">
        <header className="topbar">
          <span className="muted">{session?.user.fullName}</span>
          <div className="row">
            <NotificationBell />
            <Button variant="secondary" small onClick={signOut}>خروج</Button>
          </div>
        </header>
        <main className="dash-content"><Outlet /></main>
      </div>
    </div>
  );
}
