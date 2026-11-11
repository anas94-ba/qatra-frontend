import type { RouteObject } from 'react-router-dom';
import { DashboardLayout, type NavItem } from '../../layouts/DashboardLayout';
import { RequireRole } from '../auth/RequireRole';
import { lazyPage } from '../../lib/lazyPage';

const NotificationsPage = lazyPage(() => import('../notifications/NotificationsPage'), 'NotificationsPage');
const CampHome = lazyPage(() => import('./CampHome'), 'CampHome');
const CampDeliveriesPage = lazyPage(() => import('./DeliveriesPage'), 'CampDeliveriesPage');
const SnapshotsPage = lazyPage(() => import('./SnapshotsPage'), 'SnapshotsPage');

const nav: NavItem[] = [
  { to: '/camp', label: 'الرئيسية', end: true },
  { to: '/camp/deliveries', label: 'الدفعات الواردة' },
  { to: '/camp/snapshots', label: 'بيانات المخيم' },
  { to: '/camp/notifications', label: 'الإشعارات' },
];

export const campRoutes: RouteObject[] = [
  {
    path: '/camp',
    element: <RequireRole role="CAMP_REP" />,
    children: [
      {
        element: <DashboardLayout items={nav} />,
        children: [
          { index: true, element: <CampHome /> },
          { path: 'deliveries', element: <CampDeliveriesPage /> },
          { path: 'snapshots', element: <SnapshotsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },
];
