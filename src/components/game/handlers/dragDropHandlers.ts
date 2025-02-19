
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

export const handleDragStart = (
  e: React.DragEvent<HTMLDivElement>,
  cardIndex: number,
  isPlayerTurn: boolean
) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    toast.error("It's not your turn!");
    return;
  }
  e.dataTransfer.setData('text/plain', cardIndex.toString());
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
  builds: BuildType[]
) => {
  const sortedBuildCards = [...build.cards].sort((a, b) => a.value - b.value);
  setPlayerChowedCards(prev => [...prev, ...sortedBuildCards, card]);
  setBuilds(builds.filter(b => b.id !== build.id));
  const newPlayerHand = [...playerHand];
  newPlayerHand.splice(cardIndex, 1);
  setPlayerHand(newPlayerHand);
  setIsPlayerTurn(false);
  toast.success("Build captured!");
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
) => {
  const newBuildValue = build.value + card.value;
  if (newBuildValue <= 10 && newBuildValue < build.value * 2 && playerHand.some(c => c.value === newBuildValue)) {
    if (build.owner === 'ai' && hasPlayerBuild) {
      toast.error("You cannot augment when you have an existing build!");
      return false;
    }

    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, card],
      value: newBuildValue,
      owner: 'player'
    };
    setBuilds(builds.map(b => b.id === build.id ? updatedBuild : b));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    toast.success("Build augmented!");
    return true;
  }
  return false;
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
  tableCards: Card[],
  builds: BuildType[]
) => {
  if (hasPlayerBuild) {
    toast.error("You cannot create multiple builds at the same time!");
    return false;
  }

  const buildValue = card.value + overlappingCard.value;
  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    const buildCards = [overlappingCard, card].sort((a, b) => b.value - a.value);
    
    const newBuild: BuildType = {
      id: Date.now(),
      cards: buildCards,
      value: buildValue,
      position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
      owner: 'player'
    };
    
    setBuilds([...builds, newBuild]);
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    return true;
  }
  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
