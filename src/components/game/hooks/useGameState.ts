
import { useState } from 'react';
import { Card, BuildType, GameScore, GameSummary } from '@/types/game';
import { toast } from "sonner";

export const calculateScore = (chowedCards: Card[]): GameScore => {
  const score: GameScore = {
    cardsCount: chowedCards.length,
    spadesCount: chowedCards.filter(card => card.suit === 'spades').length,
    bigCasino: chowedCards.some(card => card.value === 10 && card.suit === 'diamonds'),
    littleCasino: chowedCards.some(card => card.value === 2 && card.suit === 'spades'),
    total: 0
  };

  // Calculate total score
  score.total = score.cardsCount + score.spadesCount + (score.bigCasino ? 2 : 0) + (score.littleCasino ? 1 : 0);
  return score;
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

    const winner = playerScore.total > aiScore.total ? 'player' : 
                  aiScore.total > playerScore.total ? 'ai' : 'tie';

    setGameSummary({
      playerScore,
      aiScore,
      winner
    });
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
