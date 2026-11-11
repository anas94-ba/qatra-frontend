import type { RouteObject } from 'react-router-dom';
import { DashboardLayout, type NavItem } from '../../layouts/DashboardLayout';
import { RequireRole } from '../auth/RequireRole';
import { lazyPage } from '../../lib/lazyPage';

const NotificationsPage = lazyPage(() => import('../notifications/NotificationsPage'), 'NotificationsPage');
const OrgDeliveriesPage = lazyPage(() => import('./DeliveriesPage'), 'OrgDeliveriesPage');
const OrgHome = lazyPage(() => import('./OrgHome'), 'OrgHome');
const PlanDetailPage = lazyPage(() => import('./PlanDetailPage'), 'PlanDetailPage');
const PlansPage = lazyPage(() => import('./PlansPage'), 'PlansPage');

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
