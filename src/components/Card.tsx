import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`aoe-card p-5 ${className}`}>{children}</div>;
}

