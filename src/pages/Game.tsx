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
  logCardState
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
    
    setSelectionCards(selectedCards);
    setDeck(remaining);
    
    // Log the initial state
    logCardState([], [], [], shuffledDeck);
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
    
    setPlayerHand(playerCards);
    setTableCards([]);
    setDeck(afterPlayer);
    
    // Log the state after dealing
    logCardState([], playerCards, [], afterPlayer);
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