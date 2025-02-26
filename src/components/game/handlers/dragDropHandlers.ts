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
  // Check if this would make the same value as an existing build
  const newBuildValue = overlappingBuild.value + card.value;
  const existingBuildOfSameValue = builds.find(b => 
    b.id !== overlappingBuild.id && b.value === newBuildValue
  );

  if (existingBuildOfSameValue) {
    toast.error("Cannot create another build of the same value!");
    return false;
  }

  // Allow augmenting if it would make a valid build and we have the matching card
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
  // Check for matching values first (potential chow or compound build)
  if (card.value === overlappingCard.value) {
    const buildValue = card.value * 2;
    const hasMatchingCard = playerHand.some(c => c.value === buildValue);
    const existingBuild = builds.find(b => b.value === buildValue);
    
    // For values 5 or less, we need to ask the player if they want to chow or augment
    if (card.value <= 5 && hasMatchingCard) {
      const shouldChow = window.confirm(
        `Do you want to chow ${card.value} (OK) or build ${buildValue} (Cancel)?`
      );

      if (shouldChow) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
      } else {
        const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
        const newBuild: BuildType = {
          id: Date.now(),
          cards: buildCards,
          value: buildValue,
          position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
          owner: 'player'
        };
        setBuilds([...builds, newBuild]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
      }
    } else {
      // For values above 5 or when player doesn't have the matching card, automatically chow
      setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
      setTableCards(tableCards.filter(c => c !== overlappingCard));
    }
    
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    return true;
  }

  // Handle non-matching cards (potential build)
  const buildValue = card.value + overlappingCard.value;
  const existingBuild = builds.find(b => b.value === buildValue);

  // If there's an existing build of this value
  if (existingBuild) {
    if (existingBuild.owner === 'player') {
      // Add to existing compound build
      const updatedBuild = {
        ...existingBuild,
        cards: [...existingBuild.cards, card, overlappingCard].sort((a, b) => b.value - a.value),
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
      setTableCards(tableCards.filter(c => c !== overlappingCard));
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      toast.success(`Added to your ${buildValue} build`);
      return true;
    } else {
      toast.error(`Cannot create another ${buildValue} build. Try capturing or augmenting the existing one.`);
      return false;
    }
  }

  // Create new build if no existing build of this value
  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
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
    setIsPlayerTurn(false);
    toast.success(`Created a build of ${buildValue}`);
    return true;
  }

  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
