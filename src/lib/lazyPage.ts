import { lazy, type ComponentType } from 'react';

/** Code-splits a named export: lazyPage(() => import('./LoginPage'), 'LoginPage') */
export function lazyPage<M extends Record<string, unknown>, K extends keyof M & string>(load: () => Promise<M>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] as ComponentType })));
}
