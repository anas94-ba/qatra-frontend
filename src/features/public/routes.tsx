import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { DonatePage } from './DonatePage';
import { HomePage } from './HomePage';

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/donate', element: <DonatePage /> },
    ],
  },
];
