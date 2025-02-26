import { Card } from '@/types/game';
import { getStandardDeck } from './deckCore';

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck: Card[], count: number): { dealt: Card[], remaining: Card[] } => {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
};

export const ensureFairDistribution = (playerCards: Card[], aiCards: Card[]): [Card[], Card[]] => {
  // Count tens in each hand
  const playerTens = playerCards.filter(card => card.value === 10).length;
  const aiTens = aiCards.filter(card => card.value === 10).length;

  // If distribution is fair (difference of 1 or less), return original hands
  if (Math.abs(playerTens - aiTens) <= 1) {
    return [playerCards, aiCards];
  }

  // Otherwise, redistribute cards until tens are fairly distributed
  let newPlayerCards = [...playerCards];
  let newAiCards = [...aiCards];
  
  while (Math.abs(
    newPlayerCards.filter(card => card.value === 10).length -
    newAiCards.filter(card => card.value === 10).length
  ) > 1) {
    // Combine and reshuffle
    const allCards = [...newPlayerCards, ...newAiCards];
    const shuffled = shuffleDeck(allCards);
    
    // Redistribute
    newPlayerCards = shuffled.slice(0, playerCards.length);
    newAiCards = shuffled.slice(playerCards.length);
  }

  return [newPlayerCards, newAiCards];
};
