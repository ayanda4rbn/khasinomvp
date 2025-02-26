
import { useState } from 'react';
import { Card, BuildType, GameScore, GameSummary } from '@/types/game';
import { toast } from "sonner";

export const calculateScore = (chowedCards: Card[]): GameScore => {
  const score: GameScore = {
    cardsCount: chowedCards.length,
    spadesCount: chowedCards.filter(card => card.suit === 'spades').length,
    mummy: chowedCards.some(card => card.value === 10 && card.suit === 'diamonds'),
    spy: chowedCards.some(card => card.value === 2 && card.suit === 'spades'),
    aces: chowedCards.filter(card => card.value === 1).length,
    total: 0
  };

  // Calculate total score
  let total = 0;
  
  // Add points for special cards
  total += score.aces; // 1 point per ace
  if (score.mummy) total += 2; // 2 points for mummy
  if (score.spy) total += 1; // 1 point for spy
  
  score.total = total;
  return score;
};

export const determineWinner = (playerScore: GameScore, aiScore: GameScore): GameSummary => {
  let playerTotal = playerScore.total;
  let aiTotal = aiScore.total;

  // Most cards (2 points, 1 each if tie)
  if (playerScore.cardsCount > aiScore.cardsCount) {
    playerTotal += 2;
  } else if (aiScore.cardsCount > playerScore.cardsCount) {
    aiTotal += 2;
  } else {
    playerTotal += 1;
    aiTotal += 1;
  }

  // Most spades (2 points, 1 each if tie)
  if (playerScore.spadesCount > aiScore.spadesCount) {
    playerTotal += 2;
  } else if (aiScore.spadesCount > playerScore.spadesCount) {
    aiTotal += 2;
  } else {
    playerTotal += 1;
    aiTotal += 1;
  }

  // Return final scores and winner
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
  const [lastChowedBy, setLastChowedBy] = useState<'player' | 'ai'>(playerGoesFirst ? 'player' : 'ai');

  const updateLastChowed = (who: 'player' | 'ai') => {
    setLastChowedBy(who);
    console.log("[CHOW] Last chowed by:", who);
  };

  // New wrapper that only updates lastChowedBy when actually chowing cards
  const wrappedSetPlayerChowedCards = (newValue: Card[] | ((prev: Card[]) => Card[])) => {
    setPlayerChowedCards(newValue);
    if (typeof newValue === 'function') {
      setPlayerChowedCards(prev => {
        const result = newValue(prev);
        if (result.length > prev.length) {
          updateLastChowed('player');
        }
        return result;
      });
    } else if (newValue.length > playerChowedCards.length) {
      updateLastChowed('player');
    }
  };

  const wrappedSetAiChowedCards = (newValue: Card[] | ((prev: Card[]) => Card[])) => {
    setAiChowedCards(newValue);
    if (typeof newValue === 'function') {
      setAiChowedCards(prev => {
        const result = newValue(prev);
        if (result.length > prev.length) {
          updateLastChowed('ai');
        }
        return result;
      });
    } else if (newValue.length > aiChowedCards.length) {
      updateLastChowed('ai');
    }
  };

  const calculateGameSummary = () => {
    // First, add any remaining table cards to the last player who chowed
    let finalPlayerChowedCards = [...playerChowedCards];
    let finalAiChowedCards = [...aiChowedCards];

    console.log("[GAME-END] Last chowed by:", lastChowedBy);
    console.log("[GAME-END] Remaining table cards:", tableCards.length);

    if (lastChowedBy === 'player') {
      finalPlayerChowedCards = [...finalPlayerChowedCards, ...tableCards];
    } else {
      finalAiChowedCards = [...finalAiChowedCards, ...tableCards];
    }

    // Calculate final scores with the updated chowed cards
    const playerScore = calculateScore(finalPlayerChowedCards);
    const aiScore = calculateScore(finalAiChowedCards);
    const summary = determineWinner(playerScore, aiScore);
    
    console.log("[GAME-END] Final card counts:", {
      player: finalPlayerChowedCards.length,
      ai: finalAiChowedCards.length,
      total: finalPlayerChowedCards.length + finalAiChowedCards.length
    });
    
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
    setPlayerChowedCards: wrappedSetPlayerChowedCards,
    aiChowedCards,
    setAiChowedCards: wrappedSetAiChowedCards,
    gameSummary,
    calculateGameSummary,
    dealNewRound,
    lastChowedBy,
    setLastChowedBy
  };
};
