
import { useState } from 'react';
import { Card, BuildType, GameScore, GameSummary } from '@/types/game';
import { toast } from "sonner";

export const calculateScore = (chowedCards: Card[]): GameScore => {
  const score: GameScore = {
    cardsCount: chowedCards.length,
    spadesCount: chowedCards.filter(card => card.suit === 'spades').length,
    mummy: chowedCards.some(card => card.value === 10 && card.suit === 'diamonds'), // 10 of diamonds
    spy: chowedCards.some(card => card.value === 2 && card.suit === 'spades'), // 2 of spades
    aces: chowedCards.filter(card => card.value === 1).length, // Count of aces
    total: 0
  };

  // Calculate points based on the rules:
  // - 2 points for most cards
  // - 1 point for most spades
  // - 2 points for Mummy (10 of diamonds)
  // - 1 point for Spy (2 of spades)
  // - 1 point for each ace
  score.total = score.aces;  // Start with ace points
  if (score.mummy) score.total += 2;
  if (score.spy) score.total += 1;

  return score;
};

export const determineWinner = (playerScore: GameScore, aiScore: GameScore): GameSummary => {
  let playerTotal = playerScore.total;
  let aiTotal = aiScore.total;

  // Add points for most cards (2 points)
  if (playerScore.cardsCount > aiScore.cardsCount) {
    playerTotal += 2;
  } else if (aiScore.cardsCount > playerScore.cardsCount) {
    aiTotal += 2;
  }

  // Add points for most spades (1 point)
  if (playerScore.spadesCount > aiScore.spadesCount) {
    playerTotal += 1;
  } else if (aiScore.spadesCount > playerScore.spadesCount) {
    aiTotal += 1;
  }

  return {
    playerScore: { ...playerScore, total: playerTotal },
    aiScore: { ...aiScore, total: aiTotal },
    winner: playerTotal > aiTotal ? 'player' : 
            aiTotal > playerTotal ? 'ai' : 'tie'
  };
};

export const useGameState = (
  playerGoesFirst: boolean,
  initialTableCards: Card[],
  initialPlayerHand: Card[],
  initialAiHand: Card[],
  initialDeck: Card[]
) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);
  const playerName = localStorage.getItem("guestName") || "Player";
  const [tableCards, setTableCards] = useState<Card[]>(initialTableCards);
  const [playerHand, setPlayerHand] = useState<Card[]>(initialPlayerHand);
  const [aiHand, setAiHand] = useState<Card[]>(initialAiHand);
  const [isPlayerTurn, setIsPlayerTurn] = useState(playerGoesFirst);
  const [currentRound, setCurrentRound] = useState(1);
  const [deck, setDeck] = useState<Card[]>(initialDeck);
  const [builds, setBuilds] = useState<BuildType[]>([]);
  const [playerChowedCards, setPlayerChowedCards] = useState<Card[]>([]);
  const [aiChowedCards, setAiChowedCards] = useState<Card[]>([]);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);

  const calculateGameSummary = () => {
    const playerScore = calculateScore(playerChowedCards);
    const aiScore = calculateScore(aiChowedCards);
    const summary = determineWinner(playerScore, aiScore);
    setGameSummary(summary);
    setShowGameSummary(true);
  };

  const dealNewRound = () => {
    console.log("Dealing round 2. Current deck size:", deck.length);
    
    const newPlayerHand = deck.slice(0, 10);
    const newAiHand = deck.slice(10, 20);
    const remainingDeck = deck.slice(20);

    console.log("Round 2 distribution:", {
      playerCards: newPlayerHand.length,
      aiCards: newAiHand.length,
      remainingDeck: remainingDeck.length
    });

    setPlayerHand(newPlayerHand);
    setAiHand(newAiHand);
    setDeck(remainingDeck);
    setIsPlayerTurn(playerGoesFirst);
    toast.success("Round 2 starting!");
  };

  return {
    showLeaveDialog,
    setShowLeaveDialog,
    showGameSummary,
    setShowGameSummary,
    playerName,
    tableCards,
    setTableCards,
    playerHand,
    setPlayerHand,
    aiHand,
    setAiHand,
    isPlayerTurn,
    setIsPlayerTurn,
    currentRound,
    setCurrentRound,
    deck,
    setDeck,
    builds,
    setBuilds,
    playerChowedCards,
    setPlayerChowedCards,
    aiChowedCards,
    setAiChowedCards,
    gameSummary,
    calculateGameSummary,
    dealNewRound
  };
};
