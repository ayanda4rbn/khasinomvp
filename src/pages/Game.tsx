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
  const [usedCards] = useState(new Set<string>());

  useEffect(() => {
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

    return deck;
  };

  const getCardKey = (card: Card): string => {
    return `${card.value}-${card.suit}`;
  };

  const isCardUsed = (card: Card): boolean => {
    return usedCards.has(getCardKey(card));
  };

  const markCardAsUsed = (card: Card) => {
    usedCards.add(getCardKey(card));
  };

  const shuffleDeck = (inputDeck: Card[]): Card[] => {
    const availableCards = inputDeck.filter(card => !isCardUsed(card));
    const deck = [...availableCards];
    
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  const validateDeck = (deck: Card[]): boolean => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    deck.forEach(card => {
      const cardKey = getCardKey(card);
      if (seen.has(cardKey)) {
        duplicates.add(cardKey);
        console.error('Duplicate card found:', cardKey);
      }
      seen.add(cardKey);
    });

    if (duplicates.size > 0) {
      console.error('Duplicate cards found:', Array.from(duplicates));
      return false;
    }

    return true;
  };

  const initializeSelectionCards = () => {
    const standardDeck = createStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);
    const selectedCards = shuffledDeck.slice(0, 5);
    
    const uniqueValues = new Set(selectedCards.map(card => card.value));
    if (uniqueValues.size !== 5) {
      return initializeSelectionCards();
    }

    selectedCards.forEach(markCardAsUsed);
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

    const remainingCards = newCards.filter((_, i) => i !== index);
    const aiCardIndex = Math.floor(Math.random() * remainingCards.length);
    const aiCard = remainingCards[aiCardIndex];
    aiCard.faceUp = true;
    aiCard.selected = true;

    setAiSelectedCard(aiCard);

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
    const newDeck = createStandardDeck();
    const availableCards = newDeck.filter(card => !isCardUsed(card));
    const shuffledAvailable = shuffleDeck(availableCards);

    const playerCards = shuffledAvailable.slice(0, 10);
    const aiCards = shuffledAvailable.slice(10, 20);
    const remainingDeck = shuffledAvailable.slice(20);

    playerCards.forEach(markCardAsUsed);
    aiCards.forEach(markCardAsUsed);

    if (!validateDeck([...playerCards, ...aiCards, ...remainingDeck])) {
      console.error('Invalid deck distribution');
      usedCards.clear(); // Reset used cards
      return dealInitialCards();
    }

    setPlayerHand(playerCards);
    setTableCards([]);
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