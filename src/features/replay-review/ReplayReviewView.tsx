import { Flag, Target, Trash2, Upload } from 'lucide-react';
import { Component } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Card } from '../../components/Card';
import { EraBadge, RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import { analyseReplayFile, type CaptureAgeAnalysis } from '../../lib/captureAge';
import { getReplayCoachGoals } from '../coach/replayGoals';
import { createId } from '../../lib/storage';
import type { IdleTcStats, Mission, PlayerIdentity, ReplayCoachGoal, ReplayReview, TimelineEvent } from '../../types';

interface ReplayReviewViewProps {
  reviews: ReplayReview[];
  onReviewsChange: (reviews: ReplayReview[]) => void;
  onAddMissions: (missions: Mission[]) => void;
}

export function ReplayReviewView({ reviews, onReviewsChange, onAddMissions }: ReplayReviewViewProps) {
  const [analysis, setAnalysis] = useState<CaptureAgeAnalysis | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [transitionTimes, setTransitionTimes] = useState<Record<string, string>>({});
  const [idleTcOverrides, setIdleTcOverrides] = useState<Record<string, string>>({});
  const [coachedPlayerId, setCoachedPlayerId] = useState('');
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replayPathHint = getReplayPathHint();
  const analysisPlayers = ensureArray<PlayerIdentity>(analysis?.players);
  const analysisEvents = sanitizeTimelineEvents(ensureArray<TimelineEvent>(analysis?.events));
  const analysisIdleTcStats = ensureArray<IdleTcStats>(analysis?.idleTcStats);
  const analysisParserNotes = ensureArray<string>(analysis?.parserNotes);
  const analysisCoachingNotes = ensureArray<string>(analysis?.coachingNotes);
  const analysisResourceStats = ensureArray<CaptureAgeAnalysis['resourceStats'][number]>(analysis?.resourceStats);
  const displayedIdleTcStats = analysis ? applyIdleTcOverrides(analysisIdleTcStats, analysisPlayers, idleTcOverrides) : [];
  const displayedEvents = analysis ? sanitizeTimelineEvents(applyTransitionTimes(mergeIdleTcEvent(analysisEvents, displayedIdleTcStats), transitionTimes)) : [];
  const coachingGoals = analysis ? getReplayCoachGoals({
    players: analysisPlayers,
    events: displayedEvents,
    idleTcStats: displayedIdleTcStats,
    resourceStats: analysisResourceStats,
  }, coachedPlayerId) : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const review: ReplayReview = {
      id: createId('review'),
      date: new Date().toISOString().slice(0, 10),
      lostControlMinute: String(data.get('lostControlMinute')),
      cause: String(data.get('cause')),
      category: data.get('category') as ReplayReview['category'],
      nextGameMission: String(data.get('nextGameMission')),
      sourceFileName: analysis?.fileName,
      sourceType: analysis?.sourceType,
      parserConfidence: analysis?.parserConfidence,
      parserNotes: analysis?.parserNotes,
      players: analysisPlayers.length ? analysisPlayers : analysis?.players,
      coachedPlayerId,
      coachingGoals,
      timelineEvents: displayedEvents.length ? displayedEvents : analysis?.events,
      coachingNotes: analysis?.coachingNotes,
      resourceStats: analysis?.resourceStats,
      idleTcStats: displayedIdleTcStats.length ? displayedIdleTcStats : analysis?.idleTcStats,
    };
    onReviewsChange([review, ...reviews]);
    if (coachingGoals.length) {
      onAddMissions(coachingGoals.map((goal) => ({
        id: `replay-${goal.id}`,
        title: goal.title,
        description: goal.diagnosis,
        passCriteria: goal.mission,
        successMetric: goal.successMetric,
        targetCount: 2,
        xp: goal.priority === 'Primary' ? 150 : goal.priority === 'Secondary' ? 120 : 80,
        category: goal.category,
        completed: false,
      })));
    }
    event.currentTarget.reset();
    setAnalysis(null);
    setIdleTcOverrides({});
  }

  async function handleCaptureAgeUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
      setUploadError('');
      setAnalysis(null);
      setTransitionTimes({});
      setIdleTcOverrides({});
      setCoachedPlayerId('');
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      if (!buffer.byteLength) {
        setUploadError('That file looks empty. Try another AoE2 recording, CaptureAge recording, or timeline export.');
        return;
      }
      const nextAnalysis = await analyseReplayFile(file.name, buffer);
      setAnalysis(nextAnalysis);
      setTransitionTimes({});
      setIdleTcOverrides({});
      setCoachedPlayerId(nextAnalysis.players.find((player) => !player.isAi)?.id ?? nextAnalysis.players[0]?.id ?? '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error';
      setUploadError(`Could not read that file locally. ${message}`);
    } finally {
      event.target.value = '';
    }
  }

  function handleDeleteReview(reviewId: string) {
    const confirmed = window.confirm('Delete this replay review? This only removes it from this browser.');
    if (!confirmed) return;
    onReviewsChange(reviews.filter((review) => review.id !== reviewId));
  }

  return (
    <>
      <SectionHeader eyebrow="Replay Review" title="Find the Turning Point" description="Upload local timeline data, review the key moments, and save one practical next-game mission." />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="mb-5 rounded border border-gold/25 bg-[#0f0b08]/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <EraBadge tone="blue">Replay ingest</EraBadge>
                <p className="mt-2 text-sm text-vellum">
                  Upload a local .aoe2record, .caderec, or readable timeline export. AoE2 DE usually stores recorded games in {replayPathHint}.
                </p>
                <p className="mt-1 text-sm text-vellum">CaptureAge files may also live in C:\Users\you\AppData\Roaming\CaptureAge\Vault. The parser extracts age-up, economy, scouting, raid, fight, and stat signals where available.</p>
              </div>
              <button className="action inline-flex items-center gap-2" type="button" onClick={() => uploadInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload file
              </button>
              <input ref={uploadInputRef} type="file" accept=".aoe2record,.caderec,.json,.csv,.txt,.log" className="hidden" onChange={handleCaptureAgeUpload} />
            </div>
            {uploadError && <p className="mt-3 text-sm text-ember">{uploadError}</p>}
          </div>

          {analysis && (
            <div className="mb-5 rounded border border-gold/25 bg-banner/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Extracted from {analysis.fileName}</p>
                  <h2 className="mt-2 font-display text-2xl text-parchment">
                    {analysis.parserConfidence === 'Low' ? 'Review checkpoint' : 'Likely control loss'}: {analysis.likelyLostControlMinute || 'Detected event order'}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RewardPill>{analysisEvents.length} timeline signals</RewardPill>
                  <RewardPill>{analysis.parserConfidence} confidence</RewardPill>
                </div>
              </div>
              <p className="mt-3 text-sm text-vellum">{analysis.parserConfidence === 'Low' ? 'This upload produced low-confidence signals. Use the extracted facts below as prompts, then confirm the turning point manually.' : analysis.likelyCause}</p>
              <PlayerPanel players={analysisPlayers} />
              <ReplayCoachingPlan
                players={analysisPlayers}
                coachedPlayerId={coachedPlayerId}
                onPlayerChange={setCoachedPlayerId}
                goals={coachingGoals}
              />
              <AnalysisPanelBoundary key={analysis.fileName}>
                <div className="mt-3 space-y-2">
                  {analysisParserNotes.map((note) => (
                    <p key={note} className="text-xs text-vellum">{note}</p>
                  ))}
                </div>
                <div className="mt-4">
                  <AgeTransitionTimes events={analysisEvents} values={transitionTimes} onChange={setTransitionTimes} />
                  <IdleTcEditor players={analysisPlayers} stats={analysisIdleTcStats} values={idleTcOverrides} onChange={setIdleTcOverrides} />
                  {displayedEvents.length > 0 && (
                    <ReplayTimeline events={displayedEvents} players={analysisPlayers} />
                  )}
                </div>
                <IdleTcStatsTable stats={displayedIdleTcStats} />
                <ResourceStatsTable stats={analysisResourceStats} />
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Possible coaching causes</p>
                  {analysisCoachingNotes.map((note) => (
                    <div key={note} className="rounded border border-gold/20 bg-[#0f0b08]/40 p-3 text-sm text-parchment">{note}</div>
                  ))}
                </div>
              </AnalysisPanelBoundary>
              <div className="mt-4 rounded border border-gold/15 bg-[#0f0b08]/30 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">30-second replay check</p>
                <p className="mt-2 text-sm text-vellum">Before saving, verify: was your TC producing, were resources floating, did you see the enemy army, were upgrades in, and where was your army?</p>
              </div>
            </div>
          )}

          <form key={`${analysis?.fileName ?? 'manual-review'}-${coachedPlayerId}`} onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="label">What minute did I lose control?</span>
              <input name="lostControlMinute" className="field" placeholder="14:30" defaultValue={analysis?.likelyLostControlMinute ?? ''} required />
            </label>
            <label>
              <span className="label">What caused it?</span>
              <textarea name="cause" className="field min-h-24" defaultValue={analysis?.likelyCause ?? ''} required />
            </label>
            <label>
              <span className="label">Category</span>
              <select name="category" className="field" defaultValue={analysis?.category ?? 'Macro'}>
                <option>Macro</option>
                <option>Micro</option>
                <option>Scouting</option>
                <option>Decision-making</option>
              </select>
            </label>
            <label>
              <span className="label">Next-game mission</span>
              <textarea name="nextGameMission" className="field min-h-24" defaultValue={coachingGoals[0]?.mission ?? analysis?.nextGameMission ?? ''} required />
            </label>
            <button className="action" type="submit">Save replay review</button>
          </form>
        </Card>

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-parchment">Lost control at {review.lostControlMinute}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-gold/30 bg-banner/60 px-3 py-1 text-sm text-parchment">{review.category}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(review.id)}
                    className="inline-flex items-center gap-1.5 rounded border border-ember/30 bg-ember/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-ember transition hover:border-ember hover:bg-ember/20"
                    aria-label={`Delete replay review from ${review.date}`}
                    title="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-stone-300"><strong>Cause:</strong> {review.cause}</p>
              <p className="mt-2 text-sm text-stone-300"><strong>Next mission:</strong> {review.nextGameMission}</p>
              {review.sourceFileName && (
                <p className="mt-2 text-sm text-vellum">
                  <strong>Source:</strong> {review.sourceFileName}
                  {review.parserConfidence ? ` / ${review.parserConfidence} confidence` : ''}
                </p>
              )}
              {review.players && review.players.length > 0 && <PlayerPanel players={review.players} compact />}
              {review.timelineEvents && review.timelineEvents.length > 0 && (
                <div className="mt-4">
                  <ReplayTimeline events={review.timelineEvents} players={review.players ?? []} compact />
                </div>
              )}
              {review.idleTcStats && review.idleTcStats.length > 0 && <IdleTcStatsTable stats={review.idleTcStats} compact />}
              {review.resourceStats && review.resourceStats.length > 0 && <ResourceStatsTable stats={review.resourceStats} compact />}
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">{review.date}</p>
            </Card>
          ))}
          {!reviews.length && <Card className="border-dashed text-vellum">No replay reviews yet.</Card>}
        </div>
      </div>
    </>
  );
}

class AnalysisPanelBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-4 rounded border border-ember/30 bg-ember/10 p-4 text-sm text-parchment">
          The file uploaded, but one replay visualization failed to render. Save the manual review fields below, or try another replay while the parser is being improved.
        </div>
      );
    }

    return this.props.children;
  }
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function sanitizeTimelineEvents(events: TimelineEvent[]) {
  const categories: TimelineEvent['category'][] = ['Macro', 'Micro', 'Scouting', 'Decision-making'];
  const severities: TimelineEvent['severity'][] = ['Info', 'Warning', 'Critical'];

  return events
    .filter((event) => event && typeof event === 'object')
    .map((event) => ({
      minute: typeof event.minute === 'string' && event.minute.trim() ? event.minute : 'Unknown',
      label: typeof event.label === 'string' && event.label.trim() ? event.label : 'Replay Signal',
      detail: typeof event.detail === 'string' ? event.detail : undefined,
      playerId: typeof event.playerId === 'string' ? event.playerId : undefined,
      playerName: typeof event.playerName === 'string' ? event.playerName : undefined,
      category: categories.includes(event.category) ? event.category : 'Decision-making',
      severity: severities.includes(event.severity) ? event.severity : 'Info',
    }));
}

function AgeTransitionTimes({
  events,
  values,
  onChange,
}: {
  events: TimelineEvent[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const transitions = events.filter((event) => /^(Feudal|Castle|Imperial) Age Transition$/i.test(event.label));
  if (!transitions.length) return null;
  const hasUnknownTimes = transitions.some((event) => !isClockTime(event.minute));

  return (
    <div className="mb-4 rounded border border-[#8a6733] bg-[#d8bd83] p-3 text-[#2a1b10]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b301f]">Age Transition Times</p>
          <p className="mt-1 text-sm text-[#5a4026]">
            {hasUnknownTimes ? 'Add a time only where this replay did not expose an exact age-up timestamp.' : 'Exact timestamps decoded from the replay operation stream.'}
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {transitions.map((event, index) => {
          const key = getTransitionKey(event, index);
          return (
            <label key={key} className="grid gap-1 rounded border border-[#8a6733] bg-[#f0dfb3] p-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b301f]">{event.playerName ?? `Player ${event.playerId ?? '?'}`} / {event.label}</span>
              {isClockTime(event.minute) ? (
                <span className="font-display text-lg font-semibold text-[#2a1b10]">{event.minute}</span>
              ) : (
                <input
                  className="rounded border border-[#8a6733] bg-[#fff3c9] px-2 py-1 text-sm text-[#2a1b10] outline-none focus:ring-2 focus:ring-[#6b301f]/30"
                  placeholder="12:30"
                  value={values[key] ?? ''}
                  onChange={(inputEvent) => onChange({ ...values, [key]: inputEvent.target.value })}
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function applyTransitionTimes(events: TimelineEvent[], values: Record<string, string>) {
  return events.map((event, index) => {
    const key = getTransitionKey(event, index);
    const value = values[key];
    if (!value || !isClockTime(value)) return event;
    return {
      ...event,
      minute: normalizeClockTime(value),
      detail: event.detail ? `${event.detail} / Manual time: ${normalizeClockTime(value)}` : 'Manual transition time entered.',
    };
  });
}

function IdleTcEditor({
  players,
  stats,
  values,
  onChange,
}: {
  players: PlayerIdentity[];
  stats: IdleTcStats[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const editablePlayers = getIdleTcEditablePlayers(players, stats);
  if (!editablePlayers.length) return null;

  return (
    <div className="mb-4 rounded border border-[#8a6733] bg-[#d8bd83] p-3 text-[#2a1b10]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b301f]">Idle TC Time</p>
        <p className="mt-1 text-sm text-[#5a4026]">Enter idle Town Center time per player when the replay does not expose the total automatically.</p>
      </div>
      <div className="mt-3 grid gap-3">
        {editablePlayers.map((player) => {
          const key = getIdleTcKey(player);
          const existing = stats.find((stat) => getIdleTcKey(stat) === key);
          const rowValues = idleTcAgeNames.map((age) => parseDuration(values[getIdleTcAgeKey(key, age)]) ?? getIdleTcAgeSeconds(existing ?? player, age));
          const rowTotal = rowValues.reduce((sum, seconds) => sum + seconds, 0);
          return (
            <div key={key} className="rounded border border-[#8a6733] bg-[#f0dfb3] p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b301f]">{player.player}</span>
                <span className="rounded border border-[#8a6733] bg-[#d8bd83] px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#6b301f]">
                  Total {formatDuration(rowTotal)}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                {idleTcAgeNames.map((age) => (
                  <label key={age} className="grid gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6b301f]">{age.replace(' Age', '')}</span>
                    <input
                      className="rounded border border-[#8a6733] bg-[#fff3c9] px-2 py-1 text-sm text-[#2a1b10] outline-none focus:ring-2 focus:ring-[#6b301f]/30"
                      placeholder={formatDuration(getIdleTcAgeSeconds(existing ?? player, age))}
                      value={values[getIdleTcAgeKey(key, age)] ?? ''}
                      onChange={(inputEvent) => onChange({ ...values, [getIdleTcAgeKey(key, age)]: inputEvent.target.value })}
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function applyIdleTcOverrides(stats: IdleTcStats[], players: PlayerIdentity[], values: Record<string, string>): IdleTcStats[] {
  const merged = new Map<string, IdleTcStats>();

  for (const stat of stats) {
    merged.set(getIdleTcKey(stat), normalizeIdleTcStat(stat));
  }

  for (const player of players) {
    const key = player.id;
    const existing = merged.get(key);
    const byAge = getIdleTcByAgeFromValues(key, values, existing);
    if (!byAge) continue;
    merged.set(key, {
      player: player.name,
      playerId: player.id,
      seconds: sumIdleTcByAge(byAge),
      byAge,
    });
  }

  for (const key of Object.keys(values)) {
    const playerKey = key.split(':idle:')[0];
    if (!key.includes(':idle:') || players.some((player) => player.id === playerKey)) continue;
    const existing = merged.get(playerKey) ?? stats.find((stat) => getIdleTcKey(stat) === playerKey);
    const byAge = getIdleTcByAgeFromValues(playerKey, values, existing);
    if (!byAge) continue;
    merged.set(playerKey, {
      player: existing?.player ?? `Player ${playerKey}`,
      playerId: existing?.playerId,
      seconds: sumIdleTcByAge(byAge),
      byAge,
    });
  }

  return [...merged.values()].filter((stat) => stat.seconds >= 0);
}

function mergeIdleTcEvent(events: TimelineEvent[], idleTcStats: IdleTcStats[]) {
  const withoutGeneratedIdle = events.filter((event) => !(event.label === 'Town Center Idle Time' && event.detail?.startsWith('Idle TC totals:')));
  if (!idleTcStats.length) return withoutGeneratedIdle;

  const worstIdle = Math.max(...idleTcStats.map((stat) => stat.seconds));
  return [
    ...withoutGeneratedIdle,
    {
      minute: 'Unknown',
      label: 'Town Center Idle Time',
      detail: `Idle TC totals: ${idleTcStats.map((stat) => `${stat.player} ${formatDuration(stat.seconds)} (${formatIdleTcByAge(stat)})`).join(', ')}`,
      category: 'Macro',
      severity: worstIdle > 60 ? 'Critical' : worstIdle > 25 ? 'Warning' : 'Info',
    } satisfies TimelineEvent,
  ];
}

function getIdleTcEditablePlayers(players: PlayerIdentity[], stats: IdleTcStats[]): IdleTcStats[] {
  if (players.length) {
    return players
      .filter((player) => isDisplayablePlayerName(player.name))
      .map((player) => normalizeIdleTcStat(stats.find((stat) => stat.playerId === player.id) ?? { player: player.name, playerId: player.id, seconds: 0 }));
  }

  if (stats.length) return stats.map(normalizeIdleTcStat);
  return [
    normalizeIdleTcStat({ player: 'Player 1', playerId: '1', seconds: 0 }),
    normalizeIdleTcStat({ player: 'Player 2', playerId: '2', seconds: 0 }),
  ];
}

function getIdleTcKey(value: IdleTcStats) {
  return value.playerId ?? value.player;
}

function getIdleTcAgeKey(playerKey: string, age: IdleTcAge) {
  return `${playerKey}:idle:${age}`;
}

function normalizeIdleTcStat(stat: IdleTcStats): IdleTcStats {
  const byAge = {
    'Dark Age': stat.byAge?.['Dark Age'] ?? 0,
    'Feudal Age': stat.byAge?.['Feudal Age'] ?? 0,
    'Castle Age': stat.byAge?.['Castle Age'] ?? 0,
    'Imperial Age': stat.byAge?.['Imperial Age'] ?? 0,
  };
  const byAgeTotal = sumIdleTcByAge(byAge);

  return {
    ...stat,
    seconds: byAgeTotal > 0 ? byAgeTotal : stat.seconds,
    byAge,
  };
}

function getIdleTcAgeSeconds(stat: IdleTcStats, age: IdleTcAge) {
  return stat.byAge?.[age] ?? 0;
}

function getIdleTcByAgeFromValues(playerKey: string, values: Record<string, string>, existing?: IdleTcStats) {
  const byAge = {
    'Dark Age': existing?.byAge?.['Dark Age'] ?? 0,
    'Feudal Age': existing?.byAge?.['Feudal Age'] ?? 0,
    'Castle Age': existing?.byAge?.['Castle Age'] ?? 0,
    'Imperial Age': existing?.byAge?.['Imperial Age'] ?? 0,
  };
  let hasOverride = false;

  for (const age of idleTcAgeNames) {
    const seconds = parseDuration(values[getIdleTcAgeKey(playerKey, age)]);
    if (seconds === null) continue;
    byAge[age] = seconds;
    hasOverride = true;
  }

  return hasOverride ? byAge : null;
}

function sumIdleTcByAge(byAge: Partial<Record<IdleTcAge, number>>) {
  return idleTcAgeNames.reduce((sum, age) => sum + (byAge[age] ?? 0), 0);
}

function formatIdleTcByAge(stat: IdleTcStats) {
  const normalized = normalizeIdleTcStat(stat);
  return idleTcAgeNames.map((age) => `${age.replace(' Age', '')} ${formatDuration(normalized.byAge?.[age] ?? 0)}`).join(' / ');
}

function parseDuration(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const clock = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);

  const seconds = trimmed.match(/^(\d{1,5})\s*(?:s|sec|secs|second|seconds)?$/i);
  return seconds ? Number(seconds[1]) : null;
}

function getTransitionKey(event: TimelineEvent, index: number) {
  return `${event.playerId ?? event.playerName ?? 'unknown'}:${event.label}:${index}`;
}

function isClockTime(value: string) {
  return /^\d{1,2}:\d{2}$/.test(value.trim());
}

function normalizeClockTime(value: string) {
  const [minutes, seconds] = value.trim().split(':');
  return `${minutes.padStart(2, '0')}:${seconds}`;
}

function PlayerPanel({ players, compact = false }: { players: PlayerIdentity[]; compact?: boolean }) {
  const visiblePlayers = players.filter((player) => isDisplayablePlayerName(player.name));
  if (!visiblePlayers.length) return null;

  return (
    <div className="mt-4 rounded border border-[#8a6733] bg-[#d8bd83] p-3 text-[#2a1b10]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b301f]">Players</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {visiblePlayers.slice(0, compact ? 2 : 8).map((player) => (
          <div key={player.id} className="flex items-center justify-between gap-3 rounded border border-[#8a6733] bg-[#f0dfb3] px-3 py-2">
            <div>
              <span className="font-semibold">{player.name}</span>
              {player.civilization && <p className="text-xs text-[#5a4026]">{player.civilization}</p>}
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b301f]">{player.isAi ? 'AI' : `Player ${player.id}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplayCoachingPlan({
  players,
  coachedPlayerId,
  onPlayerChange,
  goals,
}: {
  players: PlayerIdentity[];
  coachedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
  goals: ReplayCoachGoal[];
}) {
  if (!players.length || !goals.length) return null;

  return (
    <div className="mt-4 border border-gold/20 bg-[#101619]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold">Coach's Match Plan</p>
          <p className="mt-1 text-sm text-vellum">Goals ranked from the evidence in this replay.</p>
        </div>
        <label className="min-w-48">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-vellum">Coaching player</span>
          <select className="field py-1.5" value={coachedPlayerId} onChange={(event) => onPlayerChange(event.target.value)}>
            {players.map((player) => (
              <option key={player.id} value={player.id}>{player.name}{player.isAi ? ' (AI)' : ''}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="divide-y divide-white/10">
        {goals.map((goal, index) => (
          <div key={goal.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[48px_minmax(0,1fr)_minmax(240px,0.8fr)]">
            <div className={`grid h-9 w-9 place-items-center border text-sm font-black ${goal.priority === 'Primary' ? 'border-banner bg-banner/15 text-banner' : 'border-gold/25 bg-gold/5 text-gold'}`}>
              {String(index + 1).padStart(2, '0')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-parchment">{goal.title}</h3>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-moss">{goal.priority}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-vellum">{goal.evidence}</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">{goal.diagnosis}</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold"><Target className="h-3.5 w-3.5" /> Next match</p>
              <p className="mt-2 text-sm font-semibold leading-5 text-parchment">{goal.mission}</p>
              <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-moss"><Flag className="mt-0.5 h-3.5 w-3.5 shrink-0" />{goal.successMetric}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceStatsTable({ stats, compact = false }: { stats: NonNullable<CaptureAgeAnalysis['resourceStats']>; compact?: boolean }) {
  if (!stats.length) return null;
  const snapshotOnly = stats.every((row) => row.snapshotType === 'Current bank' && row.food === undefined && row.wood === undefined && row.gold === undefined && row.stone === undefined);

  if (snapshotOnly) {
    return (
      <div className="mt-4 overflow-hidden rounded border border-[#8a6733] bg-[#d8bd83] text-[#2a1b10]">
        <div className="border-b border-[#8a6733] bg-[#26180e] px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Final Synchronized Snapshot</p>
        </div>
        <div className="grid gap-px bg-[#8a6733] sm:grid-cols-2">
          {stats.slice(0, compact ? 2 : 8).map((row) => (
            <div key={row.player} className="bg-[#f0dfb3] px-3 py-3">
              <p className="font-semibold">{row.player}</p>
              <p className="mt-1 text-sm"><strong>{row.total?.toLocaleString() ?? '-'}</strong> resources banked</p>
              {typeof row.objectCount === 'number' && <p className="text-xs text-[#5a4026]">{row.objectCount.toLocaleString()} live objects in the final sync</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded border border-[#8a6733] bg-[#d8bd83] text-[#2a1b10]">
      <div className="border-b border-[#8a6733] bg-[#26180e] px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Economy Statistics</p>
      </div>
      <div className="grid grid-cols-[1fr_repeat(5,minmax(54px,auto))] gap-px bg-[#8a6733] text-sm">
        {['Player', 'Food', 'Wood', 'Gold', 'Stone', 'Total'].map((heading) => (
          <div key={heading} className="bg-[#b99151] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]">
            {heading}
          </div>
        ))}
        {stats.slice(0, compact ? 2 : 6).map((row) => (
          <ResourceRow key={row.player} row={row} />
        ))}
      </div>
    </div>
  );
}

function IdleTcStatsTable({ stats, compact = false }: { stats: IdleTcStats[]; compact?: boolean }) {
  if (!stats.length) return null;

  return (
    <div className="mt-4 overflow-hidden rounded border border-[#8a6733] bg-[#d8bd83] text-[#2a1b10]">
      <div className="border-b border-[#8a6733] bg-[#26180e] px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Town Center Idle Time{stats.some((row) => row.estimated) ? ' · Estimated' : ''}</p>
      </div>
      <div className="grid grid-cols-[1fr_repeat(4,minmax(64px,auto))_96px_104px] gap-px bg-[#8a6733] text-sm">
        {['Player', 'Dark', 'Feudal', 'Castle', 'Imperial', 'Total', 'Status'].map((heading) => (
          <div key={heading} className="bg-[#b99151] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]">
            {heading}
          </div>
        ))}
        {stats.slice(0, compact ? 2 : 8).map((row) => (
          <IdleTcRow key={`${row.playerId ?? row.player}-${row.seconds}`} row={row} />
        ))}
      </div>
    </div>
  );
}

function IdleTcRow({ row }: { row: IdleTcStats }) {
  const normalized = normalizeIdleTcStat(row);
  const status = getIdleTcStatus(normalized.seconds);
  return (
    <>
      <div className="bg-[#f0dfb3] px-3 py-2 font-semibold">{normalized.player}</div>
      {idleTcAgeNames.map((age) => (
        <div key={age} className="bg-[#f0dfb3] px-3 py-2 text-right">{formatDuration(normalized.byAge?.[age] ?? 0)}</div>
      ))}
      <div className="bg-[#f0dfb3] px-3 py-2 text-right font-bold text-[#6b301f]">{formatDuration(normalized.seconds)}</div>
      <div className={`bg-[#f0dfb3] px-3 py-2 text-right text-xs font-bold uppercase ${status.className}`}>{status.label}</div>
    </>
  );
}

function getIdleTcStatus(seconds: number) {
  if (seconds > 60) return { label: 'Critical', className: 'text-[#9f3d26]' };
  if (seconds > 25) return { label: 'Watch', className: 'text-[#8a5d18]' };
  return { label: 'Clean', className: 'text-[#2f5f73]' };
}

function ResourceRow({ row }: { row: NonNullable<CaptureAgeAnalysis['resourceStats']>[number] }) {
  return (
    <>
      <div className="bg-[#f0dfb3] px-3 py-2 font-semibold">{row.player}</div>
      <ResourceValue value={row.food} />
      <ResourceValue value={row.wood} />
      <ResourceValue value={row.gold} />
      <ResourceValue value={row.stone} />
      <ResourceValue value={row.total} strong />
    </>
  );
}

function ResourceValue({ value, strong = false }: { value?: number; strong?: boolean }) {
  return <div className={`bg-[#f0dfb3] px-3 py-2 text-right ${strong ? 'font-bold text-[#6b301f]' : ''}`}>{typeof value === 'number' ? value.toLocaleString() : '-'}</div>;
}

function isDisplayablePlayerName(name: string) {
  if (/^Player \d+$/i.test(name)) return true;
  if (!/[a-z]/.test(name)) return false;
  if (/^[A-Za-z0-9]{2,5}$/.test(name) && !/[aeiou]/i.test(name)) return false;
  return true;
}

type StatTab = 'Overview' | 'Military' | 'Economy' | 'Technology' | 'Society';

const statTabs: StatTab[] = ['Overview', 'Military', 'Economy', 'Technology', 'Society'];
const idleTcAgeNames = ['Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'] as const;
type IdleTcAge = typeof idleTcAgeNames[number];

function ReplayTimeline({ events, players, compact = false }: { events: TimelineEvent[]; players: PlayerIdentity[]; compact?: boolean }) {
  const [activeTab, setActiveTab] = useState<StatTab>('Overview');
  const visibleEvents = activeTab === 'Overview' ? events : events.filter((event) => getStatsTab(event) === activeTab);
  const timedEvents = visibleEvents.map(toTimelinePoint).filter((event): event is TimelinePoint => Boolean(event)).sort((left, right) => left.minuteValue - right.minuteValue);
  const untimedEvents = visibleEvents.filter((event) => !toTimelinePoint(event));
  const allTimedEvents = events.map(toTimelinePoint).filter((event): event is TimelinePoint => Boolean(event));
  const maxMinute = Math.max(10, Math.ceil(Math.max(...allTimedEvents.map((event) => event.minuteValue), 10) / 10) * 10);
  const ticks = buildTimelineTicks(maxMinute);
  const ageCount = visibleEvents.filter((event) => /Feudal|Castle|Imperial/i.test(event.label)).length;
  const ageProgressions = buildAgeProgressions(events, players);
  const criticalCount = visibleEvents.filter((event) => event.severity === 'Critical').length;
  const warningCount = visibleEvents.filter((event) => event.severity === 'Warning').length;
  const playerRows = players.map((player) => ({
    player,
    events: timedEvents.filter((event) => event.playerId === player.id),
  })).filter((row) => row.events.length > 0 || activeTab === 'Overview');
  const matchEvents = timedEvents.filter((event) => !event.playerId);

  return (
    <div className="overflow-hidden border border-white/10 bg-[#0e1316]">
      <div className="border-b border-white/10 bg-[#11171a] px-3 pt-3">
        <div className="flex flex-wrap gap-1">
          {statTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border border-b-0 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                activeTab === tab
                  ? 'border-gold/35 bg-gold/10 text-gold'
                  : 'border-white/10 bg-[#0d1215] text-vellum hover:bg-white/5 hover:text-parchment'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 text-parchment">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold">Match Chronology</p>
            <h3 className="mt-1 font-display text-xl text-parchment">{activeTab} Timeline</h3>
            <p className="mt-1 text-sm text-vellum">
              {timedEvents.length ? 'Every marker uses the replay clock. Select a marker or scan the evidence feed below.' : 'No timed events were decoded for this category.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <StatCell label="Players" value={players.length.toString()} />
            <StatCell label="Ages" value={ageCount.toString()} />
            <StatCell label="Alerts" value={(criticalCount + warningCount).toString()} />
          </div>
        </div>

        {ageProgressions.length > 0 && (activeTab === 'Overview' || activeTab === 'Technology') && (
          <AgeProgressionStrip progressions={ageProgressions} compact={compact} />
        )}

        <div className="mt-4 overflow-x-auto border border-white/10 bg-[#0b1013] p-3">
          {visibleEvents.length === 0 && (
            <div className={compact ? 'grid h-32 place-items-center text-sm text-vellum' : 'grid h-44 place-items-center text-sm text-vellum'}>
              No {activeTab.toLowerCase()} signals detected.
            </div>
          )}

          {timedEvents.length > 0 && (
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[150px_1fr] items-end gap-3 border-b border-white/10 pb-2">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-stone-500">Player</span>
                <div className="relative h-5">
                  {ticks.map((tick) => (
                    <span key={tick} className="absolute -translate-x-1/2 text-[9px] font-bold text-stone-500" style={{ left: `${(tick / maxMinute) * 100}%` }}>{tick}m</span>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-white/10">
                {playerRows.map(({ player, events: rowEvents }) => (
                  <div key={player.id} className="grid grid-cols-[150px_1fr] items-center gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-parchment">{player.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-vellum">{player.civilization ?? (player.isAi ? 'AI player' : `Player ${player.id}`)}</p>
                    </div>
                    <div className="relative h-12 border-y border-white/10 bg-white/[0.025]">
                      {ticks.map((tick) => <span key={tick} className="absolute inset-y-0 w-px bg-white/[0.06]" style={{ left: `${(tick / maxMinute) * 100}%` }} />)}
                      {rowEvents.map((event, index) => (
                        <button
                          key={`${event.minute}-${event.label}-${index}`}
                          type="button"
                          title={`${event.minute} · ${event.label}${event.detail ? ` · ${event.detail}` : ''}`}
                          aria-label={`${player.name}, ${event.label} at ${event.minute}`}
                          className={`absolute z-10 h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-[#0b1013] ${getTimelineMarkerClass(event)}`}
                          style={{ left: `${Math.min(100, Math.max(0, (event.minuteValue / maxMinute) * 100))}%`, top: index % 2 ? '25px' : '9px' }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {matchEvents.length > 0 && (
                  <div className="grid grid-cols-[150px_1fr] items-center gap-3 py-3">
                    <p className="text-sm font-semibold text-parchment">Match</p>
                    <div className="relative h-10 border-y border-white/10 bg-white/[0.025]">
                      {matchEvents.map((event, index) => (
                        <span key={`${event.minute}-${event.label}-${index}`} title={`${event.minute} · ${event.label}`} className={`absolute top-3 h-3 w-3 -translate-x-1/2 rotate-45 ${getTimelineMarkerClass(event)}`} style={{ left: `${(event.minuteValue / maxMinute) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {timedEvents.length === 0 && untimedEvents.length > 0 && (
            <div className="grid gap-2">
              {untimedEvents.slice(0, compact ? 4 : 8).map((event, index) => (
                <div key={`${event.label}-${index}`} className="grid grid-cols-[48px_1fr_92px] items-center border border-white/10 bg-white/[0.025] px-3 py-2 text-sm">
                  <span className="font-display text-xl text-gold">{index + 1}</span>
                  <span className="font-semibold">{event.label}</span>
                  <span className={`text-right text-xs font-bold uppercase ${getSeverityClass(event.severity)}`}>{event.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {visibleEvents.length > 0 && (
          <div className="mt-4 overflow-hidden border border-white/10 bg-[#0b1013]">
            <div className="grid grid-cols-[68px_12px_1fr_120px] items-center gap-3 border-b border-white/10 bg-[#11171a] px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-stone-500">
              <span>Time</span><span /><span>Evidence</span><span>Player</span>
            </div>
            <div className="divide-y divide-white/10">
              {[...visibleEvents].sort(compareTimelineEvents).slice(0, compact ? 6 : 20).map((event, index) => (
                <div key={`${event.minute}-${event.label}-${index}`} className="grid grid-cols-[68px_12px_1fr_120px] items-start gap-3 px-3 py-3 text-sm">
                  <span className="font-mono text-xs font-bold text-gold">{parseMinute(event.minute) === null ? '--:--' : event.minute}</span>
                  <span className={`mt-1 h-2.5 w-2.5 rotate-45 ${getTimelineMarkerClass(event)}`} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-parchment">{event.label}</span>
                    {event.detail && <span className="mt-0.5 block text-xs leading-5 text-vellum">{event.detail}</span>}
                  </span>
                  <span className="truncate text-xs text-vellum">{event.playerName ?? 'Match'}</span>
                </div>
              ))}
            </div>
            {visibleEvents.length > (compact ? 6 : 20) && <p className="border-t border-white/10 px-3 py-2 text-xs text-stone-500">{visibleEvents.length - (compact ? 6 : 20)} additional signals hidden in this compact view.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function buildTimelineTicks(maxMinute: number) {
  const step = maxMinute <= 30 ? 5 : 10;
  return Array.from({ length: Math.floor(maxMinute / step) + 1 }, (_, index) => index * step);
}

function getTimelineMarkerClass(event: TimelineEvent) {
  if (/Age Transition|Clicked (?:Feudal|Castle|Imperial)/i.test(event.label)) return 'bg-gold';
  if (getStatsTab(event) === 'Military') return 'bg-banner';
  if (getStatsTab(event) === 'Economy') return 'bg-moss';
  if (getStatsTab(event) === 'Technology') return 'bg-[#6f8fb5]';
  return event.severity === 'Critical' ? 'bg-ember' : 'bg-stone-400';
}

function compareTimelineEvents(left: TimelineEvent, right: TimelineEvent) {
  const leftMinute = parseMinute(left.minute);
  const rightMinute = parseMinute(right.minute);
  if (leftMinute === null && rightMinute === null) return 0;
  if (leftMinute === null) return 1;
  if (rightMinute === null) return -1;
  return leftMinute - rightMinute;
}

interface TimelinePoint extends TimelineEvent {
  minuteValue: number;
  lane: string;
}

interface OrderedTimelinePoint extends TimelineEvent {
  order: number;
  lane: string;
}

type AgeName = 'Dark Age' | 'Feudal Age' | 'Castle Age' | 'Imperial Age';

interface AgeProgression {
  player: string;
  ages: Array<{
    age: AgeName;
    status: 'Start' | 'Detected' | 'Missing';
    minute?: string;
    isFirst?: boolean;
  }>;
}

const ageNames: AgeName[] = ['Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];

function toTimelinePoint(event: TimelineEvent): TimelinePoint | null {
  const minuteValue = parseMinute(event.minute);
  if (minuteValue === null) return null;

  return {
    ...event,
    minuteValue,
    lane: getTimelineLane(event),
  };
}

function AgeProgressionStrip({ progressions, compact = false }: { progressions: AgeProgression[]; compact?: boolean }) {
  return (
    <div className="mt-4 rounded border border-[#8a6733] bg-[#ead9aa] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b301f]">Age Progression</p>
          <p className="mt-1 text-sm text-[#5a4026]">Overview includes every detected age checkpoint, even when exact replay timestamps are not decoded.</p>
        </div>
      </div>
      <div className="mt-3 grid gap-3">
        {progressions.slice(0, compact ? 2 : 8).map((progression) => (
          <div key={progression.player} className="rounded border border-[#c7a66d] bg-[#f0dfb3] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold text-[#2a1b10]">{progression.player}</p>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b301f]">Dark to Imperial</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {progression.ages.map((entry) => (
                <div key={entry.age} className={`min-h-20 rounded border px-2 py-2 text-center ${getAgeProgressionClass(entry.status, entry.isFirst)}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em]">{entry.age.replace(' Age', '')}</p>
                  <p className="mt-1 font-display text-lg leading-none">{entry.minute ?? (entry.status === 'Start' ? '0:00' : entry.status)}</p>
                  {entry.isFirst && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1f6b3d]">First</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildAgeProgressions(events: TimelineEvent[], players: PlayerIdentity[]): AgeProgression[] {
  const ageEvents = events.filter((event) => getAgeFromLabel(event.label));
  if (!ageEvents.length) return [];

  const playerNames = new Map<string, string>();
  for (const player of players) {
    playerNames.set(player.id, player.name);
  }
  for (const event of ageEvents) {
    const key = event.playerId ?? event.playerName ?? 'match';
    playerNames.set(key, event.playerName ?? (event.playerId ? `Player ${event.playerId}` : 'Match'));
  }

  const progressions: AgeProgression[] = [...playerNames.entries()].map(([key, player]) => {
    const playerAgeEvents = ageEvents.filter((event) => (event.playerId ?? event.playerName ?? 'match') === key);
    return {
      player,
      ages: ageNames.map((age) => {
        if (age === 'Dark Age') return { age, status: 'Start', minute: '0:00' };
        const event = playerAgeEvents.find((candidate) => getAgeFromLabel(candidate.label) === age);
        if (!event) return { age, status: 'Missing' };
        return {
          age,
          status: 'Detected',
          minute: parseMinute(event.minute) === null ? undefined : event.minute,
        };
      }),
    };
  });

  return markFirstAgeTimings(progressions);
}

function getAgeFromLabel(label: string): AgeName | null {
  if (/Feudal/i.test(label)) return 'Feudal Age';
  if (/Castle/i.test(label)) return 'Castle Age';
  if (/Imperial/i.test(label)) return 'Imperial Age';
  return null;
}

function markFirstAgeTimings(progressions: AgeProgression[]) {
  for (const age of ageNames.filter((age) => age !== 'Dark Age')) {
    const timedEntries = progressions
      .map((progression, progressionIndex) => {
        const ageIndex = progression.ages.findIndex((entry) => entry.age === age);
        const entry = progression.ages[ageIndex];
        const minuteValue = entry?.minute ? parseMinute(entry.minute) : null;
        return minuteValue === null ? null : { progressionIndex, ageIndex, minuteValue };
      })
      .filter((entry): entry is { progressionIndex: number; ageIndex: number; minuteValue: number } => Boolean(entry));

    if (timedEntries.length < 2) continue;

    const fastest = Math.min(...timedEntries.map((entry) => entry.minuteValue));
    const winners = timedEntries.filter((entry) => entry.minuteValue === fastest);
    if (winners.length !== 1) continue;

    const winner = winners[0];
    progressions[winner.progressionIndex].ages[winner.ageIndex].isFirst = true;
  }

  return progressions;
}

function getAgeProgressionClass(status: AgeProgression['ages'][number]['status'], isFirst?: boolean) {
  if (isFirst) return 'border-[#1f8f4d] bg-[#d8e5b9] text-[#1e3b24] shadow-inner';
  if (status === 'Missing') return 'border-[#c7a66d] bg-[#d8bd83] text-[#765f3c]';
  if (status === 'Start') return 'border-[#8a6733] bg-[#ead9aa] text-[#6b301f]';
  return 'border-[#6b301f] bg-[#d8bd83] text-[#2a1b10] shadow-inner';
}

function toOrderedTimelinePoint(event: TimelineEvent, index: number): OrderedTimelinePoint {
  return {
    ...event,
    order: index + 1,
    lane: getTimelineLane(event),
  };
}

function parseMinute(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) + Number(match[2]) / 60;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function getTimelineLane(event: TimelineEvent) {
  if (/Feudal|Castle|Imperial/i.test(event.label)) return 'Age';
  if (event.category === 'Macro') return 'Macro';
  if (event.category === 'Scouting') return 'Scouting';
  if (event.category === 'Micro') return 'Micro';
  return 'Decision';
}

function getStatsTab(event: TimelineEvent): StatTab {
  if (/Technology|Clicked (?:Feudal|Castle|Imperial)|Age Transition|Blacksmith|University|Monastery|APM|Per Minute/i.test(event.label)) return 'Technology';
  if (/Military|KD|Fight|Battle|Army|Units|Barracks|Archery Range|Stable|Siege Workshop|Castle/i.test(event.label) || event.category === 'Micro') return 'Military';
  if (/Town Center|House|Resource|Villager|TC|Economy|Farm|Food|Wood|Gold|Stone/i.test(event.label) || event.category === 'Macro') return 'Economy';
  return 'Society';
}

function TimelineTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TimelinePoint }> }) {
  if (!active || !payload?.length) return null;
  const event = payload[0].payload;

  return (
    <div className="rounded border border-gold/30 bg-[#15100c] p-3 shadow-glow">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{event.minute}</p>
      <p className="mt-1 text-sm font-semibold text-parchment">{event.label}</p>
      {event.detail && <p className="mt-1 max-w-xs text-xs text-vellum">{event.detail}</p>}
      {event.playerName && <p className="mt-1 text-xs text-gold">{event.playerName}</p>}
      <p className="mt-1 text-xs text-vellum">{event.category} / {event.severity}</p>
    </div>
  );
}

function OrderedTimelineTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: OrderedTimelinePoint }> }) {
  if (!active || !payload?.length) return null;
  const event = payload[0].payload;

  return (
    <div className="rounded border border-gold/30 bg-[#15100c] p-3 shadow-glow">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Event {event.order}</p>
      <p className="mt-1 text-sm font-semibold text-parchment">{event.label}</p>
      {event.detail && <p className="mt-1 max-w-xs text-xs text-vellum">{event.detail}</p>}
      {event.playerName && <p className="mt-1 text-xs text-gold">{event.playerName}</p>}
      <p className="mt-1 text-xs text-vellum">{event.category} / {event.severity}</p>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded border border-[#8a6733] bg-[#f0dfb3] px-3 py-2 shadow-inner">
      <p className="font-display text-2xl leading-none text-[#6b301f]">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a4026]">{label}</p>
    </div>
  );
}

function getSeverityClass(severity: TimelineEvent['severity'], theme: 'dark' | 'light' = 'dark') {
  if (theme === 'light') {
    if (severity === 'Critical') return 'text-[#9f3d26]';
    if (severity === 'Warning') return 'text-[#8a5d18]';
    return 'text-[#2f5f73]';
  }

  if (severity === 'Critical') return 'text-ember';
  if (severity === 'Warning') return 'text-bronze';
  return 'text-gold';
}

function getReplayPathHint() {
  const userName = '<your-user>';
  return `C:\\Users\\${userName}\\Games\\Age of Empires 2 DE\\<profile-id>\\savegame`;
}

