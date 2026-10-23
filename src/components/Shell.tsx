import { BarChart3, BookOpen, Brain, ClipboardList, Flag, Gamepad2, Map, Shield, Swords, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

const navGroups = [
  { label: 'Train', items: [
    { id: 'dashboard', label: 'Command', icon: BarChart3 },
    { id: 'games', label: 'Game Log', icon: Gamepad2 },
    { id: 'coach', label: 'Coach Analysis', icon: Brain },
    { id: 'missions', label: 'Missions', icon: ClipboardList },
  ] },
  { label: 'Learn', items: [
    { id: 'skills', label: 'Skill Tree', icon: Trophy },
    { id: 'civs', label: 'Civilizations', icon: Flag },
    { id: 'builds', label: 'Build Orders', icon: Swords },
    { id: 'reviews', label: 'Replay Lab', icon: BookOpen },
  ] },
];

const navItems = navGroups.flatMap((group) => group.items);

interface ShellProps {
  activeView: string;
  onViewChange: (view: string) => void;
  children: ReactNode;
}

export function Shell({ activeView, onViewChange, children }: ShellProps) {
  const activeItem = navItems.find((item) => item.id === activeView) ?? navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="app-shell aoe-backdrop min-h-screen text-stone-100">
      <aside className="command-rail fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col items-center border-r border-white/10 bg-[#080b0d] py-4 lg:flex">
        <button className="grid h-11 w-11 place-items-center bg-gold text-[#111314]" title="AoE2 Coach" onClick={() => onViewChange('dashboard')}>
          <Map className="h-5 w-5" />
        </button>
        {navGroups.map((group) => (
          <div className="mt-6 flex w-full flex-col items-center gap-2" key={group.label}>
            <span className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-stone-600">{group.label}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button key={item.id} onClick={() => onViewChange(item.id)} aria-current={active ? 'page' : undefined} title={item.label}
                  className={`relative grid h-10 w-10 place-items-center border-l-2 transition ${active ? 'border-gold bg-[#1c2327] text-gold' : 'border-transparent text-stone-500 hover:bg-white/5 hover:text-stone-200'}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              );
            })}
          </div>
        ))}
        <div className="mt-auto grid h-9 w-9 place-items-center rounded-full bg-[#2a3339] text-xs font-black text-white" title="Local profile">P</div>
      </aside>

      <div className="lg:pl-[72px]">
        <header className="command-topbar sticky top-0 z-30 flex min-h-[72px] items-center border-b border-white/10 bg-[#0d1215]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button className="mr-5 grid h-9 w-9 place-items-center bg-gold text-xs font-black text-[#111314] lg:hidden" onClick={() => onViewChange('dashboard')}>A2</button>
          <div className="hidden min-w-[210px] items-center gap-3 lg:flex">
            <span className="grid h-9 w-9 place-items-center bg-gold text-xs font-black text-[#111314]">A2</span>
            <div><p className="text-sm font-bold text-parchment">AoE2 Coach</p><p className="text-[8px] font-bold uppercase tracking-[0.12em] text-stone-500">Ranked Improvement Centre</p></div>
          </div>
          <div className="flex min-w-0 items-center gap-3 lg:border-l lg:border-white/10 lg:pl-6">
            <ActiveIcon className="h-4 w-4 shrink-0 text-gold" />
            <div className="min-w-0"><p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-stone-500">Current workspace</p><p className="truncate text-sm font-semibold text-parchment">{activeItem.label}</p></div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-500 sm:flex"><Shield className="h-4 w-4 text-moss" /> Local and private</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-banner text-xs font-black text-white">P</span>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0b0f12] px-3 py-2 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return <button key={item.id} onClick={() => onViewChange(item.id)} className={`flex shrink-0 items-center gap-2 border px-3 py-2 text-xs font-semibold ${active ? 'border-gold/60 bg-gold/10 text-gold' : 'border-white/10 text-stone-400'}`}><Icon className="h-4 w-4" />{item.label}</button>;
          })}
        </nav>

        <main className="relative mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
