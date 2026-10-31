import type { RouteObject } from 'react-router-dom';
import { DashboardLayout, type NavItem } from '../../layouts/DashboardLayout';
import { RequireRole } from '../auth/RequireRole';
import { NotificationsPage } from '../notifications/NotificationsPage';
import { OrgDeliveriesPage } from './DeliveriesPage';
import { OrgHome } from './OrgHome';
import { PlanDetailPage } from './PlanDetailPage';
import { PlansPage } from './PlansPage';

const nav: NavItem[] = [
  { to: '/org', label: 'الرئيسية', end: true },
  { to: '/org/plans', label: 'خطط المياه' },
  { to: '/org/deliveries', label: 'الدفعات الصادرة' },
  { to: '/org/notifications', label: 'الإشعارات' },
];

export const orgRoutes: RouteObject[] = [
  {
    path: '/org',
    element: <RequireRole role="ORG" />,
    children: [
      {
        element: <DashboardLayout items={nav} />,
        children: [
          { index: true, element: <OrgHome /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'plans/:id', element: <PlanDetailPage /> },
          { path: 'deliveries', element: <OrgDeliveriesPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },
];
