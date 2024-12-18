import { Card } from '@/types/game';
import { validateDeck, isCardInArray, logCardState } from './deckValidation';
import { getStandardDeck } from './deckCore';

// Fisher-Yates shuffle algorithm with validation
export const shuffleDeck = (deck: Card[]): Card[] => {
  // Create a deep copy of the deck to shuffle
  const shuffled = deck.map(card => ({ ...card }));
  
  // Perform Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Validate the shuffled deck
  if (!validateDeck(shuffled)) {
    console.error('Deck validation failed after shuffle');
    const freshDeck = getStandardDeck();
    return shuffleDeck(freshDeck); // Try again with a fresh deck
  }
  
  // Log the state after shuffling
  logCardState([], [], [], shuffled);
  
  return shuffled;
};

// Function to deal cards from the deck
export const dealCards = (deck: Card[], numCards: number): { dealt: Card[], remaining: Card[] } => {
  if (numCards > deck.length) {
    console.error('Attempting to deal more cards than available in deck');
    return { dealt: [], remaining: deck };
  }
  
  // Create deep copies of the cards being dealt
  const dealt = deck.slice(0, numCards).map(card => ({ ...card }));
  const remaining = deck.slice(numCards).map(card => ({ ...card }));
  
  // Log the state after dealing
  logCardState([], dealt, [], remaining);
  
  // Additional validation to ensure no duplicates between dealt and remaining cards
  const allCards = [...dealt, ...remaining];
  if (!validateDeck(allCards)) {
    console.error('Deck validation failed during dealing');
    const freshDeck = getStandardDeck();
    const shuffledDeck = shuffleDeck(freshDeck);
    return dealCards(shuffledDeck, numCards);
  }
  
  return { dealt, remaining };
};