
import { useState } from 'react';
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";

export const useGameState = (
  playerGoesFirst: boolean,
  initialTableCards: Card[],
  initialPlayerHand: Card[],
  initialAiHand: Card[],
  initialDeck: Card[]
) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
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

  const dealNewRound = () => {
    console.log("Current deck state:", deck);
    
    // Make sure we collect all cards back into the deck
    const allCards = [
      ...deck,
      ...tableCards,
      ...builds.flatMap(build => build.cards),
    ];
    
    console.log("Total cards available:", allCards.length);
    
    // Deal exactly 10 cards to each player for round 2
    const newPlayerHand = allCards.slice(0, 10);
    const newAiHand = allCards.slice(10, 20);
    const remainingDeck = allCards.slice(20);

    if (newPlayerHand.length === 10 && newAiHand.length === 10) {
      setPlayerHand(newPlayerHand);
      setAiHand(newAiHand);
      setDeck(remainingDeck);
      setBuilds([]); // Clear any remaining builds
      setTableCards([]); // Clear table cards
      setIsPlayerTurn(playerGoesFirst);
      toast.success("Round 2 starting!");
    } else {
      toast.error("Error dealing cards for round 2!");
      console.error("Not enough cards for round 2", {
        totalCards: allCards.length,
        playerCards: newPlayerHand.length,
        aiCards: newAiHand.length
      });
    }
  };

  return {
    showLeaveDialog,
    setShowLeaveDialog,
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
    dealNewRound
  };
};
