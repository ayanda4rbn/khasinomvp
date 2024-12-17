import { Card } from '@/types/game';

// Create a single, immutable standard deck
const STANDARD_DECK: readonly Card[] = Object.freeze(
  ['hearts', 'diamonds', 'clubs', 'spades'].flatMap(suit => 
    Array.from({ length: 10 }, (_, i) => ({
      suit: suit as Card['suit'],
      value: i + 1,
      faceUp: false,
      selected: false
    }))
  )
);

// Function to validate the deck has exactly 40 unique cards
const validateDeck = (deck: Card[]): boolean => {
  if (deck.length !== 40) {
    console.error(`Invalid deck length: ${deck.length}`);
    return false;
  }

  const seen = new Set<string>();
  for (const card of deck) {
    const cardKey = `${card.value}-${card.suit}`;
    if (seen.has(cardKey)) {
      console.error(`Duplicate card found: ${cardKey}`);
      return false;
    }
    seen.add(cardKey);
  }

  return true;
};

// Helper function to check if a card exists in an array
export const isCardInArray = (card: Card, array: Card[]): boolean => {
  return array.some(c => c.value === card.value && c.suit === card.suit);
};

// Get a fresh copy of the standard deck
export const getStandardDeck = (): Card[] => {
  const deck = STANDARD_DECK.map(card => ({ ...card }));
  console.log('Fresh deck created with length:', deck.length);
  return deck;
};

// Fisher-Yates shuffle algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  if (!validateDeck(shuffled)) {
    console.error('Deck validation failed after shuffle');
    return getStandardDeck(); // Return a fresh deck if validation fails
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
  
  // Validate both dealt cards and remaining deck
  if (!validateDeck([...dealt, ...remaining])) {
    console.error('Deck validation failed during dealing');
    const freshDeck = getStandardDeck();
    return dealCards(freshDeck, numCards);
  }
  
  return { dealt, remaining };
};

// Debug function to log the current state of cards
export const logCardState = (
  tableCards: Card[], 
  playerHand: Card[], 
  aiHand: Card[], 
  deck: Card[]
) => {
  const allCards = [...tableCards, ...playerHand, ...aiHand, ...deck];
  console.log('Card Count Check:');
  console.log(`Table Cards: ${tableCards.length}`);
  console.log(`Player Hand: ${playerHand.length}`);
  console.log(`AI Hand: ${aiHand.length}`);
  console.log(`Remaining Deck: ${deck.length}`);
  console.log(`Total Cards: ${allCards.length}`);
  
  // Check for duplicates
  const seen = new Set<string>();
  const duplicates = allCards.filter(card => {
    const cardKey = `${card.value}-${card.suit}`;
    if (seen.has(cardKey)) {
      console.error(`Duplicate found: ${cardKey}`);
      return true;
    }
    seen.add(cardKey);
    return false;
  });
  
  if (duplicates.length > 0) {
    console.error('Duplicate cards found:', duplicates);
  }
};