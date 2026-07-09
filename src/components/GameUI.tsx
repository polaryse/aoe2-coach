import type { ReactNode } from 'react';

interface ProgressRingProps {
  value: number;
  label: string;
  detail: string;
}

export function ProgressRing({ value, label, detail }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="relative grid place-items-center">
      <div
        className="h-32 w-32 rounded-full"
        style={{
          background: `conic-gradient(#e6bd62 ${safeValue * 3.6}deg, rgba(216, 189, 131, 0.16) 0deg)`,
        }}
      >
        <div className="m-2 grid h-28 w-28 place-items-center rounded-full border border-gold/25 bg-[#15100c] text-center shadow-inner">
          <div>
            <p className="font-display text-3xl text-parchment">{Math.round(safeValue)}%</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{label}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-vellum">{detail}</p>
    </div>
  );
}

export function EraBadge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'red' | 'blue' | 'green' }) {
  const tones = {
    gold: 'border-gold/40 bg-gold/10 text-gold',
    red: 'border-banner/60 bg-banner/30 text-parchment',
    blue: 'border-royal/70 bg-royal/40 text-sky-100',
    green: 'border-moss/60 bg-moss/20 text-green-100',
  };

  return <span className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] ${tones[tone]}`}>{children}</span>;
}

export function StatPlaque({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <div className="aoe-plaque relative overflow-hidden rounded border p-5">
      <div className="absolute right-4 top-4 text-gold/30">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{label}</p>
      <p className="mt-3 font-display text-4xl text-parchment">{value}</p>
      <p className="mt-1 text-sm text-vellum">{detail}</p>
    </div>
  );
}

export function RewardPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-gold/30 bg-[#0f0b08]/50 px-3 py-1 text-sm font-bold text-gold">
      {children}
    </span>
  );
}

export function ResourceChip({ type, value }: { type: 'food' | 'wood' | 'gold' | 'stone'; value?: string }) {
  const resources = {
    food: { label: 'Food', mark: 'F', classes: 'border-green-600/40 bg-green-950/30 text-green-100' },
    wood: { label: 'Wood', mark: 'W', classes: 'border-amber-800/50 bg-amber-950/30 text-amber-100' },
    gold: { label: 'Gold', mark: 'G', classes: 'border-gold/40 bg-gold/10 text-gold' },
    stone: { label: 'Stone', mark: 'S', classes: 'border-stone-400/40 bg-stone-900/40 text-stone-100' },
  };
  const resource = resources[type];

  return (
    <span className={`inline-flex items-center gap-2 rounded border px-2.5 py-1 text-xs font-semibold ${resource.classes}`}>
      <span className="grid h-5 w-5 place-items-center rounded bg-black/30 font-bold">{resource.mark}</span>
      {value ?? resource.label}
    </span>
  );
}

export function AgeMarker({ age }: { age: 'Dark' | 'Feudal' | 'Castle' | 'Imperial' }) {
  const ages = {
    Dark: 'I',
    Feudal: 'II',
    Castle: 'III',
    Imperial: 'IV',
  };

  return (
    <span className="inline-flex items-center gap-2 rounded border border-gold/25 bg-[#0f0b08]/40 px-3 py-1 text-xs font-bold text-parchment">
      <span className="font-display text-gold">{ages[age]}</span>
      {age}
    </span>
  );
}

export function TimelineStep({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className="relative flex gap-3 rounded border border-gold/15 bg-[#0f0b08]/30 p-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-gold/30 bg-[#171008] text-sm font-bold text-gold">{index}</span>
      <p className="text-sm text-parchment">{children}</p>
    </div>
  );
}

