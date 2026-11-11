import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { lazyPage } from '../../lib/lazyPage';

const DonatePage = lazyPage(() => import('./DonatePage'), 'DonatePage');
const HomePage = lazyPage(() => import('./HomePage'), 'HomePage');

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/donate', element: <DonatePage /> },
    ],
  },
];
