import { resolveConfig } from './lib/runtimeConfig';

/** Single place that reads environment settings; import `config` instead of touching import.meta.env */
export const config = resolveConfig(window.__ENV__, import.meta.env);
