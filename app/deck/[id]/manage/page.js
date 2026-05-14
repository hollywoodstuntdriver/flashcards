'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDeck, upsertDeck, exportDeck } from '@/lib/storage';

export default function ManageDeck() {
  const { id } = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');

  useEffect(() => {
    const d = getDeck(id);
    if (!d) { router.push('/'); return; }
    setDeck(d);
    setDeckName(d.name);
    setDeckDesc(d.description || '');
  }, [id, router]);

  function saveDeckMeta() {
    if (!deck || !deckName.trim()) return;
    const updated = { ...deck, name: deckName.trim(), description: deckDesc.trim() };
    upsertDeck(updated);
    setDeck(updated);
  }

  function addCard(e) {
    e.preventDefault();
    if (!newFront.trim() && !newBack.trim()) return;
    const card = { id: crypto.randomUUID(), front: newFront.trim(), back: newBack.trim(), favorited: false, queued: false };
    const updated = { ...deck, cards: [...deck.cards, card] };
    upsertDeck(updated);
    setDeck(updated);
    setNewFront('');
    setNewBack('');
  }

  function updateCard(cardId, patch) {
    const updated = { ...deck, cards: deck.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)) };
    upsertDeck(updated);
    setDeck(updated);
  }

  function deleteCard(cardId) {
    const updated = { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) };
    upsertDeck(updated);
    setDeck(updated);
    if (editingId === cardId) setEditingId(null);
  }

  if (!deck) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-xs" style={{ color: 'var(--muted)' }}>
          ← decks
        </Link>
        <span style={{ color: 'var(--border2)' }}>/</span>
        <Link href={`/deck/${id}`} className="text-xs" style={{ color: 'var(--muted)' }}>
          {deck.name}
        </Link>
        <span style={{ color: 'var(--border2)' }}>/</span>
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
          manage
        </span>
      </div>

      {/* Deck meta */}
      <div className="rounded-lg border p-4 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>deck name</label>
            <input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              onBlur={saveDeckMeta}
              className="w-full px-3 py-2 text-sm rounded border bg-transparent"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>description</label>
            <input
              value={deckDesc}
              onChange={(e) => setDeckDesc(e.target.value)}
              onBlur={saveDeckMeta}
              placeholder="optional"
              className="w-full px-3 py-2 text-sm rounded border bg-transparent"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {deck.cards.length} cards
          </span>
          <button
            onClick={() => exportDeck(deck)}
            className="text-xs cursor-pointer"
            style={{ color: 'var(--muted)', background: 'none', border: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            export json ↓
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          cards
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {deck.cards.length === 0 && (
          <div className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>
            no cards yet — add one below
          </div>
        )}
        {deck.cards.map((card) => (
          <div
            key={card.id}
            className="rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: editingId === card.id ? 'var(--accent)' : 'var(--border)' }}
          >
            {editingId === card.id ? (
              <div className="p-3">
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>front</label>
                    <textarea
                      value={card.front}
                      onChange={(e) => updateCard(card.id, { front: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none"
                      style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>back</label>
                    <textarea
                      value={card.back}
                      onChange={(e) => updateCard(card.id, { back: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none"
                      style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-xs rounded cursor-pointer"
                    style={{ background: 'var(--accent)', color: '#0d1117', border: 'none' }}
                  >
                    done
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="px-3 py-1 text-xs rounded cursor-pointer"
                    style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                  >
                    delete
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                onClick={() => setEditingId(card.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: 'var(--text)' }}>
                    {card.front || <em style={{ color: 'var(--muted)' }}>empty front</em>}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                    {card.back || <em>empty back</em>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 text-xs" style={{ color: 'var(--border2)' }}>
                  {card.favorited && <span style={{ color: 'var(--accent)' }}>★</span>}
                  {card.queued && <span style={{ color: 'var(--warn)' }}>⊞</span>}
                  <span>edit</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add card form */}
      <form
        onSubmit={addCard}
        className="rounded-lg border p-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'dashed' }}
      >
        <div className="text-xs mb-3 tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          + add card
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>front</label>
            <textarea
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              placeholder="Question"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>back</label>
            <textarea
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder="Answer"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 text-xs rounded font-semibold cursor-pointer"
          style={{ background: 'var(--accent)', color: '#0d1117', border: 'none' }}
        >
          add card
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={`/deck/${id}`}
          className="text-sm font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          study this deck →
        </Link>
      </div>
    </div>
  );
}
