import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import { PlusCircle } from 'lucide-react';
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
    const game: Game = {
      id: createId('game'),
      date: String(data.get('date')),
      result: data.get('result') as Game['result'],
      myCiv: String(data.get('myCiv')),
      opponentCiv: String(data.get('opponentCiv')),
      map: String(data.get('map')),
      opening: String(data.get('opening')),
      eloAfter: Number(data.get('eloAfter')),
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

  return (
    <>
      <SectionHeader eyebrow="Game Log" title="Record the ranked battle" description="Capture the facts that matter for coaching: economy rhythm, scouting, Castle transition, and the lesson worth carrying forward." />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <FormSection title="Match">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="date" label="Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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
                <Field name="eloAfter" label="Elo after game" type="number" required />
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
            <button className="action inline-flex items-center justify-center gap-2" type="submit">
              <PlusCircle className="h-4 w-4" /> Add ranked game
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="rounded border border-gold/20 bg-[#0f0b08]/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CivIcon name={game.myCiv} />
                  <div>
                    <p className="text-sm text-vellum">{game.date} / {game.map}</p>
                    <h2 className="font-display text-2xl text-parchment">{game.myCiv} vs {game.opponentCiv}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <CivIcon name={game.opponentCiv} size="sm" />
                      <span className="text-xs uppercase tracking-[0.16em] text-vellum">Opponent</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <EraBadge tone={game.result === 'Win' ? 'green' : 'red'}>{game.result}</EraBadge>
                  <p className="text-sm text-vellum">{game.eloAfter} Elo</p>
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
    <section className="rounded border border-gold/15 bg-[#0f0b08]/25 p-4">
      <h2 className="mb-3 text-sm font-bold text-parchment">{title}</h2>
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
    <div className="rounded border border-gold/20 bg-[#0f0b08]/40 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-vellum">{label}</p>
      <p className="mt-1 font-semibold text-stone-100">{value}</p>
    </div>
  );
}

