import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

interface Shared { label: string; hint?: string; error?: string }

function Wrapper({ id, label, hint, error, children }: Shared & { id: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}

export function TextField({ label, hint, error, ...rest }: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <input id={id} aria-invalid={!!error} {...rest} />
    </Wrapper>
  );
}

export function TextArea({ label, hint, error, ...rest }: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <textarea id={id} aria-invalid={!!error} {...rest} />
    </Wrapper>
  );
}

export function SelectField({ label, hint, error, children, ...rest }: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <select id={id} aria-invalid={!!error} {...rest}>{children}</select>
    </Wrapper>
  );
}
