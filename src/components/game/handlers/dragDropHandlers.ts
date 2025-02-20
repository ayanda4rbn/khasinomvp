
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
  if (overlappingBuild.owner === 'player') {
    toast.error("You cannot augment your own build!");
    return false;
  }

  const newBuildValue = overlappingBuild.value + card.value;
  if (newBuildValue <= 10 && newBuildValue < overlappingBuild.value * 2 && playerHand.some(c => c.value === newBuildValue)) {
    if (overlappingBuild.owner === 'ai' && hasPlayerBuild) {
      toast.error("You cannot augment when you have an existing build!");
      return false;
    }

    const allCards = [...overlappingBuild.cards, card].sort((a, b) => b.value - a.value);
    const updatedBuild: BuildType = {
      ...overlappingBuild,
      cards: [...overlappingBuild.cards, card],
      value: newBuildValue,
      owner: 'player' as const
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
): boolean => {
  if (hasPlayerBuild) {
    const buildValue = card.value + overlappingCard.value;
    const existingBuild = builds.find(b => b.owner === 'player' && b.value === buildValue);
    
    if (existingBuild) {
      // Add new cards at the end of the existing build's cards array
      const updatedBuild: BuildType = {
        ...existingBuild,
        cards: [...existingBuild.cards, overlappingCard, card]
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
    // Create new build with cards in the order they were played
    const buildCards = [overlappingCard, card];
    
    const existingBuild = builds.find(b => b.value === buildValue);
    if (existingBuild) {
      const updatedBuild: BuildType = {
        ...existingBuild,
        cards: [...existingBuild.cards, ...buildCards],
        owner: 'player' as const
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
    } else {
      const newBuild: BuildType = {
        id: Date.now(),
        cards: buildCards,
        value: buildValue,
        position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
        owner: 'player' as const
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
