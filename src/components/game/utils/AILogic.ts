import { Card } from '@/types/game';
import { toast } from "sonner";

// Helper function to check if a card can capture any cards on the table
const canCaptureCards = (card: Card, tableCards: Card[]): Card[] => {
  return tableCards.filter(tableCard => tableCard.value === card.value);
};

// Helper function to find the best move for AI
const findBestMove = (aiHand: Card[], tableCards: Card[]): { card: Card, captureCards: Card[] } | null => {
  // Priority 1: Capture valuable cards (Aces, 2 of spades, 10 of diamonds)
  for (const aiCard of aiHand) {
    const capturableCards = canCaptureCards(aiCard, tableCards);
    const hasValuableCapture = capturableCards.some(card => 
      (card.value === 1) || 
      (card.value === 2 && card.suit === 'spades') || 
      (card.value === 10 && card.suit === 'diamonds')
    );
    
    if (hasValuableCapture) {
      return { card: aiCard, captureCards: capturableCards };
    }
  }

  // Priority 2: Capture spades
  for (const aiCard of aiHand) {
    const capturableCards = canCaptureCards(aiCard, tableCards);
    const hasSpadesCapture = capturableCards.some(card => card.suit === 'spades');
    
    if (hasSpadesCapture) {
      return { card: aiCard, captureCards: capturableCards };
    }
  }

  // Priority 3: Regular captures
  for (const aiCard of aiHand) {
    const capturableCards = canCaptureCards(aiCard, tableCards);
    if (capturableCards.length > 0) {
      return { card: aiCard, captureCards: capturableCards };
    }
  }

  // If no captures possible, play the lowest value card
  if (aiHand.length > 0) {
    const lowestCard = aiHand.reduce((prev, curr) => 
      prev.value <= curr.value ? prev : curr
    );
    return { card: lowestCard, captureCards: [] };
  }

  return null;
};

export const handleAITurn = (
  tableCards: Card[],
  aiHand: Card[],
  setTableCards: (cards: Card[]) => void,
  setAiHand: (cards: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void
) => {
  const move = findBestMove(aiHand, tableCards);

  if (!move) {
    toast.error("AI has no valid moves");
    setIsPlayerTurn(true);
    return;
  }

  if (move.captureCards.length > 0) {
    // Capture cards
    setTableCards(tableCards.filter(card => 
      !move.captureCards.some(captureCard => 
        captureCard.value === card.value && 
        captureCard.suit === card.suit
      )
    ));
    toast.success("AI captured cards!");
  } else {
    // Place card on table
    const x = Math.random() * 400 + 50;
    const y = Math.random() * 200 + 50;
    
    setTableCards([...tableCards, { 
      ...move.card, 
      tableX: x, 
      tableY: y,
      playedBy: 'ai' as const,
      faceUp: true 
    }]);
    toast.info("AI placed a card");
  }

  // Remove played card from AI's hand
  setAiHand(aiHand.filter(card => 
    card.value !== move.card.value || 
    card.suit !== move.card.suit
  ));

  setIsPlayerTurn(true);
};