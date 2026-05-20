import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { ResolvedImage } from './ResolvedImage';
import { dedupeResultsById } from '../lib/dedupeResults';

const SCROLL_SPEED = 0.65;

function HallOfFameCard({ result }) {
  const displayRank = result.achievement || result.rank || result.score || 'Top Rank';

  return (
    <GlassCard className="flex min-w-[320px] max-w-[360px] flex-shrink-0 items-center gap-4 border-l-4 border-l-[#D90429] px-6 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {result.photo ? (
          <ResolvedImage src={result.photo} alt={result.name} className="h-full w-full object-cover" />
        ) : (
          <div className="font-serif text-2xl font-black text-[#0A0F2C]">
            {result.name?.charAt(0) || 'S'}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-lg font-bold text-[#0A0F2C]">{result.name}</h4>
        <p className="mt-1 text-xl font-black text-[#D90429]">{displayRank}</p>
        {result.college && (
          <p className="mt-1 text-sm font-semibold text-slate-700">{result.college}</p>
        )}
        {result.exam && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">{result.exam}</p>
        )}
      </div>
    </GlassCard>
  );
}

/**
 * @param {boolean} [alwaysRoll] — continuous scroll: student 1 → 2 → … → last → 1 → …
 */
export function HallOfFameCarousel({ results = [], alwaysRoll = false }) {
  const unique = dedupeResultsById(results);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const trackItems = useMemo(() => {
    if (unique.length === 0) return [];
    if (!alwaysRoll || reduceMotion) return unique;
    return [...unique, ...unique];
  }, [unique, alwaysRoll, reduceMotion]);

  const continuous =
    alwaysRoll && !reduceMotion && unique.length > 0 && trackItems.length > unique.length;

  useEffect(() => {
    if (!continuous) return;

    const track = trackRef.current;
    if (!track) return;

    let offset = 0;
    let rafId = 0;

    const tick = () => {
      const cycleWidth = track.scrollWidth / 2;
      if (cycleWidth > 0) {
        offset += SCROLL_SPEED;
        if (offset >= cycleWidth) {
          offset -= cycleWidth;
        }
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [trackItems, continuous]);

  if (unique.length === 0) return null;

  const track = (
    <div
      ref={trackRef}
      className="flex w-max gap-6 px-4 py-4 will-change-transform"
    >
      {trackItems.map((result, index) => (
        <HallOfFameCard key={`${result.id}-${index}`} result={result} />
      ))}
    </div>
  );

  if (!continuous) {
    return (
      <div
        ref={containerRef}
        className="flex justify-center overflow-hidden px-4 py-4"
      >
        {track}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#F8F9FA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#F8F9FA] to-transparent" />
      {track}
    </div>
  );
}
