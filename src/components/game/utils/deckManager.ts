import { Card } from '@/types/game';

const STANDARD_DECK: Card[] = [];
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Initialize the standard deck once
SUITS.forEach(suit => {
  VALUES.forEach(value => {
    STANDARD_DECK.push({
      suit,
      value,
      faceUp: false,
      selected: false,
    });
  });
});

// Function to get a fresh copy of the standard deck
export const getStandardDeck = (): Card[] => {
  return STANDARD_DECK.map(card => ({ ...card }));
};

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
  const dealt = deck.slice(0, numCards);
  const remaining = deck.slice(numCards);
  return { dealt, remaining };
};

// Validation function to check if a card exists in an array
export const isCardInArray = (card: Card, array: Card[]): boolean => {
  return array.some(c => c.value === card.value && c.suit === card.suit);
};

// Debug function to log the current state of cards
export const logCardState = (
  tableCards: Card[], 
  playerHand: Card[], 
  aiHand: Card[], 
  deck: Card[]
) => {
  console.log('Card Count Check:');
  console.log(`Table Cards: ${tableCards.length}`);
  console.log(`Player Hand: ${playerHand.length}`);
  console.log(`AI Hand: ${aiHand.length}`);
  console.log(`Remaining Deck: ${deck.length}`);
  console.log(`Total Cards: ${tableCards.length + playerHand.length + aiHand.length + deck.length}`);
};