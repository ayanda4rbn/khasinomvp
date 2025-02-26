
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

export const handleBuildAugment = async (
  card: Card,
  overlappingBuild: BuildType,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[],
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>
): Promise<boolean> => {
  const newBuildValue = overlappingBuild.value + card.value;
  if (newBuildValue <= 10 && playerHand.some(c => c.value === newBuildValue)) {
    const sortedNewCards = [overlappingBuild.cards[overlappingBuild.cards.length - 1], card]
      .sort((a, b) => b.value - a.value);
    
    const updatedCards = [
      ...overlappingBuild.cards.slice(0, -1),
      ...sortedNewCards
    ];
    
    const updatedBuild = {
      ...overlappingBuild,
      cards: updatedCards,
      value: newBuildValue,
      owner: 'player' as const
    };
    setBuilds(builds.map(b => b.id === overlappingBuild.id ? updatedBuild : b));
    
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
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  tableCards: Card[],
  builds: BuildType[]
): boolean => {
  // Check for matching values
  if (card.value === overlappingCard.value) {
    const buildValue = card.value * 2;
    const hasMatchingCard = playerHand.some(c => c.value === buildValue);
    
    // For values 5 or less, check if we can build
    if (card.value <= 5 && hasMatchingCard && !builds.some(b => b.value === buildValue)) {
      const shouldChow = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
      );

      if (shouldChow) {
        // Handle chow
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        toast.success(`Chowed ${card.value}`);
        return true;
      } else if (!hasPlayerBuild) {
        // Handle new build
        const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
        const newBuild: BuildType = {
          id: Date.now(),
          cards: buildCards,
          value: buildValue,
          position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
          owner: 'player' as const
        };
        setBuilds([...builds, newBuild]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        toast.success(`Created a build of ${buildValue}`);
        return true;
      } else {
        toast.error("You cannot create a new build when you have an existing build!");
        return false;
      }
    } else {
      // Always allow chowing matching cards, regardless of value or having a build
      setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
      setTableCards(tableCards.filter(c => c !== overlappingCard));
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      toast.success(`Chowed ${card.value}`);
      return true;
    }
  }

  // Handle non-matching cards
  const buildValue = card.value + overlappingCard.value;
  
  // Check if the build value already exists
  if (builds.some(b => b.value === buildValue)) {
    toast.error("Cannot build a value that already exists as a build!");
    return false;
  }

  // Prevent creating new builds in round 1 if player has an existing build
  if (hasPlayerBuild) {
    toast.error("You cannot create a new build when you have an existing build!");
    return false;
  }

  // Handle creating a new build
  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
    
    const newBuild: BuildType = {
      id: Date.now(),
      cards: buildCards,
      value: buildValue,
      position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
      owner: 'player' as const
    };
    setBuilds([...builds, newBuild]);
    
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    return true;
  }

  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
