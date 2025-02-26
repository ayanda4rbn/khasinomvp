
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

// Constants for table dimensions and constraints
const CARD_WIDTH = 48;
const CARD_HEIGHT = 64;
const PADDING = 20;
const GRID_SIZE = 20;

// Snap coordinate to grid
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// Constrain position within table boundaries
const constrainPosition = (x: number, y: number, tableRect: DOMRect) => {
  const maxX = tableRect.width - CARD_WIDTH - PADDING;
  const maxY = tableRect.height - CARD_HEIGHT - PADDING;
  
  return {
    x: snapToGrid(Math.max(PADDING, Math.min(x, maxX))),
    y: snapToGrid(Math.max(PADDING, Math.min(y, maxY)))
  };
};

export const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, isPlayerTurn: boolean) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData('text/plain', index.toString());
};

export const handleBuildCapture = (
  card: Card,
  build: BuildType,
  playerHand: Card[],
  cardIndex: number,
  setPlayerChowedCards: (cards: Card[]) => void,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[],
  playerChowedCards: Card[]
) => {
  // Check if player has another card of the same value for drift
  const hasAnotherSameValueCard = playerHand.some((c, i) => 
    i !== cardIndex && c.value === card.value
  );

  if (hasAnotherSameValueCard) {
    // Add the card to the top of the build and update ownership
    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, { ...card, playedBy: 'player' }],
      owner: 'player'
    };
    
    setBuilds(builds.map(b => b.id === build.id ? updatedBuild : b));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("Card added to build!");
  } else {
    // Capture the build
    const newChowedCards = [...build.cards, card];
    setPlayerChowedCards([...playerChowedCards, ...newChowedCards]);
    setBuilds(builds.filter(b => b.id !== build.id));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("Build captured!");
  }
};

export const handleBuildAugment = (
  card: Card,
  build: BuildType,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[]
): boolean => {
  const newSum = build.value + card.value;
  
  // Validate build augmentation
  const canAugment = (
    newSum <= 10 && 
    newSum < build.value * 2 && 
    playerHand.some(c => c.value === newSum) &&
    (build.owner === 'player' || !hasPlayerBuild)
  );

  if (canAugment) {
    // Update the build with the new card
    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, card],
      value: newSum,
      owner: 'player'
    };

    setBuilds(builds.map(b => b.id === build.id ? updatedBuild : b));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("Build augmented!");
    return true;
  }

  toast.error("Invalid build augmentation!");
  return false;
};

export const handleNewBuild = (
  card: Card,
  tableCard: Card,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setTableCards: (cards: Card[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  tableCards: Card[],
  builds: BuildType[]
): boolean => {
  if (hasPlayerBuild) {
    toast.error("You cannot create a new build when you have an existing build!");
    return false;
  }

  const buildValue = card.value + tableCard.value;
  
  // Validate build creation
  if (playerHand.some(c => c.value === buildValue)) {
    // Use tableCard's position for the new build, ensuring it's within bounds
    const { x, y } = constrainPosition(
      tableCard.tableX || PADDING,
      tableCard.tableY || PADDING,
      { width: 800, height: 400 } as DOMRect
    );

    const buildCards = [card, tableCard].sort((a, b) => b.value - a.value);

    const newBuild: BuildType = {
      id: Date.now(),
      cards: buildCards,
      value: buildValue,
      position: { x, y },
      owner: 'player'
    };

    setBuilds([...builds, newBuild]);
    setTableCards(tableCards.filter(c => c !== tableCard));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("New build created!");
    return true;
  }

  toast.error("Invalid build combination!");
  return false;
};

// Helper function to detect overlapping elements
export const detectOverlap = (rect1: DOMRect, rect2: DOMRect): boolean => {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
};

