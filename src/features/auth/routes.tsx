import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { RequireStatus } from './RequireRole';
import { lazyPage } from '../../lib/lazyPage';

const ForgotPasswordPage = lazyPage(() => import('./ForgotPasswordPage'), 'ForgotPasswordPage');
const LoginPage = lazyPage(() => import('./LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./RegisterPage'), 'RegisterPage');
const ResetPasswordPage = lazyPage(() => import('./ResetPasswordPage'), 'ResetPasswordPage');
const PendingStatusPage = lazyPage(() => import('./StatusPages'), 'PendingStatusPage');
const RejectedStatusPage = lazyPage(() => import('./StatusPages'), 'RejectedStatusPage');
const SuspendedStatusPage = lazyPage(() => import('./StatusPages'), 'SuspendedStatusPage');
const VerifyStatusPage = lazyPage(() => import('./StatusPages'), 'VerifyStatusPage');
const VerifyEmailPage = lazyPage(() => import('./VerifyEmailPage'), 'VerifyEmailPage');

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      {
        element: <RequireStatus />,
        children: [
          { path: '/status/verify', element: <VerifyStatusPage /> },
          { path: '/status/pending', element: <PendingStatusPage /> },
          { path: '/status/rejected', element: <RejectedStatusPage /> },
          { path: '/status/suspended', element: <SuspendedStatusPage /> },
        ],
      },
    ],
  },
];
