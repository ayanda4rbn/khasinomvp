
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

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
  builds: BuildType[]
) => {
  // Create a new array with all cards to be chowed
  const newChowedCards = card ? [...build.cards, card] : build.cards;
  
  setPlayerChowedCards(prevChowedCards => [...prevChowedCards, ...newChowedCards]);
  setBuilds(builds.filter(b => b.id !== build.id));
  setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
  setIsPlayerTurn(false);
  toast.success("You captured a build!");
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
  builds: BuildType[],
  setPlayerChowedCards: (cards: Card[]) => void
): boolean => {
  const newSum = build.value + card.value;
  
  // Allow augmenting if the player has the capturing card for the new sum
  if (newSum <= 10 && newSum < build.value * 2 && playerHand.some(c => c.value === newSum)) {
    // Add the card to the build and update its value
    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, card],
      value: newSum,
      owner: 'player' // Transfer ownership to the player
    };

    setBuilds(builds.map(b => b.id === build.id ? updatedBuild : b));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
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
  setPlayerChowedCards: (cards: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  tableCards: Card[],
  builds: BuildType[]
): boolean => {
  if (hasPlayerBuild) {
    toast.error("You cannot create a new build when you have an existing build!");
    return false;
  }

  const buildValue = card.value + tableCard.value;
  if (playerHand.some(c => c.value === buildValue)) {
    const x = Math.random() * 400 + 50;
    const y = Math.random() * 200 + 50;

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
    toast.info("You created a build!");
    return true;
  }
  return false;
};
