import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

export const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, isPlayerTurn: boolean) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData('text/plain', index.toString());
};

export const handleNewBuild = (
  card: Card,
  overlappingCard: Card,
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
    toast.error("You can only have one build at a time!");
    return false;
  }

  if (card.value === overlappingCard.value) {
    const newBuild: BuildType = {
      id: Date.now(),
      cards: [{ ...overlappingCard, playedBy: 'player' }, { ...card, playedBy: 'player' }],
      value: card.value * 2,
      owner: 'player',
      position: {
        x: overlappingCard.tableX || 20,
        y: overlappingCard.tableY || 20,
      }
    };

    setBuilds([...builds, newBuild]);
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("New build created!");
    return true;
  }

  return false;
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
): boolean => {
  if (card.value === build.value) {
    setPlayerChowedCards([...playerChowedCards, ...build.cards, card]);
    setBuilds(builds.filter(b => b.id !== build.id));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("Build captured!");
    return true;
  }

  return false;
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
  // Fix compound build logic
  const targetSum = build.value + card.value;
  
  // Updated validation for compound builds
  const canAugment = (
    targetSum <= 14 && // Allow builds up to 14
    build.owner === 'player' && // Can only augment own builds
    playerHand.some(c => c.value === targetSum) // Must have capturing card
  );

  if (canAugment) {
    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, { ...card, playedBy: 'player' }],
      value: targetSum,
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

export const detectOverlap = (rect1: DOMRect, rect2: DOMRect): boolean => {
  return !(rect1.right < rect2.left ||
           rect1.left > rect2.right ||
           rect1.bottom < rect2.top ||
           rect1.top > rect2.bottom);
};
