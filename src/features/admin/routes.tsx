import type { RouteObject } from 'react-router-dom';
import { DashboardLayout, type NavItem } from '../../layouts/DashboardLayout';
import { RequireRole } from '../auth/RequireRole';
import { lazyPage } from '../../lib/lazyPage';

const NotificationsPage = lazyPage(() => import('../notifications/NotificationsPage'), 'NotificationsPage');
const AdminDeliveriesPage = lazyPage(() => import('./AdminDeliveriesPage'), 'AdminDeliveriesPage');
const AdminHome = lazyPage(() => import('./AdminHome'), 'AdminHome');
const AlgorithmPage = lazyPage(() => import('./AlgorithmPage'), 'AlgorithmPage');
const AuditPage = lazyPage(() => import('./AuditPage'), 'AuditPage');
const DonationPage = lazyPage(() => import('./DonationPage'), 'DonationPage');
const DonorsPage = lazyPage(() => import('./DonorsPage'), 'DonorsPage');
const EntitiesPage = lazyPage(() => import('./EntitiesPage'), 'EntitiesPage');
const RegistrationsPage = lazyPage(() => import('./RegistrationsPage'), 'RegistrationsPage');
const SnapshotsReviewPage = lazyPage(() => import('./SnapshotsReviewPage'), 'SnapshotsReviewPage');

const nav: NavItem[] = [
  { to: '/admin', label: 'الرئيسية', end: true },
  { to: '/admin/registrations', label: 'طلبات التسجيل' },
  { to: '/admin/entities', label: 'الجهات' },
  { to: '/admin/snapshots', label: 'مراجعة البيانات' },
  { to: '/admin/deliveries', label: 'الدفعات' },
  { to: '/admin/algorithm', label: 'الخوارزمية' },
  { to: '/admin/donation', label: 'رابط التبرع' },
  { to: '/admin/donors', label: 'المانحون' },
  { to: '/admin/audit', label: 'سجل التدقيق' },
  { to: '/admin/notifications', label: 'الإشعارات' },
];

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <RequireRole role="ADMIN" />,
    children: [
      {
        element: <DashboardLayout items={nav} />,
        children: [
          { index: true, element: <AdminHome /> },
          { path: 'registrations', element: <RegistrationsPage /> },
          { path: 'entities', element: <EntitiesPage /> },
          { path: 'snapshots', element: <SnapshotsReviewPage /> },
          { path: 'deliveries', element: <AdminDeliveriesPage /> },
          { path: 'algorithm', element: <AlgorithmPage /> },
          { path: 'donation', element: <DonationPage /> },
          { path: 'donors', element: <DonorsPage /> },
          { path: 'audit', element: <AuditPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },
];
