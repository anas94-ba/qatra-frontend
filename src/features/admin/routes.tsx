import type { RouteObject } from 'react-router-dom';
import { DashboardLayout, type NavItem } from '../../layouts/DashboardLayout';
import { RequireRole } from '../auth/RequireRole';
import { NotificationsPage } from '../notifications/NotificationsPage';
import { AdminDeliveriesPage } from './AdminDeliveriesPage';
import { AdminHome } from './AdminHome';
import { AlgorithmPage } from './AlgorithmPage';
import { AuditPage } from './AuditPage';
import { DonationPage } from './DonationPage';
import { DonorsPage } from './DonorsPage';
import { EntitiesPage } from './EntitiesPage';
import { RegistrationsPage } from './RegistrationsPage';
import { SnapshotsReviewPage } from './SnapshotsReviewPage';

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
