import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`aoe-card rounded p-5 backdrop-blur ${className}`}>{children}</div>;
}

