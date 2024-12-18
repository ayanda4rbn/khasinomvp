import { Card } from '@/types/game';

// Create a single, immutable standard deck
export const STANDARD_DECK: readonly Card[] = Object.freeze(
  ['hearts', 'diamonds', 'clubs', 'spades'].flatMap(suit => 
    Array.from({ length: 10 }, (_, i) => ({
      suit: suit as Card['suit'],
      value: i + 1,
      faceUp: false,
      selected: false
    }))
  )
);

// Get a fresh copy of the standard deck
export const getStandardDeck = (): Card[] => {
  return STANDARD_DECK.map(card => ({ ...card }));
};