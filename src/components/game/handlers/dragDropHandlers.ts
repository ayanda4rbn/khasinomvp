
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

export const handleDragStart = (
  e: React.DragEvent<HTMLDivElement>,
  cardIndex: number,
  isPlayerTurn: boolean
) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    toast.error("It's not your turn!");
    return;
  }
  e.dataTransfer.setData('text/plain', cardIndex.toString());
};

export const handleBuildCapture = (
  card: Card,
  build: BuildType,
  playerHand: Card[],
  cardIndex: number,
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[]
) => {
  const sortedBuildCards = [...build.cards].sort((a, b) => a.value - b.value);
  setPlayerChowedCards(prevCards => [...prevCards, ...sortedBuildCards, card]);
  setBuilds(builds.filter(b => b.id !== build.id));
  const newPlayerHand = [...playerHand];
  newPlayerHand.splice(cardIndex, 1);
  setPlayerHand(newPlayerHand);
  setIsPlayerTurn(false);
  toast.success("Build captured!");
};

export const handleBuildAugment = (
  card: Card,
  build: BuildType,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[]
) => {
  const newBuildValue = build.value + card.value;
  if (newBuildValue <= 10 && newBuildValue < build.value * 2 && playerHand.some(c => c.value === newBuildValue)) {
    if (build.owner === 'ai' && hasPlayerBuild) {
      toast.error("You cannot augment when you have an existing build!");
      return false;
    }

    // Sort and maintain existing build cards order
    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, card].sort((a, b) => b.value - a.value),
      value: newBuildValue,
      owner: 'player'
    };
    setBuilds(builds.map(b => b.id === build.id ? updatedBuild : b));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    toast.success("Build augmented!");
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
) => {
  if (hasPlayerBuild) {
    toast.error("You cannot create multiple builds at the same time!");
    return false;
  }

  const buildValue = card.value + overlappingCard.value;
  if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
    // Sort cards by value (higher values first)
    const buildCards = [overlappingCard, card].sort((a, b) => b.value - a.value);
    
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
    return true;
  }
  toast.error("Invalid build! You must have a card matching the build value.");
  return false;
};

export const calculateScore = (
  playerChowedCards: Card[],
  aiChowedCards: Card[]
) => {
  let playerScore = 0;
  let aiScore = 0;

  // Points for most cards
  if (playerChowedCards.length > aiChowedCards.length) {
    playerScore += 2;
  } else if (aiChowedCards.length > playerChowedCards.length) {
    aiScore += 2;
  } else {
    playerScore += 1;
    aiScore += 1;
  }

  // Count spades for each player
  const playerSpades = playerChowedCards.filter(card => card.suit === 'spades').length;
  const aiSpades = aiChowedCards.filter(card => card.suit === 'spades').length;

  // Points for most spades
  if (playerSpades > aiSpades) {
    playerScore += 2;
  } else if (aiSpades > playerSpades) {
    aiScore += 2;
  } else {
    playerScore += 1;
    aiScore += 1;
  }

  // Two of spades (spy two)
  if (playerChowedCards.some(card => card.suit === 'spades' && card.value === 2)) {
    playerScore += 1;
  } else if (aiChowedCards.some(card => card.suit === 'spades' && card.value === 2)) {
    aiScore += 1;
  }

  // Ten of diamonds (mummy)
  if (playerChowedCards.some(card => card.suit === 'diamonds' && card.value === 10)) {
    playerScore += 2;
  } else if (aiChowedCards.some(card => card.suit === 'diamonds' && card.value === 10)) {
    aiScore += 2;
  }

  // Aces (1 point each)
  playerScore += playerChowedCards.filter(card => card.value === 1).length;
  aiScore += aiChowedCards.filter(card => card.value === 1).length;

  return {
    playerScore,
    aiScore,
    details: {
      mostCards: {
        player: playerChowedCards.length,
        ai: aiChowedCards.length
      },
      mostSpades: {
        player: playerSpades,
        ai: aiSpades
      },
      spyTwo: {
        player: playerChowedCards.some(card => card.suit === 'spades' && card.value === 2),
        ai: aiChowedCards.some(card => card.suit === 'spades' && card.value === 2)
      },
      mummy: {
        player: playerChowedCards.some(card => card.suit === 'diamonds' && card.value === 10),
        ai: aiChowedCards.some(card => card.suit === 'diamonds' && card.value === 10)
      },
      aces: {
        player: playerChowedCards.filter(card => card.value === 1).length,
        ai: aiChowedCards.filter(card => card.value === 1).length
      }
    }
  };
};
