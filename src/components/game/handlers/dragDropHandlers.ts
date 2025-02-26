
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
    const updatedCards = [
      ...overlappingBuild.cards,
      card
    ].sort((a, b) => b.value - a.value); // Sort descending: higher values at bottom
    
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
  if (card.value === overlappingCard.value) {
    const buildValue = card.value * 2;
    const hasMatchingCard = playerHand.some(c => c.value === buildValue);
    const existingBuild = builds.find(b => b.value === buildValue);
    const playerExistingBuild = builds.find(b => b.owner === 'player');
    
    if (overlappingCard.value <= 5) {
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
      else if (hasMatchingCard && !existingBuild) {
        const shouldChow = window.confirm(
          `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
        );

        if (shouldChow) {
          setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        } else {
          const buildCards = [overlappingCard, card].sort((a, b) => b.value - a.value); // Keep higher values at bottom
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
    
    if (existingBuild) {
      if (existingBuild.owner === 'player') {
        const shouldAdd = window.confirm(
          `Do you want to chow the ${card.value} (OK) or add to your ${buildValue} build (Cancel)?`
        );

        if (shouldAdd) {
          setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        } else {
          // For compound builds, append new combination without sorting
          const updatedBuild = {
            ...existingBuild,
            cards: [...existingBuild.cards, card, overlappingCard],
          };
          setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        }
      } else {
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
    
    if (hasMatchingCard) {
      const shouldBuild = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
      );

      if (shouldBuild) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
      } else {
        const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value); // Higher values at bottom for new builds
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

  const buildValue = card.value + overlappingCard.value;
  const existingBuild = builds.find(b => b.value === buildValue);

  if (existingBuild) {
    if (existingBuild.owner === 'player') {
      // For compound builds, append new combination without sorting
      const updatedBuild = {
        ...existingBuild,
        cards: [...existingBuild.cards, card, overlappingCard],
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

  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value); // Higher values at bottom for new builds
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
