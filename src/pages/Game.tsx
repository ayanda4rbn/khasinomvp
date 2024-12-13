import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/types/game";
import { GameModeSelection } from "@/components/game/GameModeSelection";
import { CardSelection } from "@/components/game/CardSelection";
import { GameBoard } from "@/components/game/GameBoard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameMode, setGameMode] = useState<"ai" | "multiplayer" | "three_hands" | "four_hands" | "partners" | null>(null);
  const [gamePhase, setGamePhase] = useState<"selecting" | "playing" | null>("selecting");
  const [selectionCards, setSelectionCards] = useState<Card[]>([]);
  const [playerSelectedCard, setPlayerSelectedCard] = useState<Card | null>(null);
  const [aiSelectedCard, setAiSelectedCard] = useState<Card | null>(null);
  const [playerGoesFirst, setPlayerGoesFirst] = useState<boolean | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);

  useEffect(() => {
    // Check if user is logged in or playing as guest
    const guestName = localStorage.getItem("guestName");
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !guestName) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const initializeSelectionCards = () => {
    const values = Array.from({ length: 10 }, (_, i) => i + 1);
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const cards: Card[] = [];
    
    // Generate 5 unique random cards
    while (cards.length < 5) {
      const value = values[Math.floor(Math.random() * values.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const card = { value, suit, faceUp: false };
      
      if (!cards.some(c => c.value === value)) {
        cards.push(card);
      }
    }
    
    setSelectionCards(cards);
  };

  const handleCardSelect = (index: number) => {
    if (playerSelectedCard) return;

    const newCards = [...selectionCards];
    const selectedCard = newCards[index];
    selectedCard.faceUp = true;
    selectedCard.selected = true;
    setSelectionCards(newCards);
    setPlayerSelectedCard(selectedCard);

    // AI selects a random card from remaining cards
    const remainingCards = newCards.filter((_, i) => i !== index);
    const aiCardIndex = Math.floor(Math.random() * remainingCards.length);
    const aiCard = remainingCards[aiCardIndex];
    aiCard.faceUp = true;
    aiCard.selected = true;

    setAiSelectedCard(aiCard);

    // Determine who goes first
    const playerFirst = selectedCard.value < aiCard.value;
    setPlayerGoesFirst(playerFirst);

    toast({
      title: playerFirst ? "You go first!" : "AI goes first!",
      description: `You selected ${selectedCard.value}, AI selected ${aiCard.value}`,
    });

    setTimeout(() => {
      setGamePhase("playing");
      dealInitialCards();
    }, 2000);
  };

  const dealInitialCards = () => {
    const newDeck = initializeDeck();
    const playerCards = newDeck.slice(0, 10);
    const aiCards = newDeck.slice(10, 20);
    const remainingDeck = newDeck.slice(20); // Don't deal cards to table initially

    setPlayerHand(playerCards);
    setTableCards([]); // Start with empty table
    setDeck(remainingDeck);
  };

  const initializeDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = Array.from({ length: 10 }, (_, i) => i + 1);
    const newDeck: Card[] = [];

    // Create exactly one card for each suit and value combination
    for (const suit of suits) {
      for (const value of values) {
        newDeck.push({
          suit,
          value,
          faceUp: false,
          selected: false,
        });
      }
    }

    // Fisher-Yates shuffle algorithm for better randomization
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Verify deck integrity
    const uniqueCards = new Set(newDeck.map(card => `${card.value}-${card.suit}`));
    console.log('Deck size:', newDeck.length);
    console.log('Unique cards:', uniqueCards.size);
    
    if (uniqueCards.size !== 40) {
      console.error('Deck integrity check failed - duplicate cards detected');
      // Recursively try again if somehow we got duplicates
      return initializeDeck();
    }

    return newDeck;
  };

  useEffect(() => {
    if (gameMode === "ai") {
      initializeSelectionCards();
    }
  }, [gameMode]);

  return (
    <>
      {!gameMode && (
        <GameModeSelection onSelectMode={setGameMode} />
      )}
      {gameMode && gamePhase === "selecting" && (
        <CardSelection 
          selectionCards={selectionCards} 
          onCardSelect={handleCardSelect} 
        />
      )}
      {gameMode && gamePhase === "playing" && (
        <GameBoard
          playerGoesFirst={playerGoesFirst!}
          tableCards={tableCards}
          playerHand={playerHand}
          deck={deck}
        />
      )}
    </>
  );
};

export default Game;