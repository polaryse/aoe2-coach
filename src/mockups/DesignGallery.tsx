import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleDot,
  Crosshair,
  Crown,
  Flag,
  Gamepad2,
  Hexagon,
  Map,
  Medal,
  Menu,
  Play,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Upload,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const trendData = [
  { game: 'G1', elo: 1012, idle: 78 },
  { game: 'G2', elo: 1027, idle: 62 },
  { game: 'G3', elo: 1018, idle: 73 },
  { game: 'G4', elo: 1041, idle: 48 },
  { game: 'G5', elo: 1056, idle: 39 },
  { game: 'G6', elo: 1074, idle: 31 },
];

const concepts = [
  { id: 'observatory', number: '01', name: 'Tactical Observatory', note: 'Replay-first analysis' },
  { id: 'campaign', number: '02', name: 'Living Campaign', note: 'Progress as territory' },
  { id: 'tournament', number: '03', name: 'Tournament Desk', note: 'Competitive performance' },
  { id: 'manual', number: '04', name: 'Field Manual', note: 'Calm deliberate practice' },
  { id: 'command', number: '05', name: 'Command Hall', note: 'Civilization-led coaching' },
  { id: 'hybrid', number: '06', name: 'Coach Command', note: 'The refined hybrid' },
] as const;

type ConceptId = (typeof concepts)[number]['id'];

function Crest({ label, tone = 'blue', large = false }: { label: string; tone?: 'blue' | 'red' | 'gold' | 'green'; large?: boolean }) {
  return <span className={`mock-crest mock-crest-${tone} ${large ? 'mock-crest-large' : ''}`}><Shield /><b>{label}</b></span>;
}

function TinyTrend({ color = '#e9a23b', grid = '#283137' }: { color?: string; grid?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id={`trend-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.36} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="game" stroke="#778087" tickLine={false} axisLine={false} fontSize={10} />
        <YAxis stroke="#778087" tickLine={false} axisLine={false} fontSize={10} />
        <Tooltip contentStyle={{ background: '#11161a', border: `1px solid ${color}`, fontSize: 12 }} />
        <Area type="monotone" dataKey="elo" stroke={color} strokeWidth={3} fill={`url(#trend-${color.replace('#', '')})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ConceptPicker({ active, onChange }: { active: ConceptId; onChange: (id: ConceptId) => void }) {
  return (
    <div className="mock-picker">
      <div className="mock-picker-brand"><span>AoE2</span> Design Studies</div>
      <div className="mock-picker-tabs">
        {concepts.map((concept) => (
          <button key={concept.id} className={active === concept.id ? 'active' : ''} onClick={() => onChange(concept.id)}>
            <span>{concept.number}</span>
            <b>{concept.name}</b>
          </button>
        ))}
      </div>
      <span className="mock-picker-note">Interactive mockups</span>
    </div>
  );
}

function Observatory() {
  return (
    <div className="observatory mock-stage">
      <aside className="obs-rail">
        <div className="obs-mark"><Crosshair /></div>
        {[BarChart3, Activity, Swords, Target, BookOpen].map((Icon, index) => <button className={index === 0 ? 'active' : ''} key={index}><Icon /></button>)}
        <button className="obs-avatar">P</button>
      </aside>
      <main className="obs-main">
        <header className="obs-header">
          <div><span className="obs-kicker">Performance Centre</span><h1>Good morning, Polaryse.</h1><p>Your Castle transition is improving. Keep the next set focused.</p></div>
          <div className="obs-header-actions"><button><Upload /> Import Replay</button><button className="primary"><Play /> Start Training</button></div>
        </header>
        <section className="obs-metrics">
          <div><span>Current Elo</span><strong>1,074</strong><em>+62 this month</em></div>
          <div><span>Recent Form</span><strong>4–2</strong><em>67% win rate</em></div>
          <div><span>TC Discipline</span><strong>82</strong><em>+14 rating</em></div>
          <div><span>Training Level</span><strong>12</strong><em>340 XP to Captain</em></div>
        </section>
        <section className="obs-workspace">
          <div className="obs-chart-panel">
            <div className="panel-heading"><div><span>Ranked trajectory</span><h2>Performance trend</h2></div><div className="segmented"><button className="active">Elo</button><button>TC idle</button><button>Win rate</button></div></div>
            <div className="obs-chart"><TinyTrend /></div>
            <div className="obs-timeline">
              <span>Match timeline</span>
              <div className="timeline-track"><i className="dark">Dark<br /><b>10:21</b></i><i className="feudal">Feudal<br /><b>21:44</b></i><i className="castle">Castle<br /><b>34:10</b></i><i className="imperial">Imperial</i></div>
            </div>
          </div>
          <aside className="obs-coach">
            <div className="coach-label"><Brain /> Coach priority <span>HIGH IMPACT</span></div>
            <h2>Protect villager production during fights.</h2>
            <p>Your idle TC drops below 35 seconds until the first engagement, then doubles during military control.</p>
            <div className="obs-evidence"><span>Evidence</span><b>+46 sec</b><small>idle TC from 18:00–23:00</small></div>
            <div className="obs-goal"><Check /><div><b>Next-game success</b><span>Under 20 sec TC idle during first two fights</span></div></div>
            <button className="obs-coach-button">Begin 3-game block <ArrowRight /></button>
          </aside>
        </section>
        <section className="obs-recent">
          <div className="panel-heading"><div><span>Last six games</span><h2>Recent matches</h2></div><button>View all <ChevronRight /></button></div>
          {[['W','FR','Franks','Arabia','21:44','+16'],['L','MA','Magyars','Runestones','22:18','-9'],['W','MO','Mongols','Arabia','20:57','+14']].map((row) => <div className="obs-match" key={row[2]}><b className={row[0] === 'W' ? 'win' : 'loss'}>{row[0]}</b><Crest label={row[1]} tone={row[0] === 'W' ? 'blue' : 'red'} /><strong>{row[2]}</strong><span>{row[3]}</span><span>Castle {row[4]}</span><em>{row[5]}</em><ChevronRight /></div>)}
        </section>
      </main>
    </div>
  );
}

function Campaign() {
  return (
    <div className="campaign mock-stage">
      <header className="camp-header"><div className="camp-brand"><Map /> <b>AoE2 Coach</b><span>The Ranked Campaign</span></div><nav><button className="active">Campaign</button><button>War Log</button><button>Library</button></nav><div className="camp-level"><Trophy /> Level 12 <b>2,660 XP</b></div></header>
      <main className="camp-main">
        <div className="camp-intro"><span>CHAPTER III · CASTLE AGE</span><h1>Build an economy that survives the fight.</h1><p>Complete two more field objectives to unlock Imperial Strategy.</p></div>
        <div className="camp-record"><span>Campaign record</span><div><b>1,074</b><small>Elo</small></div><div><b>4–2</b><small>Form</small></div><div><b>68%</b><small>Mastery</small></div></div>
        <section className="camp-map">
          <div className="terrain terrain-one" /><div className="terrain terrain-two" /><div className="camp-route" />
          <div className="camp-age age-dark"><span>I</span><b>Dark Age</b><small>Mastered</small></div>
          <div className="camp-node node-one complete"><Check /><span>TC Rhythm</span></div>
          <div className="camp-age age-feudal"><span>II</span><b>Feudal Age</b><small>3 / 4 mastered</small></div>
          <div className="camp-node node-two complete"><Check /><span>Scout the opening</span></div>
          <div className="camp-age age-castle active"><span>III</span><b>Castle Age</b><small>Current chapter</small></div>
          <div className="camp-node node-three active"><Flag /><span>Fight without forgetting eco</span><em>ACTIVE QUEST</em></div>
          <div className="camp-node node-four"><Hexagon /><span>Two-TC boom</span></div>
          <div className="camp-age age-imp locked"><span>IV</span><b>Imperial Age</b><small>Locked</small></div>
        </section>
        <section className="camp-quest">
          <div className="camp-quest-mark"><Flag /></div><div><span>TODAY'S FIELD OBJECTIVE</span><h2>Queue villagers through every fight</h2><p>Keep total TC idle under 20 seconds during your first two military engagements.</p></div>
          <div className="camp-quest-progress"><span>Campaign attempts</span><div><i className="done" /><i className="done" /><i /><i /><i /></div><b>2 of 3 passes</b></div>
          <button>Continue quest <ArrowRight /></button>
        </section>
      </main>
    </div>
  );
}

function Tournament() {
  return (
    <div className="tournament mock-stage">
      <header className="tour-header"><div className="tour-logo"><span>A2</span><b>COACH</b></div><nav><button className="active">OVERVIEW</button><button>MATCHES</button><button>ANALYSIS</button><button>TRAINING</button><button>PLAYBOOK</button></nav><div className="tour-actions"><Search /><button><Upload /> IMPORT</button><span>P</span></div></header>
      <section className="tour-matchup"><div><i className="live" /> ACTIVE TRAINING BLOCK</div><span>FOCUS</span><b>Villager production during fights</b><em>GAME 2 OF 3</em><button>END BLOCK</button></section>
      <main className="tour-main">
        <div className="tour-title"><div><span>PLAYER PERFORMANCE</span><h1>Ranked Overview</h1></div><div className="tour-range"><button>7D</button><button className="active">30D</button><button>ALL</button></div></div>
        <section className="tour-hero">
          <div className="tour-rating"><span>1V1 RATING</span><strong>1,074</strong><em><TrendingUp /> +62</em><small>Peak 1,091 · Top 43%</small></div>
          <div className="tour-chart"><TinyTrend color="#18b7d4" grid="#292d33" /></div>
          <div className="tour-verdict"><span><Brain /> COACH VERDICT</span><h2>Feudal macro is your limiting factor.</h2><p>Good openings are being undone when military pressure begins.</p><button>VIEW EVIDENCE <ArrowRight /></button></div>
        </section>
        <section className="tour-domains">
          {[['ECONOMY','74','+6','#18b7d4'],['MILITARY','61','-2','#e0524d'],['SCOUTING','82','+9','#d6a74a'],['DECISIONS','69','+3','#8ebf66']].map(([name,value,change,color]) => <div key={name}><span>{name}</span><strong>{value}</strong><em>{change}</em><div><i style={{width:`${value}%`,background:color}} /></div></div>)}
        </section>
        <section className="tour-lower">
          <div className="tour-results"><div className="tour-section-title"><b>RECENT RESULTS</b><button>VIEW ALL</button></div>
            {[['WIN','FR','Franks','VS','BY','Byzantines','Arabia','+16'],['LOSS','MA','Magyars','VS','BR','Britons','Runestones','-9'],['WIN','MO','Mongols','VS','PE','Persians','Arabia','+14']].map((r) => <div className="tour-row" key={r[1]+r[4]}><b className={r[0].toLowerCase()}>{r[0]}</b><Crest label={r[1]} tone="blue" /><strong>{r[2]}</strong><span>{r[3]}</span><Crest label={r[4]} tone="red" /><strong>{r[5]}</strong><small>{r[6]}</small><em>{r[7]}</em></div>)}
          </div>
          <div className="tour-training"><div className="tour-section-title"><b>ACTIVE DRILL</b><span>2/3 PASSES</span></div><Target /><h2>Fight without forgetting eco</h2><p>Queue villagers during the first two engagements.</p><div className="tour-attempts"><i className="pass">PASS</i><i className="pass">PASS</i><i>NEXT</i></div><button>LOG NEXT ATTEMPT</button></div>
        </section>
      </main>
    </div>
  );
}

function FieldManual() {
  return (
    <div className="manual mock-stage">
      <aside className="manual-rail"><div className="manual-monogram">A</div><button className="active"><BookOpen /></button><button><Target /></button><button><BarChart3 /></button><button><Swords /></button><button><Flag /></button><span>12</span></aside>
      <main className="manual-main">
        <header className="manual-header"><div><span>AOE2 COACH · FIELD MANUAL</span><h1>Today’s training session</h1><p>Thursday, 25 September · Approximately 35 minutes</p></div><button><Menu /> Browse curriculum</button></header>
        <div className="manual-rule"><span>SESSION 07</span><i /><b>CASTLE AGE FUNDAMENTALS</b></div>
        <section className="manual-layout">
          <article className="manual-lesson">
            <span className="manual-chapter">ONE HABIT · THREE GAMES</span>
            <h2>Keep your town centre working while your army fights.</h2>
            <p className="manual-lead">The aim today is not to win every battle. It is to make military control and villager production happen at the same time.</p>
            <div className="manual-brief"><div><CircleDot /><span>Success condition</span></div><b>Less than 20 seconds of TC idle during your first two fights.</b></div>
            <div className="manual-plan-title"><span>Your practice plan</span><em>20–30 min</em></div>
            <ol className="manual-plan">
              <li><span>01</span><div><b>Warm up the rhythm</b><p>Open a skirmish and practise select-TC, queue-villager, return-to-army for five minutes.</p></div><em>5 min</em></li>
              <li><span>02</span><div><b>Play a focused ranked game</b><p>Use Franks scouts into knights. Judge the game only by today’s success condition.</p></div><em>20 min</em></li>
              <li><span>03</span><div><b>Review one turning point</b><p>Import the replay and inspect TC idle around the first two engagements.</p></div><em>5 min</em></li>
            </ol>
            <button className="manual-start"><Play /> Begin training session</button>
          </article>
          <aside className="manual-notes">
            <div className="manual-progress"><span>CURRICULUM PROGRESS</span><strong>68%</strong><div><i /></div><small>Castle Age · Lesson 7 of 12</small></div>
            <div className="manual-note"><span>WHY THIS LESSON?</span><p>Across your last six matches, TC idle increased by <b>46 seconds</b> after the first military engagement.</p><button>See match evidence <ArrowRight /></button></div>
            <div className="manual-build"><span>TODAY'S BUILD</span><div><Crest label="FR" tone="red" /><div><b>Franks</b><p>20-pop Scouts into Knights</p></div></div><small>A forgiving cavalry plan that leaves attention for macro practice.</small></div>
            <blockquote>“One clean habit, repeated under pressure, is worth more than five new build orders.”<span>Coach’s note</span></blockquote>
          </aside>
        </section>
      </main>
    </div>
  );
}

function CommandHall() {
  return (
    <div className="command-hall mock-stage">
      <aside className="hall-rail"><div className="hall-mark"><Crown /></div>{[Gamepad2, Brain, Target, Swords, Users].map((Icon,index)=><button className={index===0?'active':''} key={index}><Icon /></button>)}<button className="hall-menu"><Menu /></button></aside>
      <main className="hall-main">
        <header className="hall-header"><div><span>TRAINING CIVILIZATION</span><h1>Franks</h1><p>Cavalry · Western Europe</p></div><nav><button className="active">Command</button><button>Matchups</button><button>Builds</button><button>Mastery</button></nav><div className="hall-profile">Level 12 <span>P</span></div></header>
        <section className="hall-identity">
          <div className="hall-crest"><Crest label="FR" tone="red" large /></div>
          <div className="hall-plan"><span>NEXT MATCH COMMAND</span><h2>Own the map with Scouts.<br />Arrive in Castle ready for Knights.</h2><div className="hall-tags"><span>20 POP SCOUTS</span><span>ARABIA</span><span>3-GAME BLOCK</span></div></div>
          <div className="hall-record"><span>WITH FRANKS</span><strong>58%</strong><p>win rate · 24 games</p><div><b>1,112</b><small>Best Elo</small></div></div>
        </section>
        <section className="hall-ages">
          {[['I','DARK AGE','Clean opening','100%'],['II','FEUDAL AGE','Scout control','72%'],['III','CASTLE AGE','Knight production','48%'],['IV','IMPERIAL AGE','Army composition','22%']].map((age,index)=><div className={index===2?'active':''} key={age[1]}><span>{age[0]}</span><section><small>{age[1]}</small><b>{age[2]}</b><i><em style={{width:age[3]}} /></i></section><strong>{age[3]}</strong></div>)}
        </section>
        <section className="hall-grid">
          <div className="hall-mission"><div className="hall-section-label"><Flag /> ACTIVE MISSION <span>+130 XP</span></div><h2>Fight without forgetting your economy.</h2><p>Keep TC idle below 20 seconds during the first two military engagements.</p><div className="hall-checks"><span><Check /> Select TC hotkey ready</span><span><Check /> Villager queue audible</span><span>○ Review after match</span></div><button>Start ranked set <ArrowRight /></button></div>
          <div className="hall-build"><div className="hall-section-label"><Swords /> OPENING PLAN <button>VIEW FULL BUILD</button></div><div className="hall-build-flow"><span><b>6</b>Sheep</span><i /><span><b>10</b>Wood</span><i /><span><b>16</b>Click Feudal</span><i /><span><b>20</b>Stable</span><i /><span><b>3–5</b>Scouts</span></div><div className="hall-warning"><Timer /><div><b>Castle target</b><span>21:30 – 22:30 with two stables prepared</span></div></div></div>
          <div className="hall-trend"><div className="hall-section-label"><TrendingUp /> FRANKS PERFORMANCE <span>LAST 6</span></div><div><TinyTrend color="#d5ad57" grid="#34272b" /></div></div>
        </section>
      </main>
    </div>
  );
}

function CoachCommand() {
  return (
    <div className="coach-command mock-stage">
      <aside className="cc-rail">
        <div className="cc-mark"><Crosshair /></div>
        <span className="cc-rail-label">TRAIN</span>
        {[BarChart3, Activity, Brain, Target].map((Icon, index) => <button className={index === 0 ? 'active' : ''} key={`train-${index}`}><Icon /></button>)}
        <span className="cc-rail-label">LEARN</span>
        {[Swords, Flag, BookOpen].map((Icon, index) => <button key={`learn-${index}`}><Icon /></button>)}
        <button className="cc-profile">P</button>
      </aside>

      <main className="cc-main">
        <header className="cc-header">
          <div className="cc-brand"><span>A2</span><div><b>AoE2 Coach</b><small>Ranked improvement centre</small></div></div>
          <nav><button className="active">Command</button><button>Matches</button><button>Replay Lab</button><button>Progress</button></nav>
          <div className="cc-actions"><button className="quiet"><Upload /> Import replay</button><button className="cc-avatar">P</button></div>
        </header>

        <section className="cc-context">
          <div className="cc-civ"><Crest label="FR" tone="red" /><div><span>TRAINING CIVILISATION</span><b>Franks</b><small>20-pop Scouts into Knights</small></div><button>Change <ChevronRight /></button></div>
          <div className="cc-session"><i /> TRAINING BLOCK ACTIVE <b>Game 2 of 3</b></div>
          <div className="cc-level"><Medal /><span>Castle Commander</span><b>Level 12</b></div>
        </section>

        <section className="cc-hero">
          <div className="cc-briefing">
            <span className="cc-eyebrow"><Sparkles /> NEXT MATCH COMMAND</span>
            <h1>Win the fight.<br /><em>Keep the Town Centre working.</em></h1>
            <p>Your opening is stable. Today’s gains will come from holding your economy together once military control gets demanding.</p>
            <div className="cc-success"><Check /><div><span>SUCCESS CONDITION</span><b>Under 20 seconds TC idle during the first two fights</b></div></div>
            <div className="cc-hero-actions"><button className="primary"><Play /> Start next game</button><button><BookOpen /> Open build order</button></div>
          </div>
          <div className="cc-civ-sigil"><Crest label="FR" tone="red" large /><div><span>FRANKS MASTERY</span><b>72%</b><small>Strong opening · developing Castle macro</small></div></div>
          <aside className="cc-coach-note">
            <div><Brain /><span>COACH EVIDENCE</span><em>HIGH IMPACT</em></div>
            <strong>+46 sec</strong><p>Average TC idle added after your first military engagement.</p>
            <button>Review the evidence <ArrowRight /></button>
          </aside>
        </section>

        <section className="cc-metrics">
          <div><span>Current Elo</span><strong>1,074</strong><em>+62 this month</em></div>
          <div><span>Franks record</span><strong>14–10</strong><em>58% win rate</em></div>
          <div><span>Recent form</span><strong>W W L W</strong><em>3-game momentum</em></div>
          <div><span>Mission progress</span><strong>2 / 3</strong><em>One pass remaining</em></div>
        </section>

        <section className="cc-ages">
          <div className="complete"><span>I</span><section><small>DARK AGE</small><b>Opening rhythm</b></section><strong>92</strong></div>
          <div className="complete"><span>II</span><section><small>FEUDAL AGE</small><b>Scout pressure</b></section><strong>78</strong></div>
          <div className="active"><span>III</span><section><small>CASTLE AGE · CURRENT FOCUS</small><b>Production under pressure</b></section><strong>61</strong></div>
          <div><span>IV</span><section><small>IMPERIAL AGE</small><b>Army composition</b></section><strong>43</strong></div>
        </section>

        <section className="cc-workspace">
          <div className="cc-performance">
            <div className="cc-section-heading"><div><span>RANKED TRAJECTORY</span><h2>Performance and match evidence</h2></div><div className="segmented"><button className="active">Elo</button><button>TC idle</button><button>Age times</button></div></div>
            <div className="cc-chart"><TinyTrend color="#d5ad57" grid="#293136" /></div>
            <div className="cc-match-axis">
              <span className="dark"><small>DARK</small><b>0:00</b></span><span className="feudal"><small>FEUDAL</small><b>10:21</b></span>
              <span className="fight"><Swords /><small>FIRST FIGHT</small><b>15:48</b></span><span className="castle"><small>CASTLE</small><b>21:44</b></span>
              <span className="second-fight"><Swords /><small>SECOND FIGHT</small><b>25:10</b></span>
            </div>
          </div>

          <aside className="cc-plan">
            <div className="cc-section-heading"><div><span>OPENING PLAN</span><h2>Scouts into Knights</h2></div><Crest label="FR" tone="red" /></div>
            <div className="cc-build-steps">
              <div><span>01</span><b>6 on sheep</b><small>Keep TC cycling</small></div><div><span>02</span><b>Click at 20 pop</b><small>Stable on arrival</small></div>
              <div><span>03</span><b>Make 3–5 scouts</b><small>Pressure, don’t dive</small></div><div><span>04</span><b>Castle by 22:30</b><small>Two stables ready</small></div>
            </div>
            <button>View full build <ArrowRight /></button>
          </aside>
        </section>

        <section className="cc-recent">
          <div className="cc-section-heading"><div><span>TRAINING BLOCK</span><h2>Recent attempts</h2></div><button>View all matches <ChevronRight /></button></div>
          <div className="cc-attempts">
            <article><span className="pass">PASS</span><Crest label="FR" tone="red" /><div><b>Franks vs Byzantines</b><small>Arabia · Victory</small></div><section><small>TC IDLE IN FIGHTS</small><b>16 sec</b></section><em>+16 Elo</em></article>
            <article><span className="miss">MISS</span><Crest label="FR" tone="red" /><div><b>Franks vs Britons</b><small>Runestones · Defeat</small></div><section><small>TC IDLE IN FIGHTS</small><b>31 sec</b></section><em>−9 Elo</em></article>
            <article className="next"><span>NEXT</span><div><b>One more focused game</b><small>Complete the block to receive your coach review.</small></div><button><Play /> Start game</button></article>
          </div>
        </section>
      </main>
    </div>
  );
}

export function DesignGallery() {
  const initial = useMemo(() => {
    const requested = new URLSearchParams(window.location.search).get('concept');
    return concepts.some((concept) => concept.id === requested) ? requested as ConceptId : 'observatory';
  }, []);
  const [active, setActive] = useState<ConceptId>(initial);

  const changeConcept = (id: ConceptId) => {
    setActive(id);
    const params = new URLSearchParams(window.location.search);
    params.set('mockups', '1');
    params.set('concept', id);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="mock-gallery">
      <ConceptPicker active={active} onChange={changeConcept} />
      {active === 'observatory' && <Observatory />}
      {active === 'campaign' && <Campaign />}
      {active === 'tournament' && <Tournament />}
      {active === 'manual' && <FieldManual />}
      {active === 'command' && <CommandHall />}
      {active === 'hybrid' && <CoachCommand />}
    </div>
  );
}
