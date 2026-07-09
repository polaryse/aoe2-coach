import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Crown, Gamepad2, Shield, Target } from 'lucide-react';
import { Card } from '../../components/Card';
import { AgeMarker, ResourceChip, EraBadge, ProgressRing, RewardPill, StatPlaque } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import { getCoachRecommendations, getCurrentMission } from '../coach/analyse';
import type { Game, Mission } from '../../types';

interface DashboardProps {
  games: Game[];
  missions: Mission[];
  xp: number;
}

export function Dashboard({ games, missions, xp }: DashboardProps) {
  const currentElo = games[0]?.eloAfter ?? 0;
  const peakElo = games.length ? Math.max(...games.map((game) => game.eloAfter)) : 0;
  const wins = games.filter((game) => game.result === 'Win').length;
  const winRate = games.length ? Math.round((wins / games.length) * 100) : 0;
  const level = Math.floor(xp / 500) + 1;
  const levelProgress = xp % 500;
  const activeMissionObject = missions.find((mission) => !mission.completed);
  const activeMission = activeMissionObject?.title ?? 'Choose a harder ladder mission';
  const chartData = [...games].reverse().map((game) => ({ date: game.date.slice(5), elo: game.eloAfter }));
  const recommendations = getCoachRecommendations(games);
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const missionProgress = missions.length ? (completedMissions / missions.length) * 100 : 0;
  const rankTitle = xp >= 1500 ? 'Imperial Strategist' : xp >= 900 ? 'Castle Commander' : xp >= 400 ? 'Feudal Captain' : 'Dark Age Recruit';

  return (
    <>
      <SectionHeader eyebrow="Command Center" title="Ranked improvement dashboard" description="Track your ladder direction, current training focus, and the habits that decide close games." />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatPlaque label="Current Elo" value={currentElo ? currentElo.toString() : 'No games'} detail="Latest logged rating" icon={<Crown className="h-9 w-9" />} />
        <StatPlaque label="Peak Elo" value={peakElo ? peakElo.toString() : '-'} detail="Best recorded rating" icon={<Shield className="h-9 w-9" />} />
        <StatPlaque label="Games played" value={games.length.toString()} detail={`${wins} wins logged`} icon={<Gamepad2 className="h-9 w-9" />} />
        <StatPlaque label="Win rate" value={`${winRate}%`} detail="Across saved games" icon={<Target className="h-9 w-9" />} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="min-h-[340px]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-parchment">Elo trend</h2>
              <p className="text-sm text-vellum">Your logged ranked climb over time.</p>
            </div>
            <div className="hidden flex-wrap gap-2 md:flex">
              <AgeMarker age="Dark" />
              <AgeMarker age="Feudal" />
              <AgeMarker age="Castle" />
              <AgeMarker age="Imperial" />
            </div>
          </div>
          {games.length ? (
            <div className="h-64 rounded border border-gold/20 bg-[#0f0b08]/40 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e6bd62" stopOpacity={0.86} />
                      <stop offset="95%" stopColor="#7e2230" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#d8bd83" />
                  <YAxis stroke="#d8bd83" domain={['dataMin - 25', 'dataMax + 25']} />
                  <Tooltip contentStyle={{ background: '#171008', border: '1px solid #c59246', color: '#f2dfaf' }} />
                  <Area type="monotone" dataKey="elo" stroke="#f2dfaf" fill="url(#eloGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-64 place-items-center rounded border border-dashed border-gold/30 bg-[#0f0b08]/40 px-6 text-center text-vellum">
              Log your first ranked game to draw the campaign map.
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <EraBadge tone="red">Level {level}</EraBadge>
                <h2 className="mt-3 font-display text-3xl text-parchment">{rankTitle}</h2>
                <p className="mt-1 text-sm text-vellum">{xp} total XP</p>
              </div>
              <ProgressRing value={(levelProgress / 500) * 100} label="Next" detail={`${500 - levelProgress} XP left`} />
            </div>
          </Card>
          <Card>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze">Coach-selected mission</p>
            <h2 className="mt-2 font-display text-2xl text-parchment">{activeMission}</h2>
            <p className="mt-3 text-sm text-vellum">{getCurrentMission(games, activeMission)}</p>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <RewardPill>{completedMissions}/{missions.length} missions complete</RewardPill>
                {activeMissionObject && <RewardPill>+{activeMissionObject.xp} XP next</RewardPill>}
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded border border-gold/20 bg-black/40">
                <div className="h-full bg-gradient-to-r from-banner via-bronze to-gold" style={{ width: `${missionProgress}%` }} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="aoe-plaque">
          <div className="flex items-start justify-between gap-4">
            <div>
              <EraBadge>Coach briefing</EraBadge>
              <h2 className="mt-3 font-display text-2xl text-parchment">Next ranked set</h2>
            </div>
            <div className="rounded border border-gold/30 bg-[#0f0b08]/50 px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-vellum">Focus</p>
              <p className="font-display text-xl text-parchment">{games.length ? '1 habit' : 'First log'}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ResourceChip type="food" />
            <ResourceChip type="wood" />
            <ResourceChip type="gold" />
            <ResourceChip type="stone" />
          </div>
          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <div key={item} className="rounded border border-gold/25 bg-[#0f0b08]/40 p-3 text-sm text-parchment">{item}</div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-2xl text-parchment">Recent games</h2>
          <div className="mt-4 space-y-3">
            {games.slice(0, 4).map((game) => (
              <div key={game.id} className="flex items-center justify-between rounded border border-gold/20 bg-[#0f0b08]/40 p-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EraBadge tone={game.result === 'Win' ? 'green' : 'red'}>{game.result}</EraBadge>
                    <p className="font-semibold text-stone-100">{game.myCiv} vs {game.opponentCiv}</p>
                  </div>
                  <p className="mt-2 text-sm text-vellum">{game.map} / {game.opening}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-vellum">{game.eloAfter} Elo</p>
                </div>
              </div>
            ))}
            {!games.length && <p className="rounded border border-dashed border-gold/30 p-4 text-vellum">No games logged yet.</p>}
          </div>
        </Card>
      </section>
    </>
  );
}


