import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { CivIcon } from '../../components/CivIcon';
import { EraBadge } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import { civilizations } from '../../lib/civilizations';
import { createId } from '../../lib/storage';
import type { Game } from '../../types';

interface GameLogProps {
  games: Game[];
  onGamesChange: (games: Game[]) => void;
}

export function GameLog({ games, onGamesChange }: GameLogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const matchType = data.get('matchType') as Game['matchType'];
    const eloInput = String(data.get('eloAfter') ?? '');
    const eloAfter = Number(eloInput);
    const game: Game = {
      id: createId('game'),
      date: String(data.get('date')),
      matchType,
      aiDifficulty: matchType === 'AI' ? String(data.get('aiDifficulty')) : undefined,
      result: data.get('result') as Game['result'],
      myCiv: String(data.get('myCiv')),
      opponentCiv: String(data.get('opponentCiv')),
      map: String(data.get('map')),
      opening: String(data.get('opening')),
      eloAfter: matchType === 'Ranked' && eloInput.trim() && Number.isFinite(eloAfter) ? eloAfter : undefined,
      idleTcTime: Number(data.get('idleTcTime')),
      castleAgeTime: String(data.get('castleAgeTime')),
      gotHoused: data.get('gotHoused') === 'on',
      scoutedEnemyOpening: data.get('scoutedEnemyOpening') === 'on',
      addedTwoTcs: data.get('addedTwoTcs') === 'on',
      mainMistake: String(data.get('mainMistake')),
      lessonLearned: String(data.get('lessonLearned')),
    };

    onGamesChange([game, ...games]);
    event.currentTarget.reset();
  }

  function handleDeleteGame(gameId: string) {
    const confirmed = window.confirm('Delete this match record? This only removes it from this browser.');
    if (!confirmed) return;
    onGamesChange(games.filter((game) => game.id !== gameId));
  }

  return (
    <>
      <SectionHeader eyebrow="Game Log" title="Record the Match" description="Log ranked games and AI practice matches with the habits that matter for coaching." />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-white/10 bg-[#141a1e] p-5">
          <form onSubmit={handleSubmit}>
            <FormSection title="Match">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="date" label="Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                <label>
                  <span className="label">Match type</span>
                  <select name="matchType" className="field" defaultValue="Ranked">
                    <option>Ranked</option>
                    <option>AI</option>
                  </select>
                </label>
                <label>
                  <span className="label">Result</span>
                  <select name="result" className="field" defaultValue="Win">
                    <option>Win</option>
                    <option>Loss</option>
                  </select>
                </label>
                <Field name="myCiv" label="My civ" list="civs" required />
                <Field name="opponentCiv" label="Opponent civ" list="civs" required />
                <Field name="map" label="Map" required />
                <Field name="aiDifficulty" label="AI difficulty" placeholder="Hard, Extreme..." />
                <Field name="eloAfter" label="Elo after game" type="number" placeholder="Ranked only" />
              </div>
            </FormSection>
            <datalist id="civs">
              {civilizations.map((civ) => <option key={civ.id} value={civ.name} />)}
            </datalist>

            <FormSection title="Build timing">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="opening" label="Opening" placeholder="Scouts, archers, drush..." required />
                <Field name="idleTcTime" label="Idle TC time (seconds)" type="number" required />
                <Field name="castleAgeTime" label="Castle Age time" placeholder="22:40" />
              </div>
            </FormSection>

            <FormSection title="Habits">
              <div className="grid gap-3">
                <Check name="gotHoused" label="I got housed" />
                <Check name="scoutedEnemyOpening" label="I scouted the enemy opening" />
                <Check name="addedTwoTcs" label="I added 2 extra TCs within 1 minute of Castle" />
              </div>
            </FormSection>

            <FormSection title="Lesson">
              <div className="grid gap-4">
                <label>
                  <span className="label">Main mistake</span>
                  <textarea name="mainMistake" className="field min-h-24" placeholder="What actually cost control of the game?" />
                </label>
                <label>
                  <span className="label">Lesson learned</span>
                  <textarea name="lessonLearned" className="field min-h-24" placeholder="One thing to apply next game." />
                </label>
              </div>
            </FormSection>
            <button className="action mt-5 inline-flex items-center justify-center gap-2" type="submit">
              <PlusCircle className="h-4 w-4" /> Add match
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="border border-white/10 bg-[#141a1e] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CivIcon name={game.myCiv} />
                  <div>
                    <p className="text-sm text-vellum">{game.date} / {game.map}</p>
                    <h2 className="text-xl font-semibold text-parchment">{game.myCiv} vs {game.opponentCiv}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <CivIcon name={game.opponentCiv} size="sm" />
                      <span className="text-xs uppercase tracking-[0.16em] text-vellum">Opponent</span>
                      <span className="text-xs uppercase tracking-[0.16em] text-gold">{game.matchType ?? 'Ranked'}</span>
                      {(game.matchType ?? 'Ranked') === 'AI' && game.aiDifficulty && <span className="text-xs text-vellum">{game.aiDifficulty}</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <EraBadge tone={game.result === 'Win' ? 'green' : 'red'}>{game.result}</EraBadge>
                  <p className="text-sm text-vellum">{(game.matchType ?? 'Ranked') === 'Ranked' && game.eloAfter ? `${game.eloAfter} Elo` : 'Practice match'}</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteGame(game.id)}
                    className="inline-flex items-center justify-end gap-1.5 rounded-sm border border-ember/30 bg-ember/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-ember transition hover:border-ember hover:bg-ember/20"
                    aria-label={`Delete ${game.myCiv} vs ${game.opponentCiv} match record`}
                    title="Delete record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Tag label="Opening" value={game.opening} />
                <Tag label="Idle TC" value={`${game.idleTcTime}s`} />
                <Tag label="Castle" value={game.castleAgeTime || 'Not logged'} />
              </div>
              <p className="mt-4 text-sm text-stone-300"><strong>Main mistake:</strong> {game.mainMistake || 'None recorded'}</p>
              <p className="mt-2 text-sm text-stone-300"><strong>Lesson:</strong> {game.lessonLearned || 'None recorded'}</p>
            </div>
          ))}
          {!games.length && <Card className="border-dashed text-vellum">No games logged yet. Your first entry will appear here.</Card>}
        </div>
      </div>
    </>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...rest } = props;
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" {...rest} />
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-white/10 py-5 first:pt-0">
      <h2 className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold">{title}</h2>
      {children}
    </section>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-stone-200">
      <input name={name} type="checkbox" className="h-4 w-4 accent-bronze" />
      {label}
    </label>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-gold/50 bg-black/10 p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-vellum">{label}</p>
      <p className="mt-1 font-semibold text-stone-100">{value}</p>
    </div>
  );
}

