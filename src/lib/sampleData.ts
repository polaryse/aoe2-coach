import type { BuildOrder, Mission, SkillNode } from '../types';

export const sampleMissions: Mission[] = [
  { id: 'm-dark-tc', title: 'No idle TC in Dark Age', description: 'Keep villagers queued until Feudal is clicked.', xp: 120, category: 'Macro', completed: false },
  { id: 'm-houses', title: "Don't get housed", description: 'Place every house before you hit the cap.', xp: 90, category: 'Dark Age', completed: false },
  { id: 'm-scout', title: 'Scout enemy military before 8:30', description: 'Identify barracks, stable, range, or forward pressure in time.', xp: 110, category: 'Scouting', completed: false },
  { id: 'm-castle-tcs', title: 'Add 2 extra TCs fast', description: 'Drop two extra Town Centers within one minute of Castle Age.', xp: 150, category: 'Castle Age', completed: false },
  { id: 'm-fight-vills', title: 'Queue villagers during every fight', description: 'Use control groups and hotkeys while fighting.', xp: 130, category: 'Macro', completed: false },
];

export const sampleSkillNodes: SkillNode[] = [
  { id: 's-sheep', age: 'Dark Age', title: 'Sheep management', description: 'Keep sheep under the TC and reduce walking time.', completed: false },
  { id: 's-boar', age: 'Dark Age', title: 'Boar lure', description: 'Lure cleanly without losing villager time.', completed: false },
  { id: 's-house', age: 'Dark Age', title: 'No house blocks', description: 'Build houses before the warning sound.', completed: false },
  { id: 's-scout-enemy', age: 'Dark Age', title: 'Scout enemy', description: 'Find resources, walls, and opening clues.', completed: false },
  { id: 's-scout-rush', age: 'Feudal Age', title: 'Scout rush', description: 'Pressure without stopping villager production.', completed: false },
  { id: 's-defend-scouts', age: 'Feudal Age', title: 'Defend scouts', description: 'Wall, spear, and track enemy movement.', completed: false },
  { id: 's-defend-archers', age: 'Feudal Age', title: 'Defend archers', description: 'Use skirms, towers, walls, and positioning.', completed: false },
  { id: 's-small-walls', age: 'Feudal Age', title: 'Small walling', description: 'Protect exposed resources quickly.', completed: false },
  { id: 's-2tc', age: 'Castle Age', title: '2 TC boom', description: 'Add TCs while keeping farms, wood, and production stable.', completed: false },
  { id: 's-knights', age: 'Castle Age', title: 'Knight production', description: 'Maintain stable output and upgrades.', completed: false },
  { id: 's-upgrades', age: 'Castle Age', title: 'Upgrades', description: 'Prioritize eco and blacksmith upgrades.', completed: false },
  { id: 's-siege-monk', age: 'Castle Age', title: 'Monastery/siege basics', description: 'Break defensive positions and protect pushes.', completed: false },
  { id: 's-eco-balance', age: 'Imperial Age', title: 'Economy balance', description: 'Rebalance villagers around tech switches.', completed: false },
  { id: 's-army-comp', age: 'Imperial Age', title: 'Army composition', description: 'Pair gold units with trash and siege.', completed: false },
  { id: 's-tech-switch', age: 'Imperial Age', title: 'Tech switches', description: 'Prepare transitions before the first army expires.', completed: false },
];

export const buildOrders: BuildOrder[] = [
  {
    id: 'bo-franks-scouts',
    title: '20-pop Scouts into Knights',
    civ: 'Franks',
    difficulty: 'Beginner friendly',
    summary: 'A clean cavalry ladder plan: early scouts, strong berries, then Castle Age knights.',
    steps: ['6 on sheep', '4 on wood', '1 lure boar', '3 to berries', 'Push deer if safe', 'Click Feudal at 20 pop', 'Build stable and blacksmith', 'Make 3-5 scouts', 'Add farms steadily', 'Click Castle with stable ready', 'Add second stable and knights'],
    beginnerNotes: ['Franks save food with berry bonus, so keep berries efficient.', 'Your first goal is smooth production, not killing villagers immediately.'],
    commonMistakes: ['Overmaking scouts and delaying Castle Age.', 'Forgetting horse collar before heavy farming.', 'Fighting under spears instead of raiding around them.'],
  },
  {
    id: 'bo-magyars-scouts',
    title: 'Magyars Scouts',
    civ: 'Magyars',
    difficulty: 'Aggressive beginner',
    summary: 'Use cheaper scouts to keep pressure high while practicing Feudal control.',
    steps: ['6 on sheep', '4 on wood', 'Boar under TC', '3 to berries', 'Add farms after mill', 'Click Feudal around 20 pop', 'Stable immediately', 'Research forging when pressure starts', 'Keep scouts alive', 'Add archery range or market if game demands it'],
    beginnerNotes: ['Cheap scouts reward activity, but dead scouts teach nothing.', 'Use the scout group to see where the opponent is weak before diving.'],
    commonMistakes: ['Skipping eco while attacking.', 'Taking bad fights against spears.', 'Not scouting the counterattack.'],
  },
  {
    id: 'bo-mongols-scouts',
    title: 'Mongols Scouts',
    civ: 'Mongols',
    difficulty: 'Fast tempo',
    summary: 'A deer-powered opening that reaches pressure quickly and can snowball map control.',
    steps: ['6 on sheep', 'Push deer early', '4 on wood', 'Boar lure with clean timing', 'Mill berries after first wood rhythm', 'Click Feudal fast at 19-20 pop', 'Stable on arrival', 'Scout with first units before committing', 'Farm behind pressure', 'Transition to Castle Age mobility'],
    beginnerNotes: ['The hunt bonus is powerful only if your scout and TC stay active.', 'A slightly slower clean build beats a fast messy one.'],
    commonMistakes: ['Losing the scout while pushing deer.', 'Floating wood without farms.', 'Attacking blindly into walls and spears.'],
  },
];
