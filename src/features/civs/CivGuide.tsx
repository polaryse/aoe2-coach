import { Search } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { Card } from '../../components/Card';
import { CivIcon } from '../../components/CivIcon';
import { EraBadge, RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import { beginnerCivilizations, civilizations } from '../../lib/civilizations';
import type { Civilization } from '../../types';

type CivFilter = 'Recommended' | 'Friendly' | 'Advanced' | 'All';

const filterLabels: Record<CivFilter, string> = {
  Recommended: 'Recommended',
  Friendly: 'Beginner',
  Advanced: 'Advanced',
  All: 'All',
};

export function CivGuide() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CivFilter>('Recommended');
  const starterCivs = useMemo(() => beginnerCivilizations.slice(0, 9), []);
  const visibleCivs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const tierFiltered = filter === 'All' ? civilizations : civilizations.filter((civ) => civ.beginnerTier === filter);
    if (!normalized) return tierFiltered;
    return tierFiltered.filter((civ) =>
      [civ.name, civ.focus, civ.region, civ.beginnerTier].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [filter, query]);

  return (
    <>
      <SectionHeader eyebrow="Civ Guide" title="Choose a ladder identity" description="Browse custom civ crests, beginner-friendly picks, and simple playstyle tags for ranked learning." />

      <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="aoe-plaque">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <EraBadge tone="green">Beginner stable</EraBadge>
              <h2 className="mt-3 font-display text-2xl text-parchment">Suggested first civs</h2>
              <p className="mt-2 max-w-2xl text-sm text-vellum">These civs reduce early friction or teach clear ranked plans: cavalry macro, simple archers, counters, or forgiving economy.</p>
            </div>
            <RewardPill>{beginnerCivilizations.length} recommended</RewardPill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {starterCivs.map((civ) => (
              <div key={civ.id} className="rounded border border-gold/20 bg-[#0f0b08]/40 p-3">
                <CivIcon civ={civ} showName />
                <p className="mt-2 text-xs text-vellum">{civ.beginnerReason}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <EraBadge tone="blue">Coach note</EraBadge>
          <h2 className="mt-3 font-display text-2xl text-parchment">How to pick</h2>
          <div className="mt-4 space-y-3 text-sm text-vellum">
            <p>For your first ranked block, pick one civ and one opening for 10 games.</p>
            <p>Cavalry civs are usually easiest for beginners because scouts into knights gives a clear plan and simple map-control feedback.</p>
            <p>Archer civs are excellent once you are comfortable keeping units alive while producing villagers.</p>
          </div>
        </Card>
      </section>

      <div className="mb-5 flex items-center gap-3 rounded border border-gold/25 bg-[#0f0b08]/50 px-3 py-2">
        <Search className="h-5 w-5 text-gold" />
        <input className="field search-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search civ, region, style, or beginner tier..." />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(['Recommended', 'Friendly', 'Advanced', 'All'] as CivFilter[]).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded border px-4 py-2 text-sm font-bold transition ${
              filter === item
                ? 'border-gold bg-gold/15 text-gold shadow-glow'
                : 'border-gold/20 bg-[#0f0b08]/40 text-vellum hover:border-gold/50 hover:text-parchment'
            }`}
          >
            {filterLabels[item]}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleCivs.map((civ) => <CivCard key={civ.id} civ={civ} />)}
      </section>
    </>
  );
}

const CivCard = memo(function CivCard({ civ }: { civ: Civilization }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <CivIcon civ={civ} size="lg" />
        <EraBadge tone={civ.beginnerTier === 'Recommended' ? 'green' : civ.beginnerTier === 'Friendly' ? 'gold' : 'red'}>
          {filterLabels[civ.beginnerTier]}
        </EraBadge>
      </div>
      <h2 className="mt-4 font-display text-2xl text-parchment">{civ.name}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <RewardPill>{civ.focus}</RewardPill>
        <span className="rounded border border-vellum/20 px-3 py-1 text-sm text-vellum">{civ.region}</span>
      </div>
      <p className="mt-3 text-sm text-vellum">{civ.beginnerReason}</p>
    </Card>
  );
});

