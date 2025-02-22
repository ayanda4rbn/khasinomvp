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

    // Sort cards by value in descending order (small cards on top)
    const allCards = [...overlappingBuild.cards, card].sort((a, b) => a.value - b.value);
    const updatedBuild: BuildType = {
      ...overlappingBuild,
      cards: allCards,
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
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  tableCards: Card[],
  builds: BuildType[]
): boolean => {
  // Check if it's a potential chow (matching card values ≤ 6)
  if (card.value <= 6 && card.value === overlappingCard.value) {
    // For values 6 and above, directly handle as chow
    if (card.value >= 6) {
      setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
      setTableCards(tableCards.filter(c => c !== overlappingCard));
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      toast.success(`Chowed ${card.value}`);
      return true;
    }

    // For values below 6, show choice dialog only if player has the sum value
    if (playerHand.some(c => c.value === card.value * 2)) {
      const dialog = window.confirm(
        `Do you want to build a ${card.value * 2} (OK) or chow the ${card.value} (Cancel)?`
      );

      if (!dialog) {
        // Handle as chow
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
      // Automatically chow if sum value not in hand
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
  
  // Check if AI already has a build with this value
  if (builds.some(b => b.owner === 'ai' && b.value === buildValue)) {
    toast.error("Cannot build a value that your opponent has already built!");
    return false;
  }

  // Check if it's a potential chow (matching card values ≤ 5)
  if (card.value <= 5 && card.value === overlappingCard.value) {
    // If player has the sum value in hand, show choice dialog
    if (playerHand.some(c => c.value === card.value * 2)) {
      const dialog = window.confirm(
        `Do you want to build a ${card.value * 2} (OK) or chow the ${card.value} (Cancel)?`
      );

      if (!dialog) {
        // Handle as chow
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
      // Automatically chow if sum value not in hand
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

  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    // Create new build with cards sorted by value (small cards on top)
    const buildCards = [overlappingCard, card].sort((a, b) => a.value - b.value);
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
    return true;
  }
  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
