import { Upload } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Card } from '../../components/Card';
import { EraBadge, RewardPill } from '../../components/GameUI';
import { SectionHeader } from '../../components/SectionHeader';
import { analyseCaptureAgeBuffer, type CaptureAgeAnalysis } from '../../lib/captureAge';
import { createId } from '../../lib/storage';
import type { ReplayReview } from '../../types';

interface ReplayReviewViewProps {
  reviews: ReplayReview[];
  onReviewsChange: (reviews: ReplayReview[]) => void;
}

export function ReplayReviewView({ reviews, onReviewsChange }: ReplayReviewViewProps) {
  const [analysis, setAnalysis] = useState<CaptureAgeAnalysis | null>(null);
  const [uploadError, setUploadError] = useState('');

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
      timelineEvents: analysis?.events,
      coachingNotes: analysis?.coachingNotes,
    };
    onReviewsChange([review, ...reviews]);
    event.currentTarget.reset();
    setAnalysis(null);
  }

  async function handleCaptureAgeUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError('');
    setAnalysis(null);
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      if (!buffer.byteLength) {
        setUploadError('That file looks empty. Try another CaptureAge recording or timeline export.');
        return;
      }
      setAnalysis(analyseCaptureAgeBuffer(file.name, buffer));
    } catch {
      setUploadError('Could not read that file locally. Try another CaptureAge recording or timeline export.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <>
      <SectionHeader eyebrow="Replay Review" title="Find the turning point" description="Upload local timeline data, review the key moments, and save one practical next-game mission." />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="mb-5 rounded border border-gold/25 bg-[#0f0b08]/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <EraBadge tone="blue">CaptureAge ingest</EraBadge>
                <p className="mt-2 text-sm text-vellum">Upload a local .caderec recording or readable timeline export. The parser extracts age-up, economy, scouting, raid, fight, and stat signals where available.</p>
              </div>
              <label className="action inline-flex cursor-pointer items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload file
                <input type="file" accept=".caderec,.json,.csv,.txt,.log" className="hidden" onChange={handleCaptureAgeUpload} />
              </label>
            </div>
            {uploadError && <p className="mt-3 text-sm text-ember">{uploadError}</p>}
          </div>

          {analysis && (
            <div className="mb-5 rounded border border-gold/25 bg-banner/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Extracted from {analysis.fileName}</p>
                  <h2 className="mt-2 font-display text-2xl text-parchment">
                    {analysis.parserConfidence === 'Low' ? 'Review checkpoint' : 'Likely control loss'}: {analysis.likelyLostControlMinute || 'Needs manual review'}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RewardPill>{analysis.events.length} timeline signals</RewardPill>
                  <RewardPill>{analysis.parserConfidence} confidence</RewardPill>
                </div>
              </div>
              <p className="mt-3 text-sm text-vellum">{analysis.parserConfidence === 'Low' ? 'This upload produced low-confidence signals. Use the extracted facts below as prompts, then confirm the turning point manually.' : analysis.likelyCause}</p>
              <div className="mt-3 space-y-2">
                {analysis.parserNotes.map((note) => (
                  <p key={note} className="text-xs text-vellum">{note}</p>
                ))}
              </div>
              {analysis.events.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Detected facts</p>
                  <div className="mt-2 grid gap-2">
                    {analysis.events.slice(0, 6).map((event) => (
                      <div key={`${event.minute}-${event.label}`} className="rounded border border-gold/15 bg-[#0f0b08]/30 p-2 text-sm text-vellum">
                        <strong className="text-gold">{event.minute}</strong> / {event.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Possible coaching causes</p>
                {analysis.coachingNotes.map((note) => (
                  <div key={note} className="rounded border border-gold/20 bg-[#0f0b08]/40 p-3 text-sm text-parchment">{note}</div>
                ))}
              </div>
              <div className="mt-4 rounded border border-gold/15 bg-[#0f0b08]/30 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">30-second replay check</p>
                <p className="mt-2 text-sm text-vellum">Before saving, verify: was your TC producing, were resources floating, did you see the enemy army, were upgrades in, and where was your army?</p>
              </div>
            </div>
          )}

          <form key={analysis?.fileName ?? 'manual-review'} onSubmit={handleSubmit} className="grid gap-4">
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
              <textarea name="nextGameMission" className="field min-h-24" defaultValue={analysis?.nextGameMission ?? ''} required />
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
              {review.sourceFileName && (
                <p className="mt-2 text-sm text-vellum">
                  <strong>Source:</strong> {review.sourceFileName}
                  {review.parserConfidence ? ` / ${review.parserConfidence} confidence` : ''}
                </p>
              )}
              {review.timelineEvents && review.timelineEvents.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {review.timelineEvents.slice(0, 5).map((event) => (
                    <div key={`${event.minute}-${event.label}`} className="rounded border border-gold/20 bg-[#0f0b08]/40 p-2 text-sm text-vellum">
                      <strong className="text-gold">{event.minute}</strong> / {event.label}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">{review.date}</p>
            </Card>
          ))}
          {!reviews.length && <Card className="border-dashed text-vellum">No replay reviews yet.</Card>}
        </div>
      </div>
    </>
  );
}

