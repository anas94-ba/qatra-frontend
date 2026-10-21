import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
const cls = (variant: Variant, small?: boolean) => ['btn', variant === 'primary' ? '' : variant, small ? 'sm' : ''].filter(Boolean).join(' ');

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
  loading?: boolean;
}

export function Button({ variant = 'primary', small, loading, disabled, children, ...rest }: ButtonProps) {
  return (
    <button className={cls(variant, small)} disabled={disabled || loading} {...rest}>
      {loading ? '...' : children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', small, ...rest }: LinkProps & { variant?: Variant; small?: boolean }) {
  return <Link className={cls(variant, small)} {...rest} />;
}
