import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { PageLoader } from '../components/State';
import { ToastProvider } from '../components/Toast';
import { TopProgress } from '../components/TopProgress';
import { AuthProvider } from '../features/auth/AuthContext';
import { useLang } from '../i18n';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

export function App() {
  // Remounting the routes on a language change re-renders every string, including helper-built labels
  const lang = useLang();
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <TopProgress />
          <Suspense fallback={<PageLoader />}>
            <RouterProvider key={lang} router={router} />
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
