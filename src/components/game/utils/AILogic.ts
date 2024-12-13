import { Card } from '@/types/game';
import { toast } from "sonner";

export const handleAITurn = (
  tableCards: Card[],
  playerHand: Card[],
  setTableCards: (cards: Card[]) => void,
  setPlayerHand: (cards: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void
) => {
  const aiCardIndex = Math.floor(Math.random() * playerHand.length);
  const aiCard = playerHand[aiCardIndex];

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

    setTableCards([...tableCards, newCard]);

    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(aiCardIndex, 1);
    setPlayerHand(newPlayerHand);

    toast.info("AI discarded a card");
    setIsPlayerTurn(true);
  } else {
    toast.error("AI couldn't find a valid position to place the card");
    setIsPlayerTurn(true);
  }
};