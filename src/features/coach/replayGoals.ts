import type { IdleTcStats, PlayerIdentity, ReplayCoachGoal, ResourceStats, TimelineEvent } from '../../types';

interface ReplayEvidence {
  players: PlayerIdentity[];
  events: TimelineEvent[];
  idleTcStats: IdleTcStats[];
  resourceStats: ResourceStats[];
}

const idleTargets = {
  'Dark Age': 25,
  'Feudal Age': 45,
  'Castle Age': 60,
  'Imperial Age': 90,
} as const;

export function getReplayCoachGoals(evidence: ReplayEvidence, requestedPlayerId?: string): ReplayCoachGoal[] {
  const player = evidence.players.find((entry) => entry.id === requestedPlayerId)
    ?? evidence.players.find((entry) => !entry.isAi)
    ?? evidence.players[0];
  if (!player) return [];

  const goals: Array<ReplayCoachGoal & { score: number }> = [];
  const idle = evidence.idleTcStats.find((entry) => entry.playerId === player.id);
  const worstIdleAge = idle?.byAge
    ? Object.entries(idle.byAge)
      .map(([age, seconds]) => ({ age: age as keyof typeof idleTargets, seconds: seconds ?? 0, target: idleTargets[age as keyof typeof idleTargets] }))
      .filter((entry) => entry.seconds > entry.target)
      .sort((left, right) => (right.seconds / right.target) - (left.seconds / left.target))[0]
    : undefined;

  if (worstIdleAge) {
    goals.push({
      id: `replay-idle-${slug(worstIdleAge.age)}`,
      priority: 'Primary',
      category: 'Macro',
      title: `${worstIdleAge.age.replace(' Age', '')} Age TC Rhythm`,
      evidence: `${player.name} recorded about ${formatDuration(worstIdleAge.seconds)} estimated idle TC time in ${worstIdleAge.age}.`,
      diagnosis: 'Villager production is dropping while attention moves to army, upgrades, or expansion. This compounds every minute that follows.',
      mission: `Keep every active Town Center covered by a villager queue throughout ${worstIdleAge.age}.`,
      successMetric: `Reduce estimated ${worstIdleAge.age} idle TC below ${formatDuration(worstIdleAge.target)} in 2 of the next 3 games.`,
      score: 100 + worstIdleAge.seconds / worstIdleAge.target,
    });
  }

  const ageDeficits = ['Feudal', 'Castle', 'Imperial'].flatMap((age) => {
    const own = findAgeTime(evidence.events, player.id, age);
    const fastestOpponent = evidence.players
      .filter((entry) => entry.id !== player.id)
      .map((entry) => ({ player: entry, time: findAgeTime(evidence.events, entry.id, age) }))
      .filter((entry): entry is { player: PlayerIdentity; time: number } => entry.time !== null)
      .sort((left, right) => left.time - right.time)[0];
    if (own === null || !fastestOpponent || own <= fastestOpponent.time + 30) return [];
    return [{ age, own, opponent: fastestOpponent.player, opponentTime: fastestOpponent.time, deficit: own - fastestOpponent.time }];
  }).sort((left, right) => right.deficit - left.deficit);

  const ageDeficit = ageDeficits[0];
  if (ageDeficit) {
    goals.push({
      id: `replay-age-${ageDeficit.age.toLowerCase()}`,
      priority: goals.length ? 'Secondary' : 'Primary',
      category: 'Decision-making',
      title: `${ageDeficit.age} Transition Plan`,
      evidence: `${player.name} reached ${ageDeficit.age} at ${formatClock(ageDeficit.own)}, ${formatDuration(ageDeficit.deficit)} after ${ageDeficit.opponent.name}.`,
      diagnosis: 'The age transition was delayed or unsupported by enough pressure to compensate for the opponent reaching the next tech tier first.',
      mission: `Before clicking ${ageDeficit.age}, choose one plan: age within 90 seconds of the opponent or commit to damage that delays their transition.`,
      successMetric: `Reach ${ageDeficit.age} within 1:30 of the opponent, or record clear economic damage before they age up.`,
      score: 80 + ageDeficit.deficit / 10,
    });
  }

  const castleTime = findAgeTime(evidence.events, player.id, 'Castle');
  const extraTownCenter = evidence.events.find((event) => event.playerId === player.id && event.label === 'First Town Center');
  if (castleTime !== null && !extraTownCenter) {
    goals.push({
      id: 'replay-castle-commitment',
      priority: goals.length ? 'Secondary' : 'Primary',
      category: 'Macro',
      title: 'Commit the First Castle Minute',
      evidence: `No additional Town Center was detected for ${player.name} after reaching Castle Age at ${formatClock(castleTime)}.`,
      diagnosis: 'The opening can lose direction when Castle Age arrives without an immediate boom, siege, monastery, or sustained military commitment.',
      mission: 'Within 60 seconds of Castle Age, add a Town Center or start the production building that supports your chosen pressure plan.',
      successMetric: 'Make and execute the Castle commitment within 1:00 in 2 consecutive games.',
      score: 68,
    });
  }

  const militaryStart = evidence.events.find((event) => event.playerId === player.id && event.label === 'Military Production Began');
  const feudalTime = findAgeTime(evidence.events, player.id, 'Feudal');
  const militaryMinute = militaryStart ? parseClock(militaryStart.minute) : null;
  if (feudalTime !== null && (militaryMinute === null || militaryMinute > feudalTime + 90)) {
    const delay = militaryMinute === null ? 'No military production signal was detected.' : `Military production began ${formatDuration(militaryMinute - feudalTime)} after reaching Feudal.`;
    goals.push({
      id: 'replay-feudal-production',
      priority: goals.length ? 'Secondary' : 'Primary',
      category: 'Decision-making',
      title: 'Turn Feudal Into Military',
      evidence: delay,
      diagnosis: 'A slow first unit gives away scouting pressure and lets the opponent choose the pace of Feudal Age.',
      mission: 'Start the first military unit within 45 seconds of reaching Feudal Age.',
      successMetric: 'Hit the 0:45 production window in 3 of the next 5 games.',
      score: 72,
    });
  }

  const resourceSnapshot = evidence.resourceStats.find((entry) => entry.playerId === player.id);
  if ((resourceSnapshot?.total ?? 0) >= 2_000) {
    goals.push({
      id: 'replay-resource-spend',
      priority: 'Watch',
      category: 'Macro',
      title: 'Convert the Bank Into Power',
      evidence: `${player.name} had ${resourceSnapshot?.total?.toLocaleString()} resources in the final synchronized bank snapshot.`,
      diagnosis: 'A large bank often means production, upgrades, or the next composition switch could have arrived earlier.',
      mission: 'At every production cycle, spend toward units, upgrades, or a deliberate tech switch before returning to micro.',
      successMetric: 'Keep the combined bank below 1,500 during active fighting, unless saving for a named technology.',
      score: 45,
    });
  }

  if (!goals.length) {
    goals.push({
      id: 'replay-clean-execution',
      priority: 'Primary',
      category: 'Decision-making',
      title: 'Repeat the Clean Opening',
      evidence: 'No major timing or production leak crossed the current coaching thresholds.',
      diagnosis: 'The next improvement will come from repeating the opening reliably and reviewing the first decision that changed the game.',
      mission: 'Repeat the same opening and mark the first moment you deviated from the plan.',
      successMetric: 'Complete the opening within 30 seconds of the same benchmarks in 3 games.',
      score: 50,
    });
  }

  return goals.sort((left, right) => right.score - left.score).slice(0, 4).map(({ score: _score, ...goal }) => goal);
}

function findAgeTime(events: TimelineEvent[], playerId: string, age: string) {
  const event = events.find((entry) => entry.playerId === playerId && entry.label === `${age} Age Transition`);
  return event ? parseClock(event.minute) : null;
}

function parseClock(value: string) {
  const match = value.match(/^(\d{1,3}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function formatClock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
