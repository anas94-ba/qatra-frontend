import { Link, createBrowserRouter } from 'react-router-dom';
import { authRoutes } from '../features/auth/routes';

function NotFound() {
  return (
    <div className="auth-page">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>الصفحة غير موجودة</h1>
        <Link to="/">العودة للرئيسية</Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  ...authRoutes,
  { path: '*', element: <NotFound /> },
]);
