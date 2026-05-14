'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { upsertDeck } from '@/lib/storage';

export default function NewDeck() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);

  function addCard() {
    setCards((c) => [...c, { front: '', back: '' }]);
  }

  function updateCard(i, field, val) {
    setCards((c) => c.map((card, idx) => (idx === i ? { ...card, [field]: val } : card)));
  }

  function removeCard(i) {
    setCards((c) => c.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const validCards = cards.filter((c) => c.front.trim() || c.back.trim());
    const deck = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      cards: validCards.map((c) => ({
        id: crypto.randomUUID(),
        front: c.front.trim(),
        back: c.back.trim(),
        favorited: false,
        queued: false,
      })),
    };
    upsertDeck(deck);
    router.push('/');
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-xs" style={{ color: 'var(--muted)' }}>
          ← back
        </Link>
        <span style={{ color: 'var(--border2)' }}>/</span>
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
          new deck
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-lg border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: 'var(--muted)' }}>
              deck name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Framework"
              className="w-full px-3 py-2 text-sm rounded border bg-transparent"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1.5" style={{ color: 'var(--muted)' }}>
              description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="optional"
              className="w-full px-3 py-2 text-sm rounded border bg-transparent"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              cards
            </span>
            <span className="text-xs" style={{ color: 'var(--border2)' }}>
              {cards.length} added
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {cards.map((card, i) => (
              <div
                key={i}
                className="rounded-lg border p-3"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    #{i + 1}
                  </span>
                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCard(i)}
                      className="text-xs cursor-pointer"
                      style={{ color: 'var(--muted)', background: 'none', border: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >
                      remove
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>front</label>
                    <textarea
                      value={card.front}
                      onChange={(e) => updateCard(i, 'front', e.target.value)}
                      placeholder="Question"
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none"
                      style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>back</label>
                    <textarea
                      value={card.back}
                      onChange={(e) => updateCard(i, 'back', e.target.value)}
                      placeholder="Answer"
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none"
                      style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCard}
            className="w-full mt-3 py-2 text-xs rounded border cursor-pointer"
            style={{ borderColor: 'var(--border2)', color: 'var(--muted)', background: 'transparent', borderStyle: 'dashed' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border2)';
              e.currentTarget.style.color = 'var(--muted)';
            }}
          >
            + add card
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 text-sm rounded font-semibold cursor-pointer"
          style={{ background: 'var(--accent)', color: '#0d1117' }}
        >
          create deck
        </button>
      </form>
    </div>
  );
}
