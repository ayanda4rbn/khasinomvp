import { Card, BuildType } from '@/types/game';

export const canCaptureCards = (card: Card, tableCards: Card[], builds: BuildType[]): { cards: Card[], builds: BuildType[] } => {
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

export const handleAIDiscard = (
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