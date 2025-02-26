import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

export const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, isPlayerTurn: boolean) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    toast.error("It's not your turn!");
    return;
  }
  console.log("[DRAG] Started dragging card:", index);
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
  console.log("[BUILD-CAPTURE] Attempting to capture build:", {
    cardUsed: { value: card.value, suit: card.suit },
    buildValue: overlappingBuild.value,
    buildCards: overlappingBuild.cards.map(c => ({ value: c.value, suit: c.suit })),
    buildId: overlappingBuild.id,
    buildOwner: overlappingBuild.owner
  });

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
  console.log("[BUILD-AUGMENT] Attempting to augment build:", {
    cardUsed: { value: card.value, suit: card.suit },
    currentBuildValue: overlappingBuild.value,
    buildCards: overlappingBuild.cards.map(c => ({ value: c.value, suit: c.suit })),
    buildId: overlappingBuild.id
  });

  const newBuildValue = overlappingBuild.value + card.value;
  console.log("[BUILD-AUGMENT] New build value would be:", newBuildValue);

  // Only block if there's an opponent's build of the same value
  const existingOpponentBuild = builds.find(b => 
    b.id !== overlappingBuild.id && 
    b.value === newBuildValue && 
    b.owner === 'ai'
  );

  if (existingOpponentBuild) {
    console.log("[BUILD-AUGMENT] Failed: Opponent has build of same value");
    toast.error("Cannot create another build of the same value!");
    return false;
  }

  if (newBuildValue <= 10 && playerHand.some(c => c.value === newBuildValue)) {
    console.log("[BUILD-AUGMENT] Valid augment detected");

    // Find existing build of same value owned by player
    const existingPlayerBuild = builds.find(b => 
      b.id !== overlappingBuild.id && 
      b.value === newBuildValue && 
      b.owner === 'player'
    );

    if (existingPlayerBuild) {
      // Add the augmented cards to the existing build
      const newPair = [
        ...overlappingBuild.cards,
        { ...card, faceUp: true }
      ];
      const updatedBuild: BuildType = {
        ...existingPlayerBuild,
        cards: [...existingPlayerBuild.cards, ...newPair]
      };
      setBuilds(builds.map(b => 
        b.id === existingPlayerBuild.id ? updatedBuild : 
        b.id === overlappingBuild.id ? undefined : b
      ).filter(Boolean) as BuildType[]);
    } else {
      // Create new build or update existing
      const newPair = [{ ...card, faceUp: true }];
      const updatedBuild: BuildType = {
        ...overlappingBuild,
        cards: [...overlappingBuild.cards, ...newPair],
        value: newBuildValue,
        owner: 'player'
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
  console.log("[NEW-BUILD] Attempting to create build:", {
    playedCard: { value: card.value, suit: card.suit },
    targetCard: { value: overlappingCard.value, suit: overlappingCard.suit }
  });

  if (card.value === overlappingCard.value) {
    const buildValue = card.value * 2;
    const hasMatchingCard = playerHand.some(c => c.value === buildValue);
    const existingBuild = builds.find(b => b.value === buildValue);
    
    if (hasMatchingCard) {
      const shouldBuild = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
      );

      if (shouldBuild) {
        setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
      } else {
        // Sort only the initial pair of cards
        const buildCards = [card, overlappingCard].sort((a, b) => b.value - a.value);
        
        if (existingBuild && existingBuild.owner === 'player') {
          // Add to existing build
          const updatedBuild: BuildType = {
            ...existingBuild,
            cards: [...existingBuild.cards, ...buildCards]
          };
          setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
        } else {
          // Create new build
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
        toast.success(`Created a build of ${buildValue}`);
      }
      
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      return true;
    }
  }

  const buildValue = card.value + overlappingCard.value;
  console.log("[NEW-BUILD] Compound build value:", buildValue);

  // Check for opponent's build of same value
  const opponentBuild = builds.find(b => b.value === buildValue && b.owner === 'ai');
  if (opponentBuild) {
    toast.error(`Cannot create another ${buildValue} build. Try capturing or augmenting the existing one.`);
    return false;
  }

  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    // Sort only this pair of cards
    const newPair = [card, overlappingCard].sort((a, b) => b.value - a.value);
    
    // Check for existing build of same value owned by player
    const existingBuild = builds.find(b => b.value === buildValue && b.owner === 'player');
    
    if (existingBuild) {
      // Add to existing build, maintaining historical order
      const updatedBuild: BuildType = {
        ...existingBuild,
        cards: [...existingBuild.cards, ...newPair]
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
      toast.success(`Added to your ${buildValue} build`);
    } else {
      // Create new build
      const newBuild: BuildType = {
        id: Date.now(),
        cards: newPair,
        value: buildValue,
        position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
        owner: 'player'
      };
      setBuilds([...builds, newBuild]);
      toast.success(`Created a build of ${buildValue}`);
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
