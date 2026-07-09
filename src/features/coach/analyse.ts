import type { Game } from '../../types';

export function getCoachRecommendations(games: Game[]) {
  if (games.length === 0) {
    return ['Log your first ranked game to unlock personalized coaching. Start with one clean Dark Age mission.'];
  }

  const recent = games.slice(0, 10);
  const losses = recent.filter((game) => game.result === 'Loss');
  const housedRate = recent.filter((game) => game.gotHoused).length / recent.length;
  const scoutRate = recent.filter((game) => game.scoutedEnemyOpening).length / recent.length;
  const twoTcRate = recent.filter((game) => game.addedTwoTcs).length / recent.length;
  const avgIdle = recent.reduce((sum, game) => sum + game.idleTcTime, 0) / recent.length;
  const feudalPressureLosses = losses.filter((game) => /feudal|scout|archer|tower|pressure/i.test(game.mainMistake)).length;

  const recommendations: string[] = [];

  if (avgIdle > 50) recommendations.push('High idle TC time: focus your next set on constant villager production.');
  if (housedRate >= 0.35) recommendations.push('House blocks are costing momentum: set a house-before-15-pop checkpoint.');
  if (scoutRate < 0.65) recommendations.push('Scouting rate is low: identify the enemy opening before committing army.');
  if (twoTcRate < 0.55) recommendations.push('Castle transition needs structure: rehearse dropping 2 TCs within one minute.');
  if (feudalPressureLosses >= 2) recommendations.push('Repeated Feudal pressure losses: practice small walls, spears, and defensive scouting.');

  return recommendations.length > 0 ? recommendations : ['Your fundamentals look stable. Pick one sharper mission and raise the difficulty.'];
}

export function getCurrentMission(games: Game[], fallbackMission: string) {
  return getCoachRecommendations(games)[0] ?? fallbackMission;
}
