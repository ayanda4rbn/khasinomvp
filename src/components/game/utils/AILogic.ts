import { Card } from '@/types/game';
import { toast } from "sonner";
import { isCardInArray } from './deckManager';

export const handleAITurn = (
  tableCards: Card[],
  playerHand: Card[],
  setTableCards: (cards: Card[]) => void,
  setPlayerHand: (cards: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void
) => {
  // Filter out cards that are already on the table
  const availableCards = playerHand.filter(card => !isCardInArray(card, tableCards));

  if (availableCards.length === 0) {
    toast.error("AI has no valid cards to play");
    setIsPlayerTurn(true);
    return;
  }

  const aiCardIndex = Math.floor(Math.random() * availableCards.length);
  const aiCard = availableCards[aiCardIndex];

  let x, y;
  let isValidPosition = false;
  const maxAttempts = 50;
  let attempts = 0;

  while (!isValidPosition && attempts < maxAttempts) {
    x = Math.random() * 400 + 50;
    y = Math.random() * 200 + 50;

    isValidPosition = !tableCards.some(existingCard => {
      const existingX = existingCard.tableX || 0;
      const existingY = existingCard.tableY || 0;
      return (
        x < existingX + 48 &&
        x + 48 > existingX &&
        y < existingY + 64 &&
        y + 64 > existingY
      );
    });

    attempts++;
  }

  if (isValidPosition) {
    const newCard: Card = {
      ...aiCard,
      tableX: x,
      tableY: y,
      playedBy: 'ai' as const
    };

    // Double-check that this card isn't already on the table
    if (isCardInArray(newCard, tableCards)) {
      console.error('Attempted to play duplicate card:', newCard);
      setIsPlayerTurn(true);
      return;
    }

    setTableCards([...tableCards, newCard]);

    const newPlayerHand = playerHand.filter(card => 
      !(card.value === aiCard.value && card.suit === aiCard.suit)
    );
    setPlayerHand(newPlayerHand);

    toast.info("AI discarded a card");
    setIsPlayerTurn(true);
  } else {
    toast.error("AI couldn't find a valid position to place the card");
    setIsPlayerTurn(true);
  }
};