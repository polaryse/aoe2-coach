export type GameResult = 'Win' | 'Loss';
export type MatchType = 'Ranked' | 'AI';
export type ReviewCategory = 'Macro' | 'Micro' | 'Scouting' | 'Decision-making';

export interface Game {
  id: string;
  date: string;
  matchType?: MatchType;
  aiDifficulty?: string;
  result: GameResult;
  myCiv: string;
  opponentCiv: string;
  map: string;
  opening: string;
  eloAfter?: number;
  idleTcTime: number;
  castleAgeTime: string;
  gotHoused: boolean;
  scoutedEnemyOpening: boolean;
  addedTwoTcs: boolean;
  mainMistake: string;
  lessonLearned: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  passCriteria: string;
  successMetric: string;
  targetCount: number;
  xp: number;
  category: string;
  completed: boolean;
}

export interface SkillNode {
  id: string;
  age: 'Dark Age' | 'Feudal Age' | 'Castle Age' | 'Imperial Age';
  title: string;
  description: string;
  practiceDrill?: string;
  promotionRule?: string;
  completed: boolean;
}

export interface ReplayReview {
  id: string;
  date: string;
  lostControlMinute: string;
  cause: string;
  category: ReviewCategory;
  nextGameMission: string;
  sourceFileName?: string;
  sourceType?: 'Readable export' | 'AoE2 .aoe2record' | 'CaptureAge .caderec';
  parserConfidence?: 'High' | 'Medium' | 'Low';
  parserNotes?: string[];
  timelineEvents?: TimelineEvent[];
  coachingNotes?: string[];
  resourceStats?: ResourceStats[];
  idleTcStats?: IdleTcStats[];
  players?: PlayerIdentity[];
  coachedPlayerId?: string;
  coachingGoals?: ReplayCoachGoal[];
}

export interface ReplayCoachGoal {
  id: string;
  priority: 'Primary' | 'Secondary' | 'Watch';
  category: ReviewCategory;
  title: string;
  evidence: string;
  diagnosis: string;
  mission: string;
  successMetric: string;
}

export interface TimelineEvent {
  minute: string;
  label: string;
  detail?: string;
  playerId?: string;
  playerName?: string;
  category: ReviewCategory;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface PlayerIdentity {
  id: string;
  name: string;
  isAi?: boolean;
  civilizationId?: number;
  civilization?: string;
}

export interface ResourceStats {
  player: string;
  playerId?: string;
  food?: number;
  wood?: number;
  gold?: number;
  stone?: number;
  total?: number;
  objectCount?: number;
  snapshotType?: 'Current bank' | 'Collected';
}

export interface IdleTcStats {
  player: string;
  playerId?: string;
  seconds: number;
  byAge?: Partial<Record<'Dark Age' | 'Feudal Age' | 'Castle Age' | 'Imperial Age', number>>;
  estimated?: boolean;
}

export interface BuildOrder {
  id: string;
  title: string;
  civ: string;
  difficulty: string;
  summary: string;
  steps: string[];
  beginnerNotes: string[];
  commonMistakes: string[];
}

export interface Civilization {
  id: string;
  name: string;
  initials: string;
  focus: 'Archers' | 'Cavalry' | 'Infantry' | 'Camels' | 'Elephants' | 'Cavalry archers' | 'Monks' | 'Naval' | 'Siege' | 'Gunpowder' | 'Flexible';
  region: string;
  beginnerTier: 'Recommended' | 'Friendly' | 'Advanced';
  beginnerReason: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

