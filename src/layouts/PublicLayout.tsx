import { Link, NavLink, Outlet } from 'react-router-dom';
import { homeFor, useAuth } from '../features/auth/AuthContext';
import { ButtonLink } from '../components/Button';

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="brand" style={{ textDecoration: 'none' }}>
      <img src="/logo.png" alt="" />
      <span>قطرة</span>
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
          <nav className="nav" aria-label="التنقل الرئيسي">
            <NavLink to="/">الرئيسية</NavLink>
            <NavLink to="/donate">تبرّع</NavLink>
            {session ? (
              <ButtonLink to={homeFor(session.user.role)} small>لوحة التحكم</ButtonLink>
            ) : (
              <ButtonLink to="/login" small>تسجيل الدخول</ButtonLink>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container">
          <p style={{ margin: 0 }}>
            قطرة منصة تنسيقية: التوصيات تعكس البيانات المسجلة فقط، وغياب بيانات المساعدات لا يعني عدم وصول المياه.
          </p>
        </div>
      </footer>
    </>
  );
}
