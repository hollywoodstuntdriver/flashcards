'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDecks, upsertDeck, deleteDeck, initDefaults } from '@/lib/storage';
import { defaultDecks } from '@/lib/defaultDecks';

export default function Home() {
  const [decks, setDecks] = useState([]);
  const importRef = useRef(null);

  useEffect(() => {
    initDefaults(defaultDecks);
    setDecks(getDecks());
  }, []);

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const decksToImport = Array.isArray(parsed) ? parsed : [parsed];
        decksToImport.forEach((d) => {
          if (d.name && Array.isArray(d.cards)) {
            upsertDeck({
              ...d,
              id: d.id || crypto.randomUUID(),
              createdAt: d.createdAt || new Date().toISOString(),
            });
          }
        });
        setDecks(getDecks());
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleDelete(id) {
    if (!confirm('Delete this deck?')) return;
    deleteDeck(id);
    setDecks(getDecks());
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>
            ◆ flashcards
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            your decks
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => importRef.current?.click()}
            className="px-3 py-1.5 text-xs rounded border cursor-pointer"
            style={{ borderColor: 'var(--border2)', color: 'var(--muted)', background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border2)';
              e.currentTarget.style.color = 'var(--muted)';
            }}
          >
            import json
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Link
            href="/new"
            className="px-3 py-1.5 text-xs rounded font-semibold"
            style={{ background: 'var(--accent)', color: '#0d1117' }}
          >
            + new deck
          </Link>
        </div>
      </div>

      {/* Deck list */}
      {decks.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-4xl mb-4">◇</div>
          <p className="text-sm">no decks yet. create one or import a json file.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {decks.map((deck) => {
            const queued = deck.cards.filter((c) => c.queued).length;
            const faved = deck.cards.filter((c) => c.favorited).length;
            return (
              <div
                key={deck.id}
                className="rounded-lg border p-4"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {deck.name}
                    </h2>
                    {deck.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                        {deck.description}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                      <span>{deck.cards.length} cards</span>
                      {queued > 0 && <span style={{ color: 'var(--warn)' }}>⊞ {queued} queued</span>}
                      {faved > 0 && <span style={{ color: 'var(--accent)' }}>★ {faved} starred</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 items-center">
                    <Link
                      href={`/deck/${deck.id}/manage`}
                      className="px-2.5 py-1 text-xs rounded border"
                      style={{ borderColor: 'var(--border2)', color: 'var(--muted)', background: 'transparent' }}
                    >
                      edit
                    </Link>
                    <Link
                      href={`/deck/${deck.id}`}
                      className="px-2.5 py-1 text-xs rounded font-semibold border"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                      study →
                    </Link>
                    <button
                      onClick={() => handleDelete(deck.id)}
                      className="px-2 py-1 text-xs rounded cursor-pointer"
                      style={{ color: 'var(--muted)', background: 'transparent', border: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                      title="Delete deck"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-16 text-center text-xs" style={{ color: 'var(--border2)' }}>
        space to flip · ← → to navigate · s to star · q to queue
      </div>
    </div>
  );
}
