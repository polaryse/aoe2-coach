import { BarChart3, BookOpen, Brain, ClipboardList, Flag, Gamepad2, Map, Swords, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'games', label: 'Game Log', icon: Gamepad2 },
  { id: 'coach', label: 'Coach Analysis', icon: Brain },
  { id: 'missions', label: 'Mission Board', icon: ClipboardList },
  { id: 'skills', label: 'Skill Tree', icon: Trophy },
  { id: 'civs', label: 'Civ Guide', icon: Flag },
  { id: 'builds', label: 'Build Orders', icon: Swords },
  { id: 'reviews', label: 'Replay Review', icon: BookOpen },
];

interface ShellProps {
  activeView: string;
  onViewChange: (view: string) => void;
  children: ReactNode;
}

export function Shell({ activeView, onViewChange, children }: ShellProps) {
  return (
    <div className="aoe-backdrop min-h-screen text-stone-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-gold/25 bg-[#100d0a]/80 p-5 shadow-keep backdrop-blur-xl lg:block">
        <div className="mb-8 border-b border-gold/20 pb-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded border border-gold/60 bg-gradient-to-b from-banner/80 to-[#2b1115] shadow-glow">
              <Map className="h-7 w-7 text-gold" />
            </div>
            <div>
              <p className="font-display text-3xl leading-none text-parchment">AoE2 Coach</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gold">Ranked command</p>
            </div>
          </div>
          <div className="rounded border border-vellum/25 bg-parchment/[0.07] px-3 py-2 text-xs leading-5 text-vellum">
            Local campaign ledger for Elo, habits, missions, and replay lessons.
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex w-full items-center gap-3 rounded border px-3 py-3 text-left transition ${
                  active
                    ? 'aoe-plaque text-parchment shadow-glow'
                    : 'border-transparent text-vellum hover:border-gold/30 hover:bg-parchment/[0.06] hover:text-parchment'
                }`}
              >
                <Icon className={active ? 'h-5 w-5 text-gold' : 'h-5 w-5'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-gold/25 bg-[#100d0a]/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-2xl text-parchment">AoE2 Coach</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`shrink-0 rounded border px-3 py-2 text-sm ${
                  activeView === item.id ? 'border-gold bg-banner/30 text-parchment' : 'border-vellum/25 text-vellum'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
