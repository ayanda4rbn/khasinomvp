import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

export const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, isPlayerTurn: boolean) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    toast.error("It's not your turn!");
    return;
  }
  e.dataTransfer.setData('text/plain', index.toString());
};

export const handleBuildCapture = (
  card: Card,
  overlappingBuild: BuildType,
  playerHand: Card[],
  cardIndex: number,
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[]
) => {
  setPlayerChowedCards(prev => [...prev, ...overlappingBuild.cards, card]);
  setBuilds(builds.filter(build => build.id !== overlappingBuild.id));

  const newPlayerHand = [...playerHand];
  newPlayerHand.splice(cardIndex, 1);
  setPlayerHand(newPlayerHand);
  setIsPlayerTurn(false);
  toast.success("You captured a build!");
};

export const handleBuildAugment = (
  card: Card,
  overlappingBuild: BuildType,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[]
): boolean => {
  if (hasPlayerBuild) {
    toast.error("You cannot augment when you have an existing build!");
    return false;
  }

  const newBuildValue = overlappingBuild.value + card.value;
  if (newBuildValue <= 10 && newBuildValue < overlappingBuild.value * 2) {
    const allCards = [...overlappingBuild.cards, card].sort((a, b) => b.value - a.value);
    const updatedBuild: BuildType = {
      ...overlappingBuild,
      cards: allCards,
      value: newBuildValue,
      owner: 'player' // Take ownership when augmenting
    };
    setBuilds(builds.map(b => b.id === overlappingBuild?.id ? updatedBuild : b));

    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    toast.success("You augmented a build!");
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
    // Check if there's an existing build with the same value
    const buildValue = card.value + overlappingCard.value;
    const existingBuild = builds.find(b => b.owner === 'player' && b.value === buildValue);
    
    if (existingBuild) {
      // Add cards to existing build
      const updatedBuild = {
        ...existingBuild,
        cards: [...existingBuild.cards, overlappingCard, card].sort((a, b) => b.value - a.value)
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
      setTableCards(tableCards.filter(c => c !== overlappingCard));
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      return true;
    }
    
    toast.error("You cannot create multiple builds of different values!");
    return false;
  }

  const buildValue = card.value + overlappingCard.value;
  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    // Sort cards by value (higher values first)
    const buildCards = [overlappingCard, card].sort((a, b) => b.value - a.value);
    
    // Check for existing build with same value
    const existingBuild = builds.find(b => b.value === buildValue);
    if (existingBuild) {
      // Stack on existing build
      const updatedBuild = {
        ...existingBuild,
        cards: [...existingBuild.cards, ...buildCards].sort((a, b) => b.value - a.value),
        owner: 'player' // Take ownership when adding to existing build
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
    } else {
      const newBuild: BuildType = {
        id: Date.now(),
        cards: buildCards,
        value: buildValue,
        position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
        owner: 'player'
      };
      setBuilds([...builds, newBuild]);
    }
    
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    return true;
  }
  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
