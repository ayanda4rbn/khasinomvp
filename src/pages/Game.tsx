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
    const deck: Card[] = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = Array.from({ length: 10 }, (_, i) => i + 1);

    // Create exactly one card for each combination
    for (const suit of suits) {
      for (const value of values) {
        const card: Card = {
          suit,
          value,
          faceUp: false,
          selected: false,
        };
        deck.push(card);
      }
    }

    // Log the initial deck for debugging
    console.log('Initial deck created:', deck.map(card => `${card.value}-${card.suit}`));
    return deck;
  };

  const shuffleDeck = (inputDeck: Card[]): Card[] => {
    // Create a copy to avoid mutating the input
    const deck = [...inputDeck];
    
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  const validateDeck = (deck: Card[]): boolean => {
    // Check deck size
    if (deck.length !== 40) {
      console.error('Invalid deck size:', deck.length);
      return false;
    }

    // Create a Set to track unique combinations
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    // Check for duplicates
    deck.forEach(card => {
      const cardKey = `${card.value}-${card.suit}`;
      if (seen.has(cardKey)) {
        duplicates.add(cardKey);
        console.error('Duplicate card found:', cardKey);
      }
      seen.add(cardKey);
    });

    // Log all cards for debugging
    console.log('All cards in deck:', Array.from(seen));
    
    if (duplicates.size > 0) {
      console.error('Duplicate cards found:', Array.from(duplicates));
      return false;
    }

    // Verify we have all required combinations
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
      for (let value = 1; value <= 10; value++) {
        const cardKey = `${value}-${suit}`;
        if (!seen.has(cardKey)) {
          console.error('Missing card:', cardKey);
          return false;
        }
      }
    }

    return true;
  };

  const initializeSelectionCards = () => {
    const standardDeck = createStandardDeck();
    if (!validateDeck(standardDeck)) {
      console.error('Invalid deck during selection cards initialization');
      return initializeSelectionCards();
    }
    
    const shuffledDeck = shuffleDeck(standardDeck);
    const selectedCards = shuffledDeck.slice(0, 5);
    
    // Verify no duplicate values in selection cards
    const uniqueValues = new Set(selectedCards.map(card => card.value));
    if (uniqueValues.size !== 5) {
      console.error('Duplicate values in selection cards');
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
    
    if (!validateDeck(standardDeck)) {
      console.error('Invalid deck during initialization');
      return initializeDeck();
    }
    
    const shuffledDeck = shuffleDeck(standardDeck);
    
    if (!validateDeck(shuffledDeck)) {
      console.error('Invalid deck after shuffling');
      return initializeDeck();
    }

    return shuffledDeck;
  };

  const dealInitialCards = () => {
    const newDeck = initializeDeck();
    
    // Verify deck before dealing
    if (!validateDeck(newDeck)) {
      console.error('Invalid deck before dealing');
      return dealInitialCards();
    }

    const playerCards = newDeck.slice(0, 10);
    const aiCards = newDeck.slice(10, 20);
    const remainingDeck = newDeck.slice(20);

    // Verify each portion has the correct number of cards
    if (playerCards.length !== 10 || aiCards.length !== 10 || remainingDeck.length !== 20) {
      console.error('Invalid deal distribution');
      return dealInitialCards();
    }

    // Verify no duplicates across different portions
    const allCards = [...playerCards, ...aiCards, ...remainingDeck];
    if (!validateDeck(allCards)) {
      console.error('Duplicates found after dealing');
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