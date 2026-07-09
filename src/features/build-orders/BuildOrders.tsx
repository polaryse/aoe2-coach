import { Card } from '../../components/Card';
import { CivIcon } from '../../components/CivIcon';
import { EraBadge, TimelineStep } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import { buildOrders } from '../../lib/sampleData';

export function BuildOrders() {
  return (
    <>
      <SectionHeader eyebrow="Build Orders" title="Readable openings for ranked practice" description="Beginner-friendly cards for scout openings that connect clean early execution to Castle Age plans." />
      <div className="grid gap-6 xl:grid-cols-3">
        {buildOrders.map((order) => (
          <Card key={order.id}>
            <div className="flex items-start justify-between gap-4">
              <CivIcon name={order.civ} size="lg" showName />
              <EraBadge>{order.difficulty}</EraBadge>
            </div>
            <h2 className="mt-4 font-display text-3xl text-parchment">{order.title}</h2>
            <p className="mt-3 text-sm text-stone-300">{order.summary}</p>

            <div className="mt-5 space-y-3">
              {order.steps.map((step, index) => (
                <TimelineStep key={step} index={index + 1}>{step}</TimelineStep>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              <Info title="Beginner notes" items={order.beginnerNotes} />
              <Info title="Common mistakes" items={order.commonMistakes} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => <li key={item} className="text-sm text-stone-300">- {item}</li>)}
      </ul>
    </div>
  );
}

