
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
  // Sort cards before adding to chowed cards (big to small)
  const sortedCards = [...overlappingBuild.cards, card].sort((a, b) => b.value - a.value);
  setPlayerChowedCards(prev => [...prev, ...sortedCards]);
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
  if (overlappingBuild.owner === 'player') {
    toast.error("You cannot augment your own build!");
    return false;
  }

  // If the card value matches the build value and it's 5 or less
  if (card.value === overlappingBuild.value && card.value <= 5) {
    const shouldChow = window.confirm(
      `Do you want to chow the ${card.value} (OK) or augment the build (Cancel)?`
    );

    if (shouldChow) {
      // Handle as chow
      setPlayerChowedCards(prev => [...prev, ...overlappingBuild.cards, card]);
      setBuilds(builds.filter(b => b.id !== overlappingBuild.id));
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      return true;
    }
  }

  const newBuildValue = overlappingBuild.value + card.value;
  if (newBuildValue <= 10 && playerHand.some(c => c.value === newBuildValue)) {
    if (overlappingBuild.owner === 'ai' && hasPlayerBuild) {
      toast.error("You cannot augment when you have an existing build!");
      return false;
    }

    // Check if there's an existing build with the same value
    const existingBuild = builds.find(b => b.value === overlappingBuild.value && b.id !== overlappingBuild.id);
    if (existingBuild) {
      // Combine the builds
      const allCards = [...existingBuild.cards, ...overlappingBuild.cards, card].sort((a, b) => b.value - a.value);
      const updatedBuild = {
        ...existingBuild,
        cards: allCards,
        value: newBuildValue,
        owner: 'player' as const
      };
      setBuilds(builds.filter(b => b.id !== overlappingBuild.id && b.id !== existingBuild.id).concat(updatedBuild));
    } else {
      // Sort cards by value (big to small)
      const allCards = [...overlappingBuild.cards, card].sort((a, b) => b.value - a.value);
      const updatedBuild = {
        ...overlappingBuild,
        cards: allCards,
        value: newBuildValue,
        owner: 'player' as const
      };
      setBuilds(builds.map(b => b.id === overlappingBuild.id ? updatedBuild : b));
    }

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
    // For values 5 and below, show choice dialog if player has the sum value
    if (card.value <= 5 && playerHand.some(c => c.value === card.value * 2)) {
      const shouldChow = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build a ${card.value * 2} (Cancel)?`
      );

      if (shouldChow) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card].sort((a, b) => b.value - a.value));
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        toast.success(`Chowed ${card.value}`);
        return true;
      }
    } else {
      // Handle as chow for values 6 and above
      setPlayerChowedCards(prev => [...prev, overlappingCard, card].sort((a, b) => b.value - a.value));
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
  
  if (builds.some(b => b.owner === 'ai' && b.value === buildValue)) {
    toast.error("Cannot build a value that your opponent has already built!");
    return false;
  }

  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    // Check for existing build with the same value
    const existingBuild = builds.find(b => b.value === buildValue);
    if (existingBuild) {
      // Add to existing build
      const updatedBuild = {
        ...existingBuild,
        cards: [...existingBuild.cards, overlappingCard, card].sort((a, b) => b.value - a.value),
        owner: 'player' as const
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
    } else {
      // Create new build with cards sorted (big to small)
      const buildCards = [overlappingCard, card].sort((a, b) => b.value - a.value);
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
    setIsPlayerTurn(false);
    return true;
  }
  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
