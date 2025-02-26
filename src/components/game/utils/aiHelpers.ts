
import { Card, BuildType } from '@/types/game';

export const canCaptureCards = (card: Card, tableCards: Card[], builds: BuildType[]): { cards: Card[], builds: BuildType[] } => {
  console.log("[AI-CAPTURE] Checking capture possibilities:", {
    card: { value: card.value, suit: card.suit },
    tableCardsCount: tableCards.length,
    buildsCount: builds.length
  });

  const captureCards: Card[] = [];
  const captureBuilds: BuildType[] = [];

  // Check for single card captures
  tableCards.forEach(tableCard => {
    if (tableCard.value === card.value) {
      console.log("[AI-CAPTURE] Found matching card:", {
        value: tableCard.value,
        suit: tableCard.suit
      });
      captureCards.push(tableCard);
    }
  });

  // Check for build captures
  builds.forEach(build => {
    if (build.value === card.value) {
      console.log("[AI-CAPTURE] Found matching build:", {
        buildId: build.id,
        value: build.value,
        owner: build.owner
      });
      captureBuilds.push(build);
    }
  });

  console.log("[AI-CAPTURE] Capture possibilities found:", {
    matchingCards: captureCards.length,
    matchingBuilds: captureBuilds.length
  });

  return { cards: captureCards, builds: captureBuilds };
};

export const handleAIDiscard = (
  card: Card,
  tableCards: Card[],
  setTableCards: (cards: Card[]) => void
) => {
  console.log("[AI-DISCARD] AI discarding card:", {
    card: { value: card.value, suit: card.suit },
    currentTableCards: tableCards.length
  });

  const x = Math.random() * 400 + 50;
  const y = Math.random() * 200 + 50;

  console.log("[AI-DISCARD] Card position:", { x, y });

  setTableCards([...tableCards, { 
    ...card, 
    tableX: x, 
    tableY: y,
    playedBy: 'ai' as const,
    faceUp: true 
  }]);

  console.log("[AI-DISCARD] Card discarded successfully");
};
