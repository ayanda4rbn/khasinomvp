import { Card } from '@/types/game';

// Initialize a single, standard deck that will be reused
const STANDARD_DECK: Card[] = [];
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Create the standard deck once
for (const suit of SUITS) {
  for (const value of VALUES) {
    STANDARD_DECK.push({
      suit,
      value,
      faceUp: false,
      selected: false,
    });
  }
}

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
  if (numCards > deck.length) {
    console.error('Attempting to deal more cards than available in deck');
    return { dealt: [], remaining: deck };
  }
  
  const dealt = deck.slice(0, numCards);
  const remaining = deck.slice(numCards);
  
  // Validate no duplicates in dealt cards
  const dealtKeys = new Set(dealt.map(card => `${card.value}-${card.suit}`));
  if (dealtKeys.size !== dealt.length) {
    console.error('Duplicate cards detected in dealt cards');
    return { dealt: [], remaining: deck };
  }
  
  return { dealt, remaining };
};

// Function to validate if a card exists in an array
export const isCardInArray = (card: Card, array: Card[]): boolean => {
  return array.some(c => c.value === card.value && c.suit === card.suit);
};

// Function to validate the entire deck state
export const validateDeckState = (
  tableCards: Card[], 
  playerHand: Card[], 
  aiHand: Card[], 
  deck: Card[]
): boolean => {
  const allCards = [...tableCards, ...playerHand, ...aiHand, ...deck];
  const cardKeys = new Set<string>();
  
  for (const card of allCards) {
    const key = `${card.value}-${card.suit}`;
    if (cardKeys.has(key)) {
      console.error(`Duplicate card found: ${key}`);
      return false;
    }
    cardKeys.add(key);
  }
  
  if (allCards.length !== 40) {
    console.error(`Invalid total number of cards: ${allCards.length}`);
    return false;
  }
  
  return true;
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
  
  // Validate deck state
  if (!validateDeckState(tableCards, playerHand, aiHand, deck)) {
    console.error('Invalid deck state detected!');
  }
};