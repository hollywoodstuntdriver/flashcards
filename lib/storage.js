const KEY = 'fc_data';

function load() {
  if (typeof window === 'undefined') return { decks: [], initialized: false };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { decks: [], initialized: false };
  } catch {
    return { decks: [], initialized: false };
  }
}

function persist(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getDecks() {
  return load().decks;
}

export function getDeck(id) {
  return load().decks.find((d) => d.id === id) || null;
}

export function upsertDeck(deck) {
  const data = load();
  const i = data.decks.findIndex((d) => d.id === deck.id);
  if (i >= 0) data.decks[i] = deck;
  else data.decks.push(deck);
  persist(data);
}

export function deleteDeck(id) {
  const data = load();
  data.decks = data.decks.filter((d) => d.id !== id);
  persist(data);
}

export function initDefaults(defaults) {
  const data = load();
  const existingIds = new Set(data.decks.map((d) => d.id));
  const missing = defaults.filter((d) => !existingIds.has(d.id));

  // Merge new cards and sync fields (backShort, back) from defaults into existing decks
  data.decks = data.decks.map((deck) => {
    const def = defaults.find((d) => d.id === deck.id);
    if (!def) return deck;
    const defCardMap = Object.fromEntries(def.cards.map((c) => [c.id, c]));
    const updatedCards = deck.cards.map((c) => {
      const defCard = defCardMap[c.id];
      if (!defCard) return c;
      const updated = { ...c };
      if (defCard.backShort !== undefined) updated.backShort = defCard.backShort;
      return updated;
    });
    const existingCardIds = new Set(deck.cards.map((c) => c.id));
    const newCards = def.cards.filter((c) => !existingCardIds.has(c.id));
    return { ...deck, cards: [...updatedCards, ...newCards] };
  });

  if (!data.initialized || missing.length > 0) {
    data.decks = [...missing, ...data.decks];
    data.initialized = true;
  }
  persist(data);
}

export function exportDeck(deck) {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
