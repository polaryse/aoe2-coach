import { Card } from '../../components/Card';
import { RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import type { Game } from '../../types';
import { getCoachRecommendationDetails } from './analyse';

export function CoachAnalysis({ games }: { games: Game[] }) {
  const recommendations = getCoachRecommendationDetails(games);
  const avgIdle = games.length ? Math.round(games.reduce((sum, game) => sum + game.idleTcTime, 0) / games.length) : 0;
  const housed = games.filter((game) => game.gotHoused).length;
  const scouted = games.filter((game) => game.scoutedEnemyOpening).length;
  const tcs = games.filter((game) => game.addedTwoTcs).length;

  return (
    <>
      <SectionHeader eyebrow="Coach Analysis" title="Turn patterns into practice" description="AoE2 Coach reads your logged habits and turns them into simple training priorities." />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="font-display text-3xl text-parchment">Recommendations</h2>
          <div className="mt-5 space-y-3">
            {recommendations.map((item, index) => (
              <div key={item.title} className="rounded border border-gold/20 bg-[#0f0b08]/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Priority {index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-parchment">{item.title}</h3>
                <p className="mt-2 text-sm text-vellum"><strong>Trigger:</strong> {item.trigger}</p>
                <p className="mt-2 text-sm text-vellum"><strong>Likely cause:</strong> {item.likelyCause}</p>
                <p className="mt-2 text-sm text-vellum"><strong>Replay check:</strong> {item.replayCheck}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <RewardPill>{item.nextMission}</RewardPill>
                  <RewardPill>{item.successMetric}</RewardPill>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Stat label="Average idle TC" value={games.length ? `${avgIdle}s` : '-'} />
          <Stat label="Housed games" value={`${housed}/${games.length}`} />
          <Stat label="Scouted opening" value={`${scouted}/${games.length}`} />
          <Stat label="2 TC transition" value={`${tcs}/${games.length}`} />
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{label}</p>
      <p className="mt-2 font-display text-4xl text-parchment">{value}</p>
    </Card>
  );
}

