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

  const createStandardDeck = (): Card[] => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = Array.from({ length: 10 }, (_, i) => i + 1);
    const deck: Card[] = [];

    // Create exactly one card for each combination
    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          suit,
          value,
          faceUp: false,
          selected: false,
        });
      }
    }

    return deck;
  };

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const validateDeck = (deck: Card[]): boolean => {
    if (deck.length !== 40) {
      console.error('Invalid deck size:', deck.length);
      return false;
    }

    const seen = new Set<string>();
    for (const card of deck) {
      const cardKey = `${card.value}-${card.suit}`;
      if (seen.has(cardKey)) {
        console.error('Duplicate card found:', cardKey);
        return false;
      }
      seen.add(cardKey);
    }

    return seen.size === 40;
  };

  const initializeSelectionCards = () => {
    const standardDeck = createStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);
    
    // Take the first 5 cards for selection
    const selectedCards = shuffledDeck.slice(0, 5);
    
    // Verify no duplicate values in selection cards
    const uniqueValues = new Set(selectedCards.map(card => card.value));
    if (uniqueValues.size !== 5) {
      console.error('Duplicate values in selection cards, retrying...');
      return initializeSelectionCards();
    }

    setSelectionCards(selectedCards);
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

  const initializeDeck = (): Card[] => {
    const standardDeck = createStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);

    if (!validateDeck(shuffledDeck)) {
      console.error('Deck validation failed, retrying...');
      return initializeDeck();
    }

    return shuffledDeck;
  };

  const dealInitialCards = () => {
    const newDeck = initializeDeck();
    
    // Verify deck before dealing
    if (!validateDeck(newDeck)) {
      console.error('Invalid deck before dealing, retrying...');
      return dealInitialCards();
    }

    const playerCards = newDeck.slice(0, 10);
    const aiCards = newDeck.slice(10, 20);
    const remainingDeck = newDeck.slice(20);

    // Verify each portion has the correct number of cards
    if (playerCards.length !== 10 || aiCards.length !== 10 || remainingDeck.length !== 20) {
      console.error('Invalid deal distribution, retrying...');
      return dealInitialCards();
    }

    setPlayerHand(playerCards);
    setTableCards([]); // Start with empty table
    setDeck(remainingDeck);
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