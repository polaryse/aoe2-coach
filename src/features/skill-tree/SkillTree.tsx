import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import type { SkillNode } from '../../types';

interface SkillTreeProps {
  skills: SkillNode[];
  onSkillsChange: (skills: SkillNode[]) => void;
}

const ages: SkillNode['age'][] = ['Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];

export function SkillTree({ skills, onSkillsChange }: SkillTreeProps) {
  function toggleSkill(id: string) {
    onSkillsChange(skills.map((skill) => (skill.id === id ? { ...skill, completed: !skill.completed } : skill)));
  }

  return (
    <>
      <SectionHeader eyebrow="Skill tree" title="Build your ranked toolkit" description="Mark concepts complete as they become reliable under pressure." />
      <div className="grid gap-5 xl:grid-cols-4">
        {ages.map((age) => (
          <Card key={age}>
            <h2 className="font-display text-2xl text-parchment">{age}</h2>
            <div className="mt-4 space-y-3">
              {skills.filter((skill) => skill.age === age).map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`w-full rounded border p-4 text-left transition ${
                    skill.completed
                      ? 'border-moss bg-moss/15'
                      : 'border-gold/20 bg-[#0f0b08]/45 hover:border-gold/60 hover:bg-bronze/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-stone-100">{skill.title}</p>
                    <span className="text-lg">{skill.completed ? '✓' : '+'}</span>
                  </div>
                  <p className="mt-2 text-sm text-vellum">{skill.description}</p>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
