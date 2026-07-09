import { CheckCircle2, Circle } from 'lucide-react';
import { Card } from '../../components/Card';
import { EraBadge, RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import type { Mission } from '../../types';

interface MissionBoardProps {
  missions: Mission[];
  onMissionsChange: (missions: Mission[]) => void;
}

export function MissionBoard({ missions, onMissionsChange }: MissionBoardProps) {
  const totalXp = missions.filter((mission) => mission.completed).reduce((sum, mission) => sum + mission.xp, 0);

  function toggleMission(id: string) {
    onMissionsChange(missions.map((mission) => (mission.id === id ? { ...mission, completed: !mission.completed } : mission)));
  }

  return (
    <>
      <SectionHeader eyebrow="Mission board" title="Train one habit at a time" description="Complete focused ladder missions to earn XP and make fundamentals visible." />
      <div className="aoe-plaque mb-5 rounded border p-4 text-parchment">Campaign XP earned: <strong>{totalXp}</strong></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {missions.map((mission) => {
          const Icon = mission.completed ? CheckCircle2 : Circle;
          return (
            <Card key={mission.id} className={mission.completed ? 'border-moss/70 bg-moss/10' : ''}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze">{mission.category}</p>
                  <h2 className="mt-2 font-display text-2xl text-parchment">{mission.title}</h2>
                </div>
                <button onClick={() => toggleMission(mission.id)} className="rounded border border-gold/30 p-2 text-vellum hover:border-gold hover:text-gold" title="Toggle mission completion">
                  <Icon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-vellum">{mission.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <RewardPill>+{mission.xp} XP</RewardPill>
                <EraBadge tone={mission.xp >= 130 ? 'red' : mission.xp >= 110 ? 'gold' : 'green'}>
                  {mission.xp >= 130 ? 'Hard' : mission.xp >= 110 ? 'Medium' : 'Easy'}
                </EraBadge>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
