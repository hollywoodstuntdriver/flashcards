'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDeck, upsertDeck } from '@/lib/storage';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const d = getDeck(id);
    if (!d) { router.push('/'); return; }
    setDeck(d);
    setCards(shuffle(d.cards));
  }, [id, router]);

  const filtered = cards.filter((c) => {
    if (filter === 'queue') return c.queued;
    if (filter === 'favorites') return c.favorited;
    return true;
  });

  const current = filtered[idx] ?? null;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const next = useCallback(() => {
    setFlipped(false);
    setIdx((i) => (i + 1) % Math.max(filtered.length, 1));
  }, [filtered.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIdx((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
  }, [filtered.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 's' || e.key === 'S') toggleFavorite();
      if (e.key === 'q' || e.key === 'Q') toggleQueue();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flip, next, prev, current]);

  function patchCard(id, patch) {
    if (!deck) return;
    const updated = { ...deck, cards: deck.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
    upsertDeck(updated);
    setDeck(updated);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function toggleFavorite() {
    if (!current) return;
    patchCard(current.id, { favorited: !current.favorited });
  }

  function toggleQueue() {
    if (!current) return;
    patchCard(current.id, { queued: !current.queued });
  }

  function changeFilter(f) {
    setFilter(f);
    setIdx(0);
    setFlipped(false);
  }

  if (!deck) return null;

  const progress = filtered.length > 0 ? `${idx + 1} / ${filtered.length}` : '0 / 0';

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs" style={{ color: 'var(--muted)' }}>
            ← decks
          </Link>
          <span style={{ color: 'var(--border2)' }}>/</span>
          <span className="text-sm font-semibold truncate max-w-40" style={{ color: 'var(--text)' }}>
            {deck.name}
          </span>
        </div>
        <Link
          href={`/deck/${id}/manage`}
          className="text-xs"
          style={{ color: 'var(--muted)' }}
        >
          manage cards
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 rounded-lg p-1" style={{ background: 'var(--surface)' }}>
        {[
          { key: 'all', label: `all (${deck.cards.length})` },
          { key: 'queue', label: `queue (${deck.cards.filter((c) => c.queued).length})` },
          { key: 'favorites', label: `starred (${deck.cards.filter((c) => c.favorited).length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeFilter(key)}
            className="flex-1 py-1.5 text-xs rounded cursor-pointer transition-colors"
            style={{
              background: filter === key ? 'var(--surface2)' : 'transparent',
              color: filter === key ? 'var(--accent)' : 'var(--muted)',
              border: filter === key ? '1px solid var(--border2)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
            <div className="text-3xl mb-3">◇</div>
            <p className="text-sm">no cards in this filter</p>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="flex items-center justify-between w-full mb-4 text-xs" style={{ color: 'var(--muted)' }}>
              <span>
                {flipped ? (
                  <span style={{ color: 'var(--accent)' }}>answer</span>
                ) : (
                  <span>question</span>
                )}
              </span>
              <span>{progress}</span>
            </div>

            {/* Flip card */}
            <div className="card-scene w-full" style={{ height: '380px' }}>
              <div className={`card-inner ${flipped ? 'flipped' : ''}`} onClick={flip}>
                {/* Front */}
                <div
                  className="card-face rounded-xl border flex items-center justify-center p-8 text-center overflow-y-auto"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}
                >
                  <p className="text-base leading-relaxed" style={{ color: 'var(--text)' }}>
                    {current?.front}
                  </p>
                </div>
                {/* Back */}
                <div
                  className="card-face card-back-face rounded-xl border p-6 overflow-y-auto"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--accent)', borderWidth: '1px' }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--accent)', whiteSpace: 'pre-wrap', textAlign: 'left' }}
                  >
                    {current?.back}
                  </p>
                </div>
              </div>
            </div>

            {/* Card actions */}
            <div className="flex items-center gap-4 mt-5 text-sm">
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer text-xs border"
                style={{
                  background: current?.favorited ? 'var(--accent-dim)' : 'transparent',
                  color: current?.favorited ? 'var(--accent)' : 'var(--muted)',
                  borderColor: current?.favorited ? 'var(--accent)' : 'var(--border2)',
                }}
                title="Star (S)"
              >
                {current?.favorited ? '★' : '☆'} star
              </button>

              <label
                className="flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer text-xs border"
                style={{
                  background: current?.queued ? '#2a2000' : 'transparent',
                  color: current?.queued ? 'var(--warn)' : 'var(--muted)',
                  borderColor: current?.queued ? 'var(--warn)' : 'var(--border2)',
                }}
                title="Queue (Q)"
              >
                <input
                  type="checkbox"
                  checked={current?.queued ?? false}
                  onChange={toggleQueue}
                  className="sr-only"
                />
                {current?.queued ? '⊞' : '⊟'} queue
              </label>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={prev}
                className="px-5 py-2 rounded border text-sm cursor-pointer"
                style={{ borderColor: 'var(--border2)', color: 'var(--muted)', background: 'transparent' }}
              >
                ←
              </button>
              <button
                onClick={flip}
                className="px-8 py-2 rounded text-sm font-semibold cursor-pointer"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)' }}
              >
                flip
              </button>
              <button
                onClick={next}
                className="px-5 py-2 rounded border text-sm cursor-pointer"
                style={{ borderColor: 'var(--border2)', color: 'var(--muted)', background: 'transparent' }}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-center text-xs" style={{ color: 'var(--border2)' }}>
        space to flip · ← → navigate · s star · q queue
      </div>
    </div>
  );
}
