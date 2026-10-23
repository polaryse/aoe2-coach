import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BookOpen, Brain, Check, Play, Shield, Swords, Target, TrendingUp } from 'lucide-react';
import { CivIcon } from '../../components/CivIcon';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { getCoachRecommendationDetails } from '../coach/analyse';
import type { Game, Mission, SkillNode } from '../../types';

interface DashboardProps {
  games: Game[];
  missions: Mission[];
  skills: SkillNode[];
  xp: number;
  onNavigate: (view: string) => void;
}

const ages: SkillNode['age'][] = ['Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];
const ageNumerals = ['I', 'II', 'III', 'IV'];

export function Dashboard({ games, missions, skills, xp, onNavigate }: DashboardProps) {
  const rankedGames = games.filter((game) => (game.matchType ?? 'Ranked') === 'Ranked' && typeof game.eloAfter === 'number');
  const currentElo = rankedGames[0]?.eloAfter;
  const peakElo = rankedGames.length ? Math.max(...rankedGames.map((game) => game.eloAfter ?? 0)) : undefined;
  const latestGame = games[0];
  const wins = games.filter((game) => game.result === 'Win').length;
  const winRate = games.length ? Math.round((wins / games.length) * 100) : 0;
  const activeMission = missions.find((mission) => !mission.completed);
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const recommendations = getCoachRecommendationDetails(games);
  const primaryRecommendation = recommendations[0];
  const level = Math.floor(xp / 500) + 1;
  const rankTitle = xp >= 1500 ? 'Imperial Strategist' : xp >= 900 ? 'Castle Commander' : xp >= 400 ? 'Feudal Captain' : 'Dark Age Recruit';
  const form = games.slice(0, 5).map((game) => game.result === 'Win' ? 'W' : 'L').join(' ') || 'No games';
  const chartData = [...rankedGames].reverse().map((game, index) => ({ game: `G${index + 1}`, date: game.date.slice(5), elo: game.eloAfter }));
  const latestCiv = latestGame?.myCiv;

  return (
    <>
      <SectionHeader eyebrow="Command Centre" title="Ranked Improvement" description="One coaching priority, the evidence behind it, and a clear plan for your next match." />

      <section className="dashboard-context mb-4 flex flex-col gap-3 border-y border-white/10 bg-[#11171a] px-4 py-3 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <CivIcon name={latestCiv ?? ''} />
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-banner/90">Latest Training Civilisation</p>
            <p className="truncate text-sm font-bold text-parchment">{latestCiv ?? 'Choose one civilisation and opening'}</p>
            <p className="truncate text-xs text-vellum">{latestGame?.opening ?? 'Log a game to establish your current plan'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-vellum md:ml-auto">
          <span className={`h-2 w-2 rounded-full ${activeMission ? 'bg-moss shadow-[0_0_10px_#62aa70]' : 'bg-stone-600'}`} />
          {activeMission ? 'Training focus active' : 'Select a new focus'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gold md:border-l md:border-white/10 md:pl-4"><Shield className="h-4 w-4" /><span>{rankTitle}</span><b>Level {level}</b></div>
      </section>

      <section className="dashboard-hero grid overflow-hidden border border-white/10 bg-[#111619] md:grid-cols-[minmax(0,1fr)_210px] xl:grid-cols-[minmax(0,1.35fr)_230px_300px]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold"><Target className="h-4 w-4" /> Next Match Command</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] text-parchment sm:text-4xl">
            {activeMission?.title ?? (games.length ? primaryRecommendation.title : 'Log your first match.')}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-vellum">
            {activeMission?.description ?? (games.length ? primaryRecommendation.trigger : 'Start with one ranked or AI game. Your coach will turn the result into a focused training habit.')}
          </p>

          <div className="mt-6 flex max-w-2xl items-start gap-3 border-l-2 border-moss bg-moss/5 px-4 py-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-vellum">Success Condition</p><p className="mt-1 text-sm font-semibold text-parchment">{activeMission?.passCriteria ?? (games.length ? primaryRecommendation.nextMission : 'Complete the game, then record one mistake and one lesson.')}</p></div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="action" onClick={() => onNavigate('games')}><Play className="h-4 w-4" /> {games.length ? 'Log next game' : 'Log first game'}</button>
            <button className="secondary-action" onClick={() => onNavigate('builds')}><BookOpen className="h-4 w-4" /> Open build orders</button>
          </div>
        </div>

        <div className="grid place-items-center border-t border-white/10 p-6 md:border-l md:border-t-0">
          <div className="text-center">
            <CivIcon name={latestCiv ?? ''} size="lg" />
            <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.14em] text-banner/90">Mission Progress</p>
            <p className="mt-1 text-3xl font-semibold text-parchment">{completedMissions}/{missions.length}</p>
            <p className="mt-1 text-xs text-vellum">{xp} total XP</p>
          </div>
        </div>

        <aside className="m-5 border-t-[3px] border-gold bg-[#161c20] p-5 md:col-span-2 xl:col-span-1 xl:ml-0">
          <div className="flex items-center gap-2 text-gold"><Brain className="h-4 w-4" /><span className="text-[9px] font-extrabold uppercase tracking-[0.14em]">Coach Evidence</span></div>
          <p className="mt-7 text-3xl font-bold text-ember">{games.length ? `${Math.round(games.slice(0, 10).reduce((sum, game) => sum + game.idleTcTime, 0) / Math.min(games.length, 10))} sec` : 'Ready'}</p>
          <p className="mt-2 text-xs leading-5 text-vellum">{games.length ? 'Average idle Town Centre time across your recent games.' : 'Patterns will appear here after your first logged game.'}</p>
          <button className="mt-8 flex items-center gap-2 text-xs font-bold text-gold" onClick={() => onNavigate('coach')}>Review the evidence <ArrowRight className="h-4 w-4" /></button>
        </aside>
      </section>

      <section className="dashboard-metrics grid border-x border-b border-white/10 bg-[#0e1316] sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Current Elo" value={currentElo?.toString() ?? 'No rating'} detail={peakElo ? `Peak ${peakElo}` : 'Ranked games only'} />
        <Metric label="Games Logged" value={games.length.toString()} detail={`${wins} wins · ${games.length - wins} losses`} />
        <Metric label="Recent Form" value={form} detail={games.length ? `${winRate}% overall win rate` : 'Awaiting first result'} />
        <Metric label="Mission Progress" value={`${completedMissions}/${missions.length}`} detail={activeMission ? `Next · ${activeMission.title}` : 'Starter path complete'} />
      </section>

      <section className="age-command-strip mt-4 grid border border-white/10 bg-[#101518] md:grid-cols-4">
        {ages.map((age, index) => {
          const ageSkills = skills.filter((skill) => skill.age === age);
          const completed = ageSkills.filter((skill) => skill.completed).length;
          const percentage = ageSkills.length ? Math.round((completed / ageSkills.length) * 100) : 0;
          const current = percentage < 100 && ages.slice(0, index).every((previousAge) => skills.filter((skill) => skill.age === previousAge).every((skill) => skill.completed));
          return (
            <button key={age} onClick={() => onNavigate('skills')} className={`grid min-h-[68px] grid-cols-[34px_1fr_34px] items-center gap-2 border-b border-white/10 px-4 text-left md:border-b-0 md:border-r ${current ? 'bg-banner/15 shadow-[inset_0_-2px_0_#983844]' : ''}`}>
              <span className="font-serif text-lg font-bold text-gold">{ageNumerals[index]}</span><span><small className="block text-[8px] font-extrabold uppercase tracking-[0.1em] text-vellum">{age}</small><b className="block truncate text-xs text-parchment">{completed}/{ageSkills.length} skills mastered</b></span><strong className={percentage === 100 ? 'text-moss' : current ? 'text-ember' : 'text-vellum'}>{percentage}</strong>
            </button>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">Ranked Trajectory</p><h2 className="mt-1 text-xl font-semibold text-parchment">Performance and match evidence</h2></div><span className="text-xs text-vellum">Ranked Elo only</span></div>
          {chartData.length ? (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="dashboardElo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d5ad57" stopOpacity={0.34} /><stop offset="100%" stopColor="#d5ad57" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#293136" vertical={false} /><XAxis dataKey="game" stroke="#737d82" tickLine={false} axisLine={false} /><YAxis stroke="#737d82" tickLine={false} axisLine={false} domain={['dataMin - 25', 'dataMax + 25']} /><Tooltip contentStyle={{ background: '#11171a', border: '1px solid #d5ad57', color: '#ece7dc' }} /><Area type="monotone" dataKey="elo" stroke="#d5ad57" strokeWidth={3} fill="url(#dashboardElo)" /></AreaChart></ResponsiveContainer>
            </div>
          ) : <EmptyPanel text="Log a ranked result with Elo to begin your performance timeline." action="Open game log" onClick={() => onNavigate('games')} />}
        </Card>

        <Card className="border-t-[3px] border-t-banner">
          <div className="flex items-center justify-between"><div><p className="section-kicker">Opening Plan</p><h2 className="mt-1 text-xl font-semibold text-parchment">{latestGame?.opening || 'Choose a repeatable opening'}</h2></div><Swords className="h-5 w-5 text-banner" /></div>
          <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
            <PlanStep index="01" title="Pick one civilisation" detail={latestCiv ?? 'Franks, Magyars, and Mongols have starter builds.'} />
            <PlanStep index="02" title="Train one mission" detail={activeMission?.title ?? 'Choose the smallest habit affecting your games.'} />
            <PlanStep index="03" title="Review one turning point" detail="Use the replay lab after the match." />
          </div>
          <button className="secondary-action mt-5 w-full justify-between" onClick={() => onNavigate('builds')}>View full build library <ArrowRight className="h-4 w-4" /></button>
        </Card>
      </section>

      <Card className="mt-5">
        <div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Training History</p><h2 className="mt-1 text-xl font-semibold text-parchment">Recent attempts</h2></div><button className="flex items-center gap-1 text-xs font-bold text-vellum hover:text-gold" onClick={() => onNavigate('games')}>View all matches <ArrowRight className="h-4 w-4" /></button></div>
        {games.length ? <div className="mt-4 divide-y divide-white/10 border-t border-white/10">{games.slice(0, 4).map((game) => <RecentGame key={game.id} game={game} />)}</div> : <EmptyPanel text="Your recent training attempts will appear here." action="Log first game" onClick={() => onNavigate('games')} />}
      </Card>
    </>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="min-w-0 border-b border-white/10 p-4 sm:border-r xl:border-b-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-vellum">{label}</p><p className="mt-2 truncate text-2xl font-semibold text-parchment">{value}</p><p className="mt-1 truncate text-[10px] text-moss">{detail}</p></div>;
}

function PlanStep({ index, title, detail }: { index: string; title: string; detail: string }) {
  return <div className="grid grid-cols-[32px_1fr] py-3"><span className="font-serif font-bold text-gold">{index}</span><div><p className="text-xs font-semibold text-parchment">{title}</p><p className="mt-1 text-[10px] text-vellum">{detail}</p></div></div>;
}

function RecentGame({ game }: { game: Game }) {
  return <div className="grid gap-3 py-3 sm:grid-cols-[52px_42px_1fr_140px_80px] sm:items-center"><span className={`text-[9px] font-extrabold ${game.result === 'Win' ? 'text-moss' : 'text-ember'}`}>{game.result.toUpperCase()}</span><CivIcon name={game.myCiv} size="sm" /><div><p className="text-sm font-semibold text-parchment">{game.myCiv} vs {game.opponentCiv}</p><p className="text-xs text-vellum">{game.map} · {game.opening}</p></div><div><p className="text-[8px] font-bold uppercase tracking-[0.1em] text-vellum">TC idle</p><p className="text-sm text-parchment">{game.idleTcTime}s</p></div><p className="text-right text-xs text-moss">{game.eloAfter ? `${game.eloAfter} Elo` : game.matchType ?? 'Practice'}</p></div>;
}

function EmptyPanel({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return <div className="mt-5 grid min-h-52 place-items-center border border-dashed border-white/15 bg-black/10 p-6 text-center"><div><TrendingUp className="mx-auto h-6 w-6 text-gold" /><p className="mt-3 text-sm text-vellum">{text}</p><button className="mt-4 text-xs font-bold text-gold" onClick={onClick}>{action} <ArrowRight className="ml-1 inline h-4 w-4" /></button></div></div>;
}
