
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
  const existingBuildOfSameValue = builds.find(b => 
    b.id !== overlappingBuild.id && b.value === newBuildValue
  );

  if (existingBuildOfSameValue) {
    toast.error("Cannot create another build of the same value!");
    return false;
  }

  if (newBuildValue <= 10 && playerHand.some(c => c.value === newBuildValue)) {
    // For augments, sort with lowest value at top
    const updatedCards = [
      ...overlappingBuild.cards,
      card
    ].sort((a, b) => a.value - b.value); // Ascending order: smaller values on top
    
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
    const playerExistingBuild = builds.find(b => b.owner === 'player');
    
    // If the overlapping card belongs to opponent's build and its value is ≤ 5
    if (overlappingCard.value <= 5) {
      // If player has a build and the buildValue is not equal to the player's existing build value
      if (playerExistingBuild && buildValue !== playerExistingBuild.value) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        toast.success("Cards chowed!");
        return true;
      }
      // If no existing build or if buildValue equals player's existing build value
      else if (hasMatchingCard && !existingBuild) {
        const shouldChow = window.confirm(
          `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
        );

        if (shouldChow) {
          setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        } else {
          const buildCards = [overlappingCard, card].sort((a, b) => a.value - b.value); // Sort ascending for new builds
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
        
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
        setIsPlayerTurn(false);
        return true;
      }
    }
    
    // If there's an existing build of this value
    if (existingBuild) {
      if (existingBuild.owner === 'player') {
        // Add to player's existing build (compound build)
        const shouldAdd = window.confirm(
          `Do you want to chow the ${card.value} (OK) or add to your ${buildValue} build (Cancel)?`
        );

        if (shouldAdd) {
          // Handle chow
          setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        } else {
          // Add to compound build, sorting ascending (small values on top)
          const updatedBuild = {
            ...existingBuild,
            cards: [...existingBuild.cards, card, overlappingCard].sort((a, b) => a.value - b.value),
          };
          setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        }
      } else {
        // Cannot create duplicate build, must chow or capture
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        toast.info(`Cannot create another ${buildValue} build. Cards chowed instead.`);
      }
      
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      return true;
    }
    
    // Create new build if none exists
    if (hasMatchingCard) {
      const shouldBuild = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
      );

      if (shouldBuild) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
      } else {
        const buildCards = [card, overlappingCard].sort((a, b) => a.value - b.value); // Sort ascending for new builds
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
      
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      return true;
    }
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
        cards: [...existingBuild.cards, card, overlappingCard].sort((a, b) => a.value - b.value), // Sort ascending
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
    const buildCards = [card, overlappingCard].sort((a, b) => a.value - b.value); // Sort ascending for new builds
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

