import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { Card } from '../../components/Card';
import { AgeMarker, RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import type { SkillNode } from '../../types';

interface SkillTreeProps {
  skills: SkillNode[];
  onSkillsChange: (skills: SkillNode[]) => void;
}

const ages: SkillNode['age'][] = ['Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];

const ageCopy: Record<SkillNode['age'], { short: 'Dark' | 'Feudal' | 'Castle' | 'Imperial'; goal: string }> = {
  'Dark Age': { short: 'Dark', goal: 'Clean economy and early scouting' },
  'Feudal Age': { short: 'Feudal', goal: 'First army without losing vill production' },
  'Castle Age': { short: 'Castle', goal: 'Power spike, boom, or pressure choice' },
  'Imperial Age': { short: 'Imperial', goal: 'Tech switch and closing plan' },
};

export function SkillTree({ skills, onSkillsChange }: SkillTreeProps) {
  const firstIncomplete = skills.find((skill) => !skill.completed) ?? skills[0];
  const [selectedId, setSelectedId] = useState(firstIncomplete?.id ?? '');
  const selectedSkill = useMemo(
    () => skills.find((skill) => skill.id === selectedId) ?? firstIncomplete,
    [firstIncomplete, selectedId, skills],
  );
  const completedCount = skills.filter((skill) => skill.completed).length;
  const progress = skills.length ? Math.round((completedCount / skills.length) * 100) : 0;
  const isRecommendedSelected = selectedSkill?.id === firstIncomplete?.id;

  function toggleSkill(id: string) {
    onSkillsChange(skills.map((skill) => (skill.id === id ? { ...skill, completed: !skill.completed } : skill)));
    setSelectedId(id);
  }

  return (
    <>
      <SectionHeader eyebrow="Skill Tree" title="Build your ranked toolkit" description="Move through one focused training path at a time. Select a skill to see the drill, promotion rule, and next ranked habit." />

      <section className="mb-6 grid gap-4 lg:grid-cols-[0.65fr_1.35fr]">
        <Card className="aoe-plaque">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Campaign progress</p>
          <h2 className="mt-2 font-display text-3xl text-parchment">{completedCount}/{skills.length} skills mastered</h2>
          <div className="mt-4 h-3 overflow-hidden rounded border border-gold/20 bg-black/40">
            <div className="h-full bg-gradient-to-r from-banner via-bronze to-gold" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <RewardPill>{progress}% complete</RewardPill>
            <RewardPill>{firstIncomplete ? `Next: ${firstIncomplete.title}` : 'Path complete'}</RewardPill>
          </div>
        </Card>

        <Card className="border-gold/30">
          {selectedSkill ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AgeMarker age={ageCopy[selectedSkill.age].short} />
                    {isRecommendedSelected && <span className="rounded bg-gold px-2 py-1 text-xs font-bold text-[#171008]">Train this next</span>}
                  </div>
                  <h2 className="mt-3 font-display text-3xl text-parchment">{selectedSkill.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-vellum">{selectedSkill.description}</p>
                </div>
                <button
                  onClick={() => toggleSkill(selectedSkill.id)}
                  className={`rounded border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-gold/30 active:translate-y-px ${
                    selectedSkill.completed
                      ? 'border-moss/60 bg-[#0f0b08]/30 text-green-100'
                      : 'border-gold/40 bg-gold/10 text-gold hover:border-gold'
                  }`}
                >
                  {selectedSkill.completed ? 'Practice again' : 'Complete drill'}
                </button>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <TrainingBlock title="Practice drill" text={selectedSkill.practiceDrill ?? getDefaultDrill(selectedSkill.age)} primary />
                <SuccessBlock text={selectedSkill.promotionRule ?? getDefaultPromotion(selectedSkill.age)} />
              </div>

              <div className="mt-4 rounded border border-ember/30 bg-banner/15 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember">Watch for</p>
                <p className="mt-1 text-sm text-vellum">{getWatchFor(selectedSkill.age)}</p>
              </div>
            </div>
          ) : (
            <p className="text-vellum">Choose a skill to view its training drill.</p>
          )}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {ages.map((age) => {
          const ageSkills = skills.filter((skill) => skill.age === age);
          const done = ageSkills.filter((skill) => skill.completed).length;
          return (
            <Card key={age} className="p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <AgeMarker age={ageCopy[age].short} />
                    <h2 className="font-display text-xl text-parchment">{age}</h2>
                  </div>
                  <p className="mt-1 text-xs text-vellum">{ageCopy[age].goal}</p>
                </div>
                <RewardPill>{done}/{ageSkills.length}</RewardPill>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded bg-black/30">
                <div className="h-full bg-gold" style={{ width: `${ageSkills.length ? (done / ageSkills.length) * 100 : 0}%` }} />
              </div>

              <div className="divide-y divide-gold/10">
                {ageSkills.map((skill, index) => {
                  const active = selectedSkill?.id === skill.id;
                  const recommended = firstIncomplete?.id === skill.id;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedId(skill.id)}
                      className={`group flex w-full items-center gap-3 px-2 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-gold/30 active:translate-y-px ${
                        active
                          ? 'rounded border border-gold bg-gold/10 text-parchment shadow-glow'
                          : skill.completed
                            ? 'text-green-100'
                            : 'text-vellum hover:text-parchment'
                      }`}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${skill.completed ? 'text-moss' : recommended ? 'bg-gold text-[#171008]' : 'text-vellum'}`}>
                        {skill.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-semibold">{skill.title}</span>
                          {recommended && <span className="shrink-0 rounded bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Next drill</span>}
                        </span>
                        {(skill.completed || active || recommended) && (
                          <span className="mt-0.5 block truncate text-xs opacity-75">
                            {skill.completed ? 'Mastered' : active ? 'Selected' : 'Recommended'}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </section>
    </>
  );
}

function TrainingBlock({ title, text, primary = false }: { title: string; text: string; primary?: boolean }) {
  return (
    <div className={`rounded p-4 ${primary ? 'border border-gold/25 bg-gold/10' : 'border border-gold/15 bg-[#0f0b08]/30'}`}>
      <div className="flex items-center gap-2 text-gold">
        <Target className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-[0.16em]">{title}</p>
      </div>
      <p className="mt-2 text-sm text-vellum">{text}</p>
    </div>
  );
}

function SuccessBlock({ text }: { text: string }) {
  return (
    <div className="rounded border border-moss/30 bg-[#0f0b08]/25 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-200">Success condition</p>
      <p className="mt-2 text-sm text-vellum">{text}</p>
    </div>
  );
}

function getDefaultDrill(age: SkillNode['age']) {
  const drills = {
    'Dark Age': 'Run the first 10 minutes and restart if the TC idles or you get housed.',
    'Feudal Age': 'Play one opening while checking villager queue before every fight.',
    'Castle Age': 'Pause at Castle arrival and spend the first minute on TCs, upgrades, or production.',
    'Imperial Age': 'Name your power spike before clicking Imperial.',
  };
  return drills[age];
}

function getDefaultPromotion(age: SkillNode['age']) {
  const rules = {
    'Dark Age': 'Pass in 3 of 5 games before moving on.',
    'Feudal Age': 'Hold the habit through two real fights.',
    'Castle Age': 'Execute the transition twice without floating key resources.',
    'Imperial Age': 'Win or stabilize the next five minutes after the tech choice.',
  };
  return rules[age];
}

function getWatchFor(age: SkillNode['age']) {
  const checks = {
    'Dark Age': 'Idle TC, late houses, long villager walks, and scout standing still.',
    'Feudal Age': 'Villager queue during fights, exposed resources, and missing counter units.',
    'Castle Age': 'Floating wood/stone, idle extra TCs, missing upgrades, and unsafe army movement.',
    'Imperial Age': 'Late upgrades, poor trash support, no tech switch, and losing map control.',
  };
  return checks[age];
}
