import type { ReactNode } from 'react';
import { Activity, Castle, Eye, Home, Search, Target } from 'lucide-react';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import type { Game } from '../../types';
import type { CoachRecommendation } from './analyse';
import { getCoachRecommendationDetails } from './analyse';

export function CoachAnalysis({ games }: { games: Game[] }) {
  const recommendations = getCoachRecommendationDetails(games);
  const primary = recommendations[0];
  const recentGames = games.slice(0, 10);
  const avgIdle = recentGames.length ? Math.round(recentGames.reduce((sum, game) => sum + game.idleTcTime, 0) / recentGames.length) : 0;
  const housed = recentGames.filter((game) => game.gotHoused).length;
  const scouted = recentGames.filter((game) => game.scoutedEnemyOpening).length;
  const tcs = recentGames.filter((game) => game.addedTwoTcs).length;
  const scoutingRate = recentGames.length ? Math.round((scouted / recentGames.length) * 100) : 0;
  const castleRate = recentGames.length ? Math.round((tcs / recentGames.length) * 100) : 0;

  return (
    <>
      <SectionHeader eyebrow="Coach Analysis" title="Turn Patterns into Practice" description="One priority, the reason behind it, and the next habit to train." />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="aoe-plaque">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Recommended Focus</p>
          <h2 className="mt-3 font-display text-4xl text-parchment">{primary.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-vellum">{primary.trigger}</p>

          <div className="mt-6 grid gap-4 border-t border-gold/15 pt-5 md:grid-cols-2">
            <CoachNote icon={<Search className="h-4 w-4" />} label="Why This Matters" text={primary.likelyCause} />
            <CoachNote icon={<Target className="h-4 w-4" />} label="Next Game Habit" text={primary.nextMission} />
          </div>

          <div className="mt-5 rounded border border-gold/15 bg-[#0f0b08]/30 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Replay Check</p>
            <p className="mt-2 text-sm leading-6 text-vellum">{primary.replayCheck}</p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Recent Snapshot</p>
          <div className="mt-4 grid gap-3">
            <Metric icon={<Activity className="h-4 w-4" />} label="Idle TC" value={games.length ? `${avgIdle}s` : '-'} />
            <Metric icon={<Home className="h-4 w-4" />} label="House Blocks" value={`${housed}/${recentGames.length || 0}`} />
            <Metric icon={<Eye className="h-4 w-4" />} label="Scouted Opening" value={games.length ? `${scoutingRate}%` : '-'} />
            <Metric icon={<Castle className="h-4 w-4" />} label="Castle Plan" value={games.length ? `${castleRate}%` : '-'} />
          </div>
        </Card>
      </section>

      <Card className="mt-5 p-0">
        <div className="border-b border-gold/10 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Other Signals</p>
          <p className="mt-1 text-sm text-vellum">Keep these in mind, but train only one habit at a time.</p>
        </div>
        <div className="divide-y divide-gold/10">
          {recommendations.slice(1).map((item, index) => (
            <RecommendationRow key={item.title} item={item} index={index + 2} />
          ))}
          {recommendations.length === 1 && (
            <div className="p-5 text-sm text-vellum">No secondary patterns yet. Log more games to reveal stronger trends.</div>
          )}
        </div>
      </Card>
    </>
  );
}

function CoachNote({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{label}</p>
        <p className="mt-2 text-sm leading-6 text-vellum">{text}</p>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-gold/10 bg-[#0f0b08]/25 px-3 py-3">
      <div className="flex items-center gap-3 text-vellum">
        <span className="text-gold">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-display text-2xl text-parchment">{value}</span>
    </div>
  );
}

function RecommendationRow({ item, index }: { item: CoachRecommendation; index: number }) {
  return (
    <div className="grid gap-3 p-5 md:grid-cols-[auto_1fr] md:items-start">
      <span className="font-display text-2xl text-gold/80">{index}</span>
      <div>
        <h3 className="text-base font-semibold text-parchment">{item.title}</h3>
        <p className="mt-1 text-sm leading-6 text-vellum">{item.trigger}</p>
        <p className="mt-2 text-sm text-gold">{item.nextMission}</p>
      </div>
    </div>
  );
}
