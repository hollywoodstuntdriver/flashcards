import interviewDeck from '../public/interview-deck.json';

export const defaultDecks = [
  interviewDeck,
  {
    id: 'default-starter',
    name: 'Starter Deck',
    description: 'Sample cards — edit or delete to make it your own',
    createdAt: '2024-01-01T00:00:00.000Z',
    cards: [
      { id: 'dc1', front: 'What does HTTP stand for?', back: 'HyperText Transfer Protocol', favorited: false, queued: false },
      { id: 'dc2', front: 'What is the powerhouse of the cell?', back: 'The mitochondria', favorited: false, queued: false },
      { id: 'dc3', front: 'Who wrote "1984"?', back: 'George Orwell', favorited: false, queued: false },
      { id: 'dc4', front: 'What year did the Berlin Wall fall?', back: '1989', favorited: false, queued: false },
      { id: 'dc5', front: 'What is the derivative of sin(x)?', back: 'cos(x)', favorited: false, queued: false },
      { id: 'dc6', front: 'What planet is known as the Red Planet?', back: 'Mars', favorited: false, queued: false },
    ],
  },
];
