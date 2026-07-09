export type GameResult = 'Win' | 'Loss';
export type ReviewCategory = 'Macro' | 'Micro' | 'Scouting' | 'Decision-making';

export interface Game {
  id: string;
  date: string;
  result: GameResult;
  myCiv: string;
  opponentCiv: string;
  map: string;
  opening: string;
  eloAfter: number;
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
  xp: number;
  category: string;
  completed: boolean;
}

export interface SkillNode {
  id: string;
  age: 'Dark Age' | 'Feudal Age' | 'Castle Age' | 'Imperial Age';
  title: string;
  description: string;
  completed: boolean;
}

export interface ReplayReview {
  id: string;
  date: string;
  lostControlMinute: string;
  cause: string;
  category: ReviewCategory;
  nextGameMission: string;
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
