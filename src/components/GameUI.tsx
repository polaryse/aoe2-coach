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
    <span className="inline-flex items-center rounded border border-gold/30 bg-[#0f0b08]/50 px-3 py-1 text-sm font-bold text-gold shadow-glow">
      {children}
    </span>
  );
}
