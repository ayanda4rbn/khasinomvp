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

// Constants for table dimensions (in pixels)
const TABLE_PADDING = 20; // Padding from table edges
const CARD_WIDTH = 48;
const CARD_HEIGHT = 64;

export const getRandomTablePosition = (tableWidth: number, tableHeight: number) => {
  // Calculate safe boundaries that keep cards fully within the table
  const minX = TABLE_PADDING;
  const maxX = tableWidth - CARD_WIDTH - TABLE_PADDING;
  const minY = TABLE_PADDING;
  const maxY = tableHeight - CARD_HEIGHT - TABLE_PADDING;

  // Ensure we don't get negative values if the table is too small
  const safeX = Math.max(minX, Math.min(maxX, Math.floor(Math.random() * maxX)));
  const safeY = Math.max(minY, Math.min(maxY, Math.floor(Math.random() * maxY)));

  return { x: safeX, y: safeY };
};

export const handleAIDiscard = (
  card: Card,
  tableCards: Card[],
  setTableCards: (cards: Card[]) => void
) => {
  // Use standard table dimensions, adjust these if your table size differs
  const TABLE_WIDTH = 800;
  const TABLE_HEIGHT = 400;
  
  const { x, y } = getRandomTablePosition(TABLE_WIDTH, TABLE_HEIGHT);
  
  setTableCards([...tableCards, { 
    ...card, 
    tableX: x, 
    tableY: y,
    playedBy: 'ai' as const,
    faceUp: true 
  }]);
};
