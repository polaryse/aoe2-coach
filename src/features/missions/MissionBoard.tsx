import { useMemo, useState } from 'react';
import { Check, Circle, Flag, Target } from 'lucide-react';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import type { Mission } from '../../types';

interface MissionBoardProps {
  missions: Mission[];
  onMissionsChange: (missions: Mission[]) => void;
}

const allFilter = 'All';

export function MissionBoard({ missions, onMissionsChange }: MissionBoardProps) {
  const [filter, setFilter] = useState(allFilter);
  const completed = missions.filter((mission) => mission.completed);
  const activeMissions = missions.filter((mission) => !mission.completed);
  const recommended = activeMissions[0] ?? missions[0];
  const progress = missions.length ? Math.round((completed.length / missions.length) * 100) : 0;
  const categories = useMemo(() => [allFilter, ...Array.from(new Set(missions.map((mission) => mission.category)))], [missions]);
  const visibleMissions = filter === allFilter ? missions : missions.filter((mission) => mission.category === filter);

  function toggleMission(id: string) {
    onMissionsChange(missions.map((mission) => (mission.id === id ? { ...mission, completed: !mission.completed } : mission)));
  }

  return (
    <>
      <SectionHeader eyebrow="Mission Board" title="Train One Habit at a Time" description="A calm training loop: pick one habit, play the game, mark what you practiced." />

      <section className="mb-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="aoe-plaque">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{activeMissions.length ? 'Current Focus' : 'Campaign Complete'}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl text-parchment">{recommended?.title ?? 'All Missions Complete'}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-vellum">
                {recommended?.description ?? 'You have cleared the starter board. Add a harder training block when you are ready.'}
              </p>
            </div>
            {recommended && (
              <button
                onClick={() => toggleMission(recommended.id)}
                className="rounded border border-gold/50 bg-gold/10 px-5 py-2.5 text-sm font-bold text-gold transition hover:bg-gold/15 focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {recommended.completed ? 'Practice Again' : 'Mark Complete'}
              </button>
            )}
          </div>

          {recommended && (
            <div className="mt-6 border-t border-gold/15 pt-4">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-sm font-semibold text-parchment">{recommended.passCriteria ?? 'Finish the mission objective in your next ranked game.'}</p>
                  <p className="mt-1 text-sm text-vellum">{recommended.successMetric ?? `Repeat it across ${recommended.targetCount ?? 1} games.`}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Progress</p>
          <p className="mt-3 font-display text-4xl text-parchment">{progress}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded bg-black/40">
            <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex justify-between text-sm text-vellum">
            <span>{completed.length} complete</span>
            <span>{activeMissions.length} active</span>
          </div>
        </Card>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`rounded px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-gold/30 ${
              filter === category ? 'bg-gold/15 text-gold' : 'text-vellum hover:bg-gold/10 hover:text-parchment'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <Card className="p-0">
        {visibleMissions.length === 0 ? (
          <div className="flex items-center gap-3 p-5 text-vellum">
            <Flag className="h-5 w-5 text-gold" />
            <p>No missions match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/10">
            {visibleMissions.map((mission) => {
              const isRecommended = recommended?.id === mission.id && !mission.completed;
              return (
                <div key={mission.id} className={`flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between ${isRecommended ? 'bg-gold/5' : ''}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{mission.category}</p>
                      {isRecommended && <span className="text-xs text-parchment">Next</span>}
                      {mission.completed && <span className="text-xs text-green-100">Completed</span>}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-parchment">{mission.title}</h3>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-vellum">{mission.passCriteria ?? mission.description}</p>
                  </div>
                  <button
                    onClick={() => toggleMission(mission.id)}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-gold/30 ${
                      mission.completed ? 'border-moss/50 bg-moss/15 text-green-100' : 'border-gold/30 bg-[#0f0b08]/40 text-gold hover:border-gold'
                    }`}
                  >
                    {mission.completed ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    {mission.completed ? 'Done' : 'Complete'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
