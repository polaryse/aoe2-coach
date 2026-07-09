import type { FormEvent } from 'react';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { createId } from '../../lib/storage';
import type { ReplayReview } from '../../types';

interface ReplayReviewViewProps {
  reviews: ReplayReview[];
  onReviewsChange: (reviews: ReplayReview[]) => void;
}

export function ReplayReviewView({ reviews, onReviewsChange }: ReplayReviewViewProps) {
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
    };
    onReviewsChange([review, ...reviews]);
    event.currentTarget.reset();
  }

  return (
    <>
      <SectionHeader eyebrow="Replay review" title="Find the turning point" description="Keep replay notes short, practical, and tied to one next-game mission." />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="label">What minute did I lose control?</span>
              <input name="lostControlMinute" className="field" placeholder="14:30" required />
            </label>
            <label>
              <span className="label">What caused it?</span>
              <textarea name="cause" className="field min-h-24" required />
            </label>
            <label>
              <span className="label">Category</span>
              <select name="category" className="field" defaultValue="Macro">
                <option>Macro</option>
                <option>Micro</option>
                <option>Scouting</option>
                <option>Decision-making</option>
              </select>
            </label>
            <label>
              <span className="label">Next-game mission</span>
              <textarea name="nextGameMission" className="field min-h-24" required />
            </label>
            <button className="action" type="submit">Save replay review</button>
          </form>
        </Card>

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-parchment">Lost control at {review.lostControlMinute}</h2>
                <span className="rounded border border-gold/30 bg-banner/60 px-3 py-1 text-sm text-parchment">{review.category}</span>
              </div>
              <p className="mt-3 text-sm text-stone-300"><strong>Cause:</strong> {review.cause}</p>
              <p className="mt-2 text-sm text-stone-300"><strong>Next mission:</strong> {review.nextGameMission}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">{review.date}</p>
            </Card>
          ))}
          {!reviews.length && <Card className="border-dashed text-vellum">No replay reviews yet.</Card>}
        </div>
      </div>
    </>
  );
}
