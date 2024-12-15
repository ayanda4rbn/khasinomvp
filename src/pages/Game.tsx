import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/types/game";
import { GameModeSelection } from "@/components/game/GameModeSelection";
import { CardSelection } from "@/components/game/CardSelection";
import { GameBoard } from "@/components/game/GameBoard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  getStandardDeck, 
  shuffleDeck, 
  dealCards, 
  logCardState,
  validateDeckState 
} from "@/components/game/utils/deckManager";

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
    const standardDeck = getStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);
    const { dealt: selectedCards, remaining } = dealCards(shuffledDeck, 5);
    
    // Validate the dealt cards
    if (selectedCards.length === 0) {
      console.error('Failed to deal selection cards');
      return initializeSelectionCards();
    }

    setSelectionCards(selectedCards);
    setDeck(remaining);
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
    const shuffledDeck = shuffleDeck(deck);
    const { dealt: playerCards, remaining: afterPlayer } = dealCards(shuffledDeck, 10);
    const { dealt: aiCards, remaining: finalDeck } = dealCards(afterPlayer, 10);

    if (playerCards.length === 0 || aiCards.length === 0) {
      console.error('Failed to deal initial cards');
      return;
    }

    setPlayerHand(playerCards);
    setTableCards([]);
    setDeck(finalDeck);

    // Validate the entire deck state after dealing
    if (!validateDeckState([], playerCards, aiCards, finalDeck)) {
      console.error('Invalid deck state after dealing initial cards');
      toast({
        title: "Error",
        description: "There was an error dealing the cards. Please refresh the page.",
      });
      return;
    }

    // Log the state of all cards for debugging
    logCardState([], playerCards, aiCards, finalDeck);
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
