import { Shield } from 'lucide-react';
import { memo } from 'react';
import { findCivilization } from '../lib/civilizations';
import type { Civilization } from '../types';

interface CivIconProps {
  civ?: Civilization;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

function CivIconComponent({ civ, name = '', size = 'md', showName = false }: CivIconProps) {
  const resolved = civ ?? findCivilization(name);
  const label = resolved?.name ?? (name || 'Unknown');
  const initials = resolved?.initials ?? label.slice(0, 2).toUpperCase();
  const primary = resolved?.colors.primary ?? '#2a2924';
  const secondary = resolved?.colors.secondary ?? '#d8bd83';
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
  };

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded border border-gold/30 font-display font-bold text-parchment shadow-glow ${sizes[size]}`}
        style={{
          background: `linear-gradient(145deg, ${primary}, #171008 70%)`,
        }}
        title={label}
      >
        <Shield className="absolute h-[82%] w-[82%] text-black/20" />
        <span className="relative" style={{ color: secondary }}>{initials}</span>
      </div>
      {showName && <span className="font-semibold text-parchment">{label}</span>}
    </div>
  );
}

export const CivIcon = memo(CivIconComponent);
