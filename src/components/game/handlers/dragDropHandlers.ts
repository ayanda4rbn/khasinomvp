
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

  console.log("[BUILD-CAPTURE] Capture successful:", {
    removedBuildId: overlappingBuild.id,
    newHandSize: newPlayerHand.length,
    remainingBuilds: builds.length - 1
  });

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

  const existingBuildOfSameValue = builds.find(b => 
    b.id !== overlappingBuild.id && b.value === newBuildValue
  );

  if (existingBuildOfSameValue) {
    console.log("[BUILD-AUGMENT] Failed: Build of same value exists:", {
      existingBuildId: existingBuildOfSameValue.id,
      value: newBuildValue
    });
    toast.error("Cannot create another build of the same value!");
    return false;
  }

  if (newBuildValue <= 10 && playerHand.some(c => c.value === newBuildValue)) {
    console.log("[BUILD-AUGMENT] Valid augment detected:", {
      newValue: newBuildValue,
      hasMatchingCard: true
    });

    const updatedCards = [
      ...overlappingBuild.cards,
      card
    ].sort((a, b) => b.value - a.value);
    
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

    console.log("[BUILD-AUGMENT] Augment successful:", {
      newBuildValue: newBuildValue,
      updatedBuildId: updatedBuild.id,
      newHandSize: newPlayerHand.length
    });

    toast.success("You augmented a build!");
    return true;
  }

  console.log("[BUILD-AUGMENT] Failed: Invalid augment", {
    newValue: newBuildValue,
    hasMatchingCard: playerHand.some(c => c.value === newBuildValue)
  });
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
    targetCard: { value: overlappingCard.value, suit: overlappingCard.suit },
    hasExistingBuild: hasPlayerBuild,
    currentBuildsCount: builds.length
  });

  if (card.value === overlappingCard.value) {
    console.log("[NEW-BUILD] Equal value cards detected");
    const buildValue = card.value * 2;
    const hasMatchingCard = playerHand.some(c => c.value === buildValue);
    const existingBuild = builds.find(b => b.value === buildValue);
    const playerExistingBuild = builds.find(b => b.owner === 'player');
    
    console.log("[NEW-BUILD] Build validation:", {
      buildValue,
      hasMatchingCard,
      hasExistingBuildOfSameValue: !!existingBuild,
      hasPlayerBuild: !!playerExistingBuild
    });

    // First check if we can create a new build with the matching card
    if (hasMatchingCard && !hasPlayerBuild) {
      const shouldBuild = window.confirm(
        `Do you want to chow the ${card.value} (OK) or build ${buildValue} (Cancel)?`
      );

      if (shouldBuild) {
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
        toast.success(`Created a build of ${buildValue}`);
      }
      
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
      setIsPlayerTurn(false);
      return true;
    }

    // Then check for existing builds
    if (existingBuild) {
      if (existingBuild.owner === 'player') {
        const shouldAdd = window.confirm(
          `Do you want to chow the ${card.value} (OK) or add to your ${buildValue} build (Cancel)?`
        );

        if (shouldAdd) {
          setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
          setTableCards(tableCards.filter(c => c !== overlappingCard));
        } else {
          const updatedBuild = {
            ...existingBuild,
            cards: [...existingBuild.cards, card, overlappingCard],
          };
          setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
          setTableCards(tableCards.filter(c => c !== overlappingCard));
          toast.success(`Added to your ${buildValue} build`);
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

    // If no build is possible, automatically chow the equal cards
    setPlayerChowedCards(prev => [...prev, overlappingCard, card]);
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    toast.success("Cards chowed!");
    return true;
  }

  const buildValue = card.value + overlappingCard.value;
  console.log("[NEW-BUILD] Attempting combined value build:", {
    combinedValue: buildValue,
    hasMatchingCard: playerHand.some(c => c.value === buildValue)
  });

  const existingBuild = builds.find(b => b.value === buildValue);

  if (existingBuild) {
    console.log("[NEW-BUILD] Found existing build of same value:", {
      buildId: existingBuild.id,
      owner: existingBuild.owner,
      value: buildValue
    });

    if (existingBuild.owner === 'player') {
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
    console.log("[NEW-BUILD] Creating new build:", {
      value: buildValue,
      cards: [card, overlappingCard].map(c => ({ value: c.value, suit: c.suit }))
    });

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

    console.log("[NEW-BUILD] Build created successfully:", {
      buildId: newBuild.id,
      value: buildValue,
      position: newBuild.position
    });

    toast.success(`Created a build of ${buildValue}`);
    return true;
  }

  console.log("[NEW-BUILD] Invalid build attempt:", {
    reason: "No matching card in hand",
    attemptedValue: buildValue
  });

  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};
