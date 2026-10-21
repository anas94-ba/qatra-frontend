import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../api/client';

interface ToastItem { id: number; text: string; kind: 'info' | 'error' }
interface ToastApi { success: (text: string) => void; error: (error: unknown) => void }

const Ctx = createContext<ToastApi | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((text: string, kind: ToastItem['kind']) => {
    const id = nextId++;
    setItems((list) => [...list, { id, text, kind }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 5000);
  }, []);

  const api = useMemo<ToastApi>(() => ({
    success: (text) => push(text, 'info'),
    error: (error) => push(error instanceof ApiError || error instanceof Error ? error.message : 'حدث خطأ غير متوقع', 'error'),
  }), [push]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`toast ${t.kind === 'error' ? 'error' : ''}`}>{t.text}</div>)}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
