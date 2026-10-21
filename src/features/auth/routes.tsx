import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { RequireStatus } from './RequireRole';
import { ResetPasswordPage } from './ResetPasswordPage';
import { PendingStatusPage, RejectedStatusPage, SuspendedStatusPage, VerifyStatusPage } from './StatusPages';
import { VerifyEmailPage } from './VerifyEmailPage';

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
