import type { ReactNode } from 'react';

export function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      {(title || actions) && (
        <div className="row between" style={{ marginBottom: '.75rem' }}>
          {title && <h2 style={{ margin: 0 }}>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card stat">
      <span className="value">{value}</span>
      <span className="label">{label}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="row between" style={{ marginBottom: '1rem' }}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {subtitle && <p className="muted" style={{ margin: 0 }}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
