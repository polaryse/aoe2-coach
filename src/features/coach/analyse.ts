import type { Game } from '../../types';

export interface CoachRecommendation {
  title: string;
  trigger: string;
  likelyCause: string;
  replayCheck: string;
  nextMission: string;
  successMetric: string;
}

export function getCoachRecommendations(games: Game[]) {
  return getCoachRecommendationDetails(games).map((recommendation) => `${recommendation.title}: ${recommendation.nextMission}`);
}

export function getCoachRecommendationDetails(games: Game[]): CoachRecommendation[] {
  if (games.length === 0) {
    return [{
      title: 'Log your first ranked game',
      trigger: 'No ranked games have been logged yet.',
      likelyCause: 'AoE2 Coach needs at least one game to identify useful patterns.',
      replayCheck: 'After your next game, record the opening, idle TC time, scouting, and main mistake.',
      nextMission: 'Play one ranked game with no idle TC before clicking Feudal.',
      successMetric: 'A complete game log with one lesson learned.',
    }];
  }

  const recent = games.slice(0, 10);
  const losses = recent.filter((game) => game.result === 'Loss');
  const housedRate = recent.filter((game) => game.gotHoused).length / recent.length;
  const scoutRate = recent.filter((game) => game.scoutedEnemyOpening).length / recent.length;
  const twoTcRate = recent.filter((game) => game.addedTwoTcs).length / recent.length;
  const avgIdle = recent.reduce((sum, game) => sum + game.idleTcTime, 0) / recent.length;
  const feudalPressureLosses = losses.filter((game) => /feudal|scout|archer|tower|pressure/i.test(game.mainMistake)).length;

  const recommendations: CoachRecommendation[] = [];

  if (avgIdle > 50) recommendations.push({
    title: 'High idle TC time',
    trigger: `Average idle TC is ${Math.round(avgIdle)} seconds across recent games.`,
    likelyCause: housedRate >= 0.35 ? 'House planning and fight multitasking are likely interrupting villager production.' : 'Attention is probably moving to army control without a villager queue habit.',
    replayCheck: 'Check 30 seconds before each idle spike: were you housed, fighting, or floating food?',
    nextMission: 'Queue villagers before every Feudal fight.',
    successMetric: 'Idle TC under 25 seconds before Feudal in 3 of your next 5 games.',
  });
  if (housedRate >= 0.35) recommendations.push({
    title: 'House blocks are costing momentum',
    trigger: `${Math.round(housedRate * 100)}% of recent games include a house block.`,
    likelyCause: 'Houses are being placed reactively after the warning rather than as part of the build rhythm.',
    replayCheck: 'Look at the first house block and check whether a military building or farm transition distracted you.',
    nextMission: 'Build two houses before adding your first Feudal military building.',
    successMetric: 'No house block before 12:00 in 3 of your next 5 games.',
  });
  if (scoutRate < 0.65) recommendations.push({
    title: 'Scouting rate is low',
    trigger: `Enemy opening scouted in only ${Math.round(scoutRate * 100)}% of recent games.`,
    likelyCause: 'The scout is probably staying near home too long or being used without a specific question.',
    replayCheck: 'Pause at 7:30 and ask: do you know stable, range, barracks, walls, or forward pressure?',
    nextMission: 'Identify the first enemy military building before 8:30.',
    successMetric: 'Scout the opening in 2 of your next 3 games.',
  });
  if (twoTcRate < 0.55) recommendations.push({
    title: 'Castle transition needs structure',
    trigger: `2 TC transition hit in ${Math.round(twoTcRate * 100)}% of recent games.`,
    likelyCause: 'The first Castle Age minute is being spent reacting instead of executing a planned boom or pressure choice.',
    replayCheck: 'At Castle Age arrival, check wood, stone, villager queue, and whether your army is safe.',
    nextMission: 'Drop 2 extra TCs within one minute of Castle Age.',
    successMetric: 'Complete the transition twice before choosing a harder Castle mission.',
  });
  if (feudalPressureLosses >= 2) recommendations.push({
    title: 'Feudal pressure is deciding games',
    trigger: `${feudalPressureLosses} recent losses mention Feudal pressure, scouts, archers, towers, or early aggression.`,
    likelyCause: 'Defensive scouting, small walls, and first counter units are arriving after damage is already done.',
    replayCheck: 'Review the minute before the first villager loss: did you see the army coming?',
    nextMission: 'Small wall exposed resources and add the correct counter before the first raid lands.',
    successMetric: 'Take no more than two villager losses before Castle Age in your next 3 games.',
  });

  return recommendations.length > 0 ? recommendations : [{
    title: 'Fundamentals look stable',
    trigger: 'No major repeated beginner leak was detected in recent games.',
    likelyCause: 'Your logged habits are consistent enough to raise the training difficulty.',
    replayCheck: 'Review one close loss and identify whether the turning point was macro, micro, scouting, or decision-making.',
    nextMission: 'Pick one sharper mission and raise the difficulty.',
    successMetric: 'Complete one hard mission in the next 3 games.',
  }];
}

export function getCurrentMission(games: Game[], fallbackMission: string) {
  return getCoachRecommendations(games)[0] ?? fallbackMission;
}

