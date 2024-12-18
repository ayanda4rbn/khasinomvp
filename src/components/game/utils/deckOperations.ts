import { Card } from '@/types/game';
import { getStandardDeck } from './deckCore';

// Fisher-Yates shuffle algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Function to deal cards from the deck
export const dealCards = (deck: Card[], numCards: number): { dealt: Card[], remaining: Card[] } => {
  if (numCards > deck.length) {
    console.error('Attempting to deal more cards than available in deck');
    return { dealt: [], remaining: deck };
  }
  
  const dealt = deck.slice(0, numCards);
  const remaining = deck.slice(numCards);
  
  return { dealt, remaining };
};