import { Card } from '@/types/game';

// Function to validate the deck has exactly 40 unique cards
export const validateDeck = (deck: Card[]): boolean => {
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

  // Validate that we have all required cards
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = Array.from({ length: 10 }, (_, i) => i + 1);
  
  for (const suit of suits) {
    for (const value of values) {
      const cardKey = `${value}-${suit}`;
      if (!seen.has(cardKey)) {
        console.error(`Missing card: ${cardKey}`);
        return false;
      }
    }
  }

  return true;
};

// Helper function to check if a card exists in an array
export const isCardInArray = (card: Card, array: Card[]): boolean => {
  return array.some(c => 
    c.value === card.value && 
    c.suit === card.suit
  );
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
  const seen = new Map<string, Card[]>();
  allCards.forEach(card => {
    const cardKey = `${card.value}-${card.suit}`;
    if (!seen.has(cardKey)) {
      seen.set(cardKey, [card]);
    } else {
      seen.get(cardKey)?.push(card);
    }
  });
  
  // Log any duplicates found
  seen.forEach((cards, cardKey) => {
    if (cards.length > 1) {
      console.error(`Duplicate found for ${cardKey}:`, cards);
    }
  });
};