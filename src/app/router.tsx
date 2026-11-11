import { Link, createBrowserRouter } from 'react-router-dom';
import { adminRoutes } from '../features/admin/routes';
import { authRoutes } from '../features/auth/routes';
import { campRoutes } from '../features/camp/routes';
import { orgRoutes } from '../features/org/routes';
import { publicRoutes } from '../features/public/routes';
import { t } from '../i18n';

function NotFound() {
  return (
    <div className="auth-page">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>{t("الصفحة غير موجودة")}</h1>
        <Link to="/">{t("العودة للرئيسية")}</Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  ...publicRoutes,
  ...authRoutes,
  ...campRoutes,
  ...orgRoutes,
  ...adminRoutes,
  { path: '*', element: <NotFound /> },
]);
