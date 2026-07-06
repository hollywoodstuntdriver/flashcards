'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDeck, upsertDeck } from '@/lib/storage';

export default function PlanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [maxDay, setMaxDay] = useState(5);

  useEffect(() => {
    const d = getDeck(id);
    if (!d) { router.push('/'); return; }
    setDeck(d);
    const highest = Math.max(...d.cards.map((c) => c.day || 0), d.planDays || 5);
    setMaxDay(highest);
  }, [id, router]);

  function toggleCard(cardId) {
    if (!deck) return;
    const card = deck.cards.find((c) => c.id === cardId);
    // cards assigned to a different day are locked — must unassign from that day first
    if (card?.day && card.day !== activeDay) return;
    const newDay = card?.day === activeDay ? null : activeDay;
    const updated = {
      ...deck,
      cards: deck.cards.map((c) => (c.id === cardId ? { ...c, day: newDay } : c)),
    };
    upsertDeck(updated);
    setDeck(updated);
  }

  function addDay() {
    const newMax = maxDay + 1;
    setMaxDay(newMax);
    setActiveDay(newMax);
    if (!deck) return;
    const updated = { ...deck, planDays: newMax };
    upsertDeck(updated);
    setDeck(updated);
  }

  if (!deck) return null;

  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const assignedHere = deck.cards.filter((c) => c.day === activeDay);
  const unassigned = deck.cards.filter((c) => !c.day);
  const assignedElsewhere = deck.cards.filter((c) => c.day && c.day !== activeDay);

  const sortedCards = [
    ...assignedHere,
    ...unassigned,
    ...assignedElsewhere.sort((a, b) => a.day - b.day),
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-xs" style={{ color: 'var(--muted)' }}>← decks</Link>
        <span style={{ color: 'var(--border2)' }}>/</span>
        <Link href={`/deck/${id}`} className="text-xs" style={{ color: 'var(--muted)' }}>{deck.name}</Link>
        <span style={{ color: 'var(--border2)' }}>/</span>
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>plan</span>
      </div>

      {/* Summary row */}
      <div className="rounded-lg border p-4 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-xs mb-3 tracking-widest uppercase" style={{ color: 'var(--muted)' }}>schedule</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {days.map((day) => {
            const count = deck.cards.filter((c) => c.day === day).length;
            return (
              <div key={day} className="text-xs">
                <span style={{ color: 'var(--muted)' }}>day {day} </span>
                <span style={{ color: count > 0 ? 'var(--accent)' : 'var(--border2)', fontWeight: count > 0 ? 600 : 400 }}>
                  {count > 0 ? `${count} cards` : '—'}
                </span>
              </div>
            );
          })}
        </div>
        {unassigned.length > 0 && (
          <div className="mt-2.5 text-xs" style={{ color: 'var(--border2)' }}>
            {unassigned.length} unassigned
          </div>
        )}
      </div>

      {/* Day selector tabs */}
      <div className="text-xs mb-2 tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
        assigning to
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2">
        {days.map((day) => {
          const count = deck.cards.filter((c) => c.day === day).length;
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className="px-3 py-1.5 text-xs rounded border cursor-pointer"
              style={{
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border2)',
              }}
            >
              day {day}{count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
        <button
          onClick={addDay}
          className="px-3 py-1.5 text-xs rounded border cursor-pointer"
          style={{ color: 'var(--muted)', borderColor: 'var(--border2)', background: 'transparent' }}
        >
          + day
        </button>
      </div>

      <div className="text-xs mb-4" style={{ color: 'var(--border2)' }}>
        click a card to add / remove from day {activeDay}
      </div>

      {/* Card list */}
      <div className="flex flex-col gap-1.5">
        {sortedCards.map((card) => {
          const isAssignedHere = card.day === activeDay;
          const isAssignedElsewhere = card.day && card.day !== activeDay;
          return (
            <div
              key={card.id}
              onClick={() => toggleCard(card.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
              style={{
                background: isAssignedHere ? 'var(--accent-dim)' : 'var(--surface)',
                borderColor: isAssignedHere ? 'var(--accent)' : 'var(--border)',
                opacity: isAssignedElsewhere ? 0.4 : 1,
                cursor: isAssignedElsewhere ? 'default' : 'pointer',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: isAssignedElsewhere ? 'var(--muted)' : 'var(--text)' }}>
                  {card.front}
                </p>
              </div>
              <div className="shrink-0">
                {isAssignedHere ? (
                  <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: 'var(--accent)', color: '#0d1117' }}>
                    day {activeDay} ✓
                  </span>
                ) : isAssignedElsewhere ? (
                  <span className="text-xs" style={{ color: 'var(--border2)' }}>day {card.day}</span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--border2)' }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link href={`/deck/${id}`} className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
          study this deck →
        </Link>
      </div>
    </div>
  );
}
