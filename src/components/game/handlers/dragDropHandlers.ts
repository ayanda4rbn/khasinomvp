
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
  // Keep build order and add capturing card on top
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
  // Allow augmenting your own build
  const newBuildValue = overlappingBuild.value + card.value;
  if (newBuildValue <= 10 && playerHand.some(c => c.value === newBuildValue)) {
    // Sort only the new combination being added
    const sortedNewCards = [overlappingBuild.cards[overlappingBuild.cards.length - 1], card]
      .sort((a, b) => b.value - a.value);
    
    // Remove the last card from the existing build and add the new sorted combination
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
    // Check if the matched value could be used to build an existing build value
    const existingBuildValues = builds
      .filter(b => b.owner === 'player')
      .map(b => b.value);
    
    const canBuildExisting = existingBuildValues.some(value => card.value * 2 === value);
    
    if (canBuildExisting) {
      const shouldChow = window.confirm(
        `Do you want to chow the ${card.value} (OK) or use it to build ${card.value * 2} (Cancel)?`
      );

      if (shouldChow) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        toast.success(`Chowed ${card.value}`);
        return true;
      } else {
        // Find the existing build to add to
        const targetBuild = builds.find(b => b.value === card.value * 2);
        if (targetBuild) {
          const sortedNewCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
          const updatedBuild = {
            ...targetBuild,
            cards: [...targetBuild.cards, ...sortedNewCards],
            owner: 'player' as const
          };
          setBuilds(builds.map(b => b.id === targetBuild.id ? updatedBuild : b));
          setTableCards(tableCards.filter(c => c !== overlappingCard));
          const newPlayerHand = [...playerHand];
          newPlayerHand.splice(cardIndex, 1);
          setPlayerHand(newPlayerHand);
          setIsPlayerTurn(false);
          toast.success("Added to existing build!");
          return true;
        }
      }
    }
    
    // If player has an active build and we're not building with the matched cards, must chow
    if (hasPlayerBuild || card.value > 5) {
      setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
      setTableCards(tableCards.filter(c => c !== overlappingCard));
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      toast.success(`Chowed ${card.value}`);
      return true;
    }
    
    // For values 5 and below without active build, show choice dialog
    if (playerHand.some(c => c.value === card.value * 2)) {
      const shouldChow = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build a ${card.value * 2} (Cancel)?`
      );

      if (shouldChow) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        toast.success(`Chowed ${card.value}`);
        return true;
      }
    } else {
      // If no build value available, must chow
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

  const buildValue = card.value + overlappingCard.value;
  
  // Check if there's an existing build with the same value
  const existingBuild = builds.find(b => b.value === buildValue);
  
  if (existingBuild) {
    // Sort only the new combination being added
    const sortedNewCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
    
    const updatedBuild = {
      ...existingBuild,
      cards: [...existingBuild.cards, ...sortedNewCards],
      owner: 'player' as const
    };
    
    setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    toast.success("Added to existing build!");
    return true;
  }

  // No existing build found, create a new one if valid
  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    // Sort only the initial combination
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
