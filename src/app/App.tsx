import { useMemo, useState } from 'react';
import { Shell } from '../components/Shell';
import { sampleMissions, sampleSkillNodes } from '../lib/sampleData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Game, Mission, ReplayReview, SkillNode } from '../types';
import { Dashboard } from '../features/dashboard/Dashboard';
import { GameLog } from '../features/games/GameLog';
import { CoachAnalysis } from '../features/coach/CoachAnalysis';
import { MissionBoard } from '../features/missions/MissionBoard';
import { SkillTree } from '../features/skill-tree/SkillTree';
import { BuildOrders } from '../features/build-orders/BuildOrders';
import { ReplayReviewView } from '../features/replay-review/ReplayReviewView';
import { CivGuide } from '../features/civs/CivGuide';

export function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [games, setGames] = useLocalStorage<Game[]>('aoe2coach.games', []);
  const [missions, setMissions] = useLocalStorage<Mission[]>('aoe2coach.missions', sampleMissions);
  const [skills, setSkills] = useLocalStorage<SkillNode[]>('aoe2coach.skills', sampleSkillNodes);
  const [reviews, setReviews] = useLocalStorage<ReplayReview[]>('aoe2coach.reviews', []);

  const sortedGames = useMemo(() => [...games].sort((a, b) => b.date.localeCompare(a.date)), [games]);
  const completedXp = missions.filter((mission) => mission.completed).reduce((sum, mission) => sum + mission.xp, 0);

  return (
    <Shell activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'dashboard' && <Dashboard games={sortedGames} missions={missions} xp={completedXp} />}
      {activeView === 'games' && <GameLog games={sortedGames} onGamesChange={setGames} />}
      {activeView === 'coach' && <CoachAnalysis games={sortedGames} />}
      {activeView === 'missions' && <MissionBoard missions={missions} onMissionsChange={setMissions} />}
      {activeView === 'skills' && <SkillTree skills={skills} onSkillsChange={setSkills} />}
      {activeView === 'civs' && <CivGuide />}
      {activeView === 'builds' && <BuildOrders />}
      {activeView === 'reviews' && <ReplayReviewView reviews={reviews} onReviewsChange={setReviews} />}
    </Shell>
  );
}
