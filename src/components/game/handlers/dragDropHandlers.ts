
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Helper function to check if cards match
const cardsMatch = (card1: Card, card2: Card): boolean => {
  return card1.value === card2.value;
};

// Helper function to check if a build is possible
const canBuild = (value: number): boolean => {
  return value <= 10; // Ensures we can't build values above 10
};

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
  // Can't augment your own build
  if (build.owner === 'player') {
    toast.error("You cannot augment your own build!");
    return false;
  }

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
      owner: 'player' // Transfer ownership on augment
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

export const handleCardAction = (
  card: Card,
  tableCard: Card,
  playerHand: Card[],
  cardIndex: number,
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>,
  setTableCards: (cards: Card[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  tableCards: Card[],
  buildValue?: number
) => {
  if (buildValue) {
    // Handle as build
    handleNewBuild(card, tableCard, playerHand, cardIndex, false, () => {}, setTableCards, setPlayerHand, tableCards, []);
  } else {
    // Handle as capture
    setPlayerChowedCards(prev => [...prev, tableCard, card]);
    setTableCards(tableCards.filter(c => c !== tableCard));
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setIsPlayerTurn(false);
    toast.success("Cards captured!");
  }
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

  // If cards match and the value is 5 or less, show build/capture dialog
  if (cardsMatch(card, overlappingCard) && card.value <= 5) {
    const possibleBuildValue = card.value * 2;
    if (playerHand.some(c => c.value === possibleBuildValue)) {
      // Show dialog for choice
      return {
        needsChoice: true,
        card,
        overlappingCard,
        possibleBuildValue
      };
    }
  }

  // Check for matching cards (direct capture)
  if (cardsMatch(card, overlappingCard)) {
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);
    setTableCards(tableCards.filter(c => c !== overlappingCard));
    return true;
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
    
    // Check for existing builds with same value
    const existingBuild = builds.find(b => b.value === buildValue && b.owner === 'player');
    if (existingBuild) {
      // Stack on existing build
      const updatedBuild = {
        ...existingBuild,
        cards: [...existingBuild.cards, ...buildCards].sort((a, b) => b.value - a.value)
      };
      setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
    } else {
      setBuilds([...builds, newBuild]);
    }
    
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
