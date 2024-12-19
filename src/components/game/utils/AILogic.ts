import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

// Helper function to check if a card can capture any cards on the table
const canCaptureCards = (card: Card, tableCards: Card[], builds: BuildType[]): { cards: Card[], builds: BuildType[] } => {
  const captureCards: Card[] = [];
  const captureBuilds: BuildType[] = [];

  // Check for single card captures
  tableCards.forEach(tableCard => {
    if (tableCard.value === card.value) {
      captureCards.push(tableCard);
    }
  });

  // Check for build captures
  builds.forEach(build => {
    if (build.value === card.value) {
      captureBuilds.push(build);
    }
  });

  return { cards: captureCards, builds: captureBuilds };
};

// Helper function to find the best move for AI
const findBestMove = (
  aiHand: Card[], 
  tableCards: Card[], 
  builds: BuildType[]
): { 
  type: 'capture' | 'build' | 'discard',
  card: Card,
  captureCards?: Card[],
  captureBuilds?: BuildType[],
  buildWith?: Card
} | null => {
  // Priority 1: Capture valuable cards (Aces, 2 of spades, 10 of diamonds)
  for (const aiCard of aiHand) {
    const { cards: capturableCards, builds: capturableBuilds } = canCaptureCards(aiCard, tableCards, builds);
    const hasValuableCapture = capturableCards.some(card => 
      (card.value === 1) || 
      (card.value === 2 && card.suit === 'spades') || 
      (card.value === 10 && card.suit === 'diamonds')
    );
    
    if (hasValuableCapture) {
      return { 
        type: 'capture',
        card: aiCard,
        captureCards: capturableCards,
        captureBuilds: capturableBuilds
      };
    }
  }

  // Priority 2: Capture spades
  for (const aiCard of aiHand) {
    const { cards: capturableCards, builds: capturableBuilds } = canCaptureCards(aiCard, tableCards, builds);
    const hasSpadesCapture = capturableCards.some(card => card.suit === 'spades');
    
    if (hasSpadesCapture) {
      return { 
        type: 'capture',
        card: aiCard,
        captureCards: capturableCards,
        captureBuilds: capturableBuilds
      };
    }
  }

  // Priority 3: Build if possible (only if AI has the matching card)
  for (const aiCard of aiHand) {
    for (const tableCard of tableCards) {
      const sum = aiCard.value + tableCard.value;
      if (sum <= 10 && aiHand.some(card => card.value === sum)) {
        return {
          type: 'build',
          card: aiCard,
          buildWith: tableCard
        };
      }
    }
  }

  // Priority 4: Regular captures
  for (const aiCard of aiHand) {
    const { cards: capturableCards, builds: capturableBuilds } = canCaptureCards(aiCard, tableCards, builds);
    if (capturableCards.length > 0 || capturableBuilds.length > 0) {
      return { 
        type: 'capture',
        card: aiCard,
        captureCards: capturableCards,
        captureBuilds: capturableBuilds
      };
    }
  }

  // If no other moves possible, discard the lowest value card
  if (aiHand.length > 0) {
    const lowestCard = aiHand.reduce((prev, curr) => 
      prev.value <= curr.value ? prev : curr
    );
    return { 
      type: 'discard',
      card: lowestCard
    };
  }

  return null;
};

export const handleAITurn = (
  tableCards: Card[],
  aiHand: Card[],
  builds: BuildType[],
  setTableCards: (cards: Card[]) => void,
  setAiHand: (cards: Card[]) => void,
  setBuilds: (builds: BuildType[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void
) => {
  const move = findBestMove(aiHand, tableCards, builds);

  if (!move) {
    toast.error("AI has no valid moves");
    setIsPlayerTurn(true);
    return;
  }

  switch (move.type) {
    case 'capture':
      if (move.captureCards?.length) {
        // Add captured cards to AI's chowed pile face up
        setTableCards(tableCards.filter(card => 
          !move.captureCards?.some(captureCard => 
            captureCard.value === card.value && 
            captureCard.suit === card.suit
          )
        ));
      }
      if (move.captureBuilds?.length) {
        setBuilds(builds.filter(build => 
          !move.captureBuilds?.some(captureBuild => 
            captureBuild.id === build.id
          )
        ));
      }
      toast.success("AI captured cards!");
      break;

    case 'build':
      if (move.buildWith) {
        // Check if AI has the matching card before building
        const buildValue = move.card.value + move.buildWith.value;
        if (aiHand.some(card => card.value === buildValue)) {
          const x = Math.random() * 400 + 50;
          const y = Math.random() * 200 + 50;
          const newBuild: BuildType = {
            id: Date.now(),
            cards: [move.card, move.buildWith],
            value: buildValue,
            position: { x, y },
            owner: 'ai'
          };
          setBuilds([...builds, newBuild]);
          setTableCards(tableCards.filter(card => 
            card.value !== move.buildWith.value || 
            card.suit !== move.buildWith.suit
          ));
          toast.info("AI created a build!");
        } else {
          // If AI doesn't have the matching card, discard instead
          handleAIDiscard(move.card, tableCards, setTableCards);
        }
      }
      break;

    case 'discard':
      handleAIDiscard(move.card, tableCards, setTableCards);
      toast.info("AI discarded a card");
      break;
  }

  setAiHand(aiHand.filter(card => 
    card.value !== move.card.value || 
    card.suit !== move.card.suit
  ));

  setIsPlayerTurn(true);
};

const handleAIDiscard = (
  card: Card,
  tableCards: Card[],
  setTableCards: (cards: Card[]) => void
) => {
  const x = Math.random() * 400 + 50;
  const y = Math.random() * 200 + 50;
  setTableCards([...tableCards, { 
    ...card, 
    tableX: x, 
    tableY: y,
    playedBy: 'ai' as const,
    faceUp: true 
  }]);
};
