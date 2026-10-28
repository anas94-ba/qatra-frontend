import type { RouteObject } from 'react-router-dom';
import { DashboardLayout, type NavItem } from '../../layouts/DashboardLayout';
import { RequireRole } from '../auth/RequireRole';
import { NotificationsPage } from '../notifications/NotificationsPage';
import { CampHome } from './CampHome';
import { CampDeliveriesPage } from './DeliveriesPage';
import { SnapshotsPage } from './SnapshotsPage';

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
