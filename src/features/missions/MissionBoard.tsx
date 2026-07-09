import { CheckCircle2, Circle, Flame, Target, Trophy } from 'lucide-react';
import { Card } from '../../components/Card';
import { EraBadge, RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import type { Mission } from '../../types';

interface MissionBoardProps {
  missions: Mission[];
  onMissionsChange: (missions: Mission[]) => void;
}

export function MissionBoard({ missions, onMissionsChange }: MissionBoardProps) {
  const completed = missions.filter((mission) => mission.completed);
  const activeMissions = missions.filter((mission) => !mission.completed);
  const recommended = activeMissions[0] ?? missions[0];
  const totalXp = completed.reduce((sum, mission) => sum + mission.xp, 0);
  const progress = missions.length ? Math.round((completed.length / missions.length) * 100) : 0;

  function toggleMission(id: string) {
    onMissionsChange(missions.map((mission) => (mission.id === id ? { ...mission, completed: !mission.completed } : mission)));
  }

  return (
    <>
      <SectionHeader eyebrow="Mission Board" title="Train One Habit at a Time" description="Use focused habit contracts to turn coaching advice into repeatable ranked-game actions." />

      <section className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="aoe-plaque">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <EraBadge tone="green">Recommended focus</EraBadge>
              <h2 className="mt-3 font-display text-3xl text-parchment">{recommended?.title ?? 'All missions complete'}</h2>
              <p className="mt-2 max-w-2xl text-sm text-vellum">{recommended?.description ?? 'Raise the difficulty with a new training block.'}</p>
            </div>
            {recommended && (
              <button
                onClick={() => toggleMission(recommended.id)}
                className="rounded border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-bold text-gold transition hover:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 active:translate-y-px"
              >
                {recommended.completed ? 'Reopen mission' : 'Mark complete'}
              </button>
            )}
          </div>

          {recommended && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <HabitBlock icon={<Target className="h-4 w-4" />} title="Pass condition" text={recommended.passCriteria} />
              <HabitBlock icon={<Trophy className="h-4 w-4" />} title="Mastery target" text={recommended.successMetric} />
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Campaign progress</p>
          <h2 className="mt-2 font-display text-3xl text-parchment">{completed.length}/{missions.length} contracts complete</h2>
          <div className="mt-4 h-3 overflow-hidden rounded border border-gold/20 bg-black/40">
            <div className="h-full bg-gradient-to-r from-banner via-bronze to-gold" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <RewardPill>{totalXp} XP earned</RewardPill>
            <RewardPill>{activeMissions.length} active missions</RewardPill>
            <RewardPill>{progress}% complete</RewardPill>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {missions.map((mission) => {
          const isRecommended = recommended?.id === mission.id && !mission.completed;
          return (
            <article
              key={mission.id}
              className={`rounded border p-4 transition ${
                mission.completed
                  ? 'border-moss/50 bg-[#0f0b08]/25'
                  : isRecommended
                    ? 'border-gold bg-gold/10 shadow-glow'
                    : 'border-gold/20 bg-[#0f0b08]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EraBadge tone={mission.completed ? 'green' : isRecommended ? 'gold' : 'blue'}>{mission.category}</EraBadge>
                    {isRecommended && <span className="rounded bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#171008]">Next mission</span>}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-parchment">{mission.title}</h2>
                </div>
                <button
                  onClick={() => toggleMission(mission.id)}
                  className={`rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-gold/30 active:translate-y-px ${
                    mission.completed ? 'text-moss hover:text-green-200' : 'text-vellum hover:text-gold'
                  }`}
                  title={mission.completed ? 'Reopen mission' : 'Mark mission complete'}
                >
                  {mission.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>
              </div>

              <p className="mt-3 text-sm text-vellum">{mission.description}</p>

              <div className="mt-4 space-y-2 border-l border-gold/20 pl-3">
                <p className="text-sm text-parchment"><strong>Pass:</strong> {mission.passCriteria}</p>
                <p className="text-sm text-vellum"><strong>Mastery:</strong> {mission.successMetric}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <RewardPill>+{mission.xp} XP</RewardPill>
                <RewardPill>{mission.targetCount}-game target</RewardPill>
                <EraBadge tone={mission.xp >= 130 ? 'red' : mission.xp >= 110 ? 'gold' : 'green'}>
                  {mission.xp >= 130 ? 'Hard' : mission.xp >= 110 ? 'Medium' : 'Easy'}
                </EraBadge>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function HabitBlock({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded border border-gold/15 bg-[#0f0b08]/30 p-3">
      <div className="flex items-center gap-2 text-gold">
        {icon}
        <p className="text-xs font-bold uppercase tracking-[0.16em]">{title}</p>
      </div>
      <p className="mt-2 text-sm text-vellum">{text}</p>
    </div>
  );
}
