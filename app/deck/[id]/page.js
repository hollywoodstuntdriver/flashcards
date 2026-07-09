'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDeck, upsertDeck } from '@/lib/storage';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const [shortMode, setShortMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const d = getDeck(id);
    if (!d) { router.push('/'); return; }
    setDeck(d);
    setCards(shuffle(d.cards));
  }, [id, router]);

  const filtered = cards.filter((c) => {
    if (filter === 'queue') return c.queued;
    if (filter === 'favorites') return c.favorited;
    if (filter.startsWith('day-')) return c.day === parseInt(filter.slice(4));
    return true;
  });

  const current = filtered[idx] ?? null;

  const flip = useCallback(() => {
    if (editing) return;
    setFlipped((f) => !f);
    setShortMode(false);
  }, [editing]);

  function startEdit() {
    setEditText(current?.back ?? '');
    setEditing(true);
  }

  function saveEdit() {
    if (!deck || !current) return;
    const updatedCards = deck.cards.map((c) =>
      c.id === current.id ? { ...c, back: editText } : c
    );
    const updatedDeck = { ...deck, cards: updatedCards };
    upsertDeck(updatedDeck);
    setDeck(updatedDeck);
    setCards((prev) => prev.map((c) => c.id === current.id ? { ...c, back: editText } : c));
    setEditing(false);
  }

  const next = useCallback(() => {
    setFlipped(false);
    setShortMode(false);
    setEditing(false);
    setIdx((i) => (i + 1) % Math.max(filtered.length, 1));
  }, [filtered.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setShortMode(false);
    setEditing(false);
    setIdx((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
  }, [filtered.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flip, next, prev, current]);

  function changeFilter(f) {
    setFilter(f);
    setIdx(0);
    setFlipped(false);
    setShortMode(false);
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
        <div className="flex gap-3 items-center">
          <Link href={`/deck/${id}/plan`} className="text-xs" style={{ color: 'var(--muted)' }}>
            plan
          </Link>
          <Link href={`/deck/${id}/manage`} className="text-xs" style={{ color: 'var(--muted)' }}>
            manage
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 rounded-lg p-1 flex-wrap" style={{ background: 'var(--surface)' }}>
        {[
          { key: 'all', label: `all (${deck.cards.length})` },
          ...[...new Set(deck.cards.map((c) => c.day).filter(Boolean))].sort((a, b) => a - b).map((day) => ({
            key: `day-${day}`,
            label: `day ${day} (${deck.cards.filter((c) => c.day === day).length})`,
          })),
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
                  className="card-face rounded-2xl border flex items-center justify-center p-8 text-center overflow-y-auto"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}
                >
                  <p className="text-lg leading-relaxed font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading), serif' }}>
                    {current?.front}
                  </p>
                </div>
                {/* Back */}
                <div
                  className="card-face card-back-face rounded-2xl border p-6 overflow-y-auto"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--accent)', borderWidth: '1px' }}
                >
                  <div className="flex justify-between items-center mb-3" onClick={(e) => e.stopPropagation()}>
                    {current?.backShort && !editing && (
                      <button
                        onClick={() => setShortMode((s) => !s)}
                        className="text-xs px-2.5 py-1 rounded border cursor-pointer"
                        style={{
                          background: shortMode ? 'var(--accent-dim)' : 'transparent',
                          color: shortMode ? 'var(--accent)' : 'var(--muted)',
                          borderColor: shortMode ? 'var(--accent)' : 'var(--border2)',
                        }}
                      >
                        {shortMode ? '30s ✓' : '30s'}
                      </button>
                    )}
                    <div style={{ flex: 1 }} />
                    {!editing ? (
                      <button
                        onClick={startEdit}
                        className="text-xs px-2.5 py-1 rounded border cursor-pointer"
                        style={{ color: 'var(--muted)', borderColor: 'var(--border2)', background: 'transparent' }}
                      >
                        edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(false)}
                          className="text-xs px-2.5 py-1 rounded border cursor-pointer"
                          style={{ color: 'var(--muted)', borderColor: 'var(--border2)', background: 'transparent' }}
                        >
                          cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="text-xs px-2.5 py-1 rounded border cursor-pointer font-semibold"
                          style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-dim)' }}
                        >
                          save
                        </button>
                      </div>
                    )}
                  </div>
                  {editing ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-sm leading-relaxed rounded-lg p-2 resize-none"
                      style={{
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        border: '1px solid var(--border2)',
                        minHeight: '220px',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--accent)', whiteSpace: 'pre-wrap', textAlign: 'left' }}
                    >
                      {shortMode && current?.backShort ? current.backShort : current?.back}
                    </p>
                  )}
                </div>
              </div>
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
        space to flip · ← → navigate
      </div>
    </div>
  );
}
