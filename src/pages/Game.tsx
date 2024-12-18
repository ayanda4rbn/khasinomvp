import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/types/game";
import { GameModeSelection } from "@/components/game/GameModeSelection";
import { CardSelection } from "@/components/game/CardSelection";
import { GameBoard } from "@/components/game/GameBoard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStandardDeck, shuffleDeck, dealCards } from "@/components/game/utils/deckManager";

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameMode, setGameMode] = useState<"ai" | "multiplayer" | "three_hands" | "four_hands" | "partners" | null>(null);
  const [gamePhase, setGamePhase] = useState<"selecting" | "playing" | null>("selecting");
  const [selectionCards, setSelectionCards] = useState<Card[]>([]);
  const [playerSelectedCard, setPlayerSelectedCard] = useState<Card | null>(null);
  const [aiSelectedCard, setAiSelectedCard] = useState<Card | null>(null);
  const [playerGoesFirst, setPlayerGoesFirst] = useState<boolean | null>(null);
  const [gameDeck, setGameDeck] = useState<Card[]>([]);
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

  useEffect(() => {
    if (gameMode === "ai") {
      // Initialize a fresh deck for the game
      const freshDeck = getStandardDeck();
      const shuffledDeck = shuffleDeck(freshDeck);
      
      // Deal 5 cards for initial selection
      const { dealt: selectedCards, remaining } = dealCards(shuffledDeck, 5);
      setSelectionCards(selectedCards);
      setGameDeck(remaining);
    }
  }, [gameMode]);

  const handleCardSelect = (index: number) => {
    if (playerSelectedCard) return;

    const selectedCard = selectionCards[index];
    setPlayerSelectedCard(selectedCard);

    // AI selects a random card from remaining cards
    const remainingCards = selectionCards.filter((_, i) => i !== index);
    const aiCardIndex = Math.floor(Math.random() * remainingCards.length);
    const aiCard = remainingCards[aiCardIndex];
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
    // Deal 10 cards to each player for round 1
    const shuffledDeck = shuffleDeck(gameDeck);
    const { dealt: playerCards, remaining } = dealCards(shuffledDeck, 10);
    
    setPlayerHand(playerCards);
    setTableCards([]);
    setGameDeck(remaining); // Store remaining cards for round 2
  };

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
          deck={gameDeck}
        />
      )}
    </>
  );
};

export default Game;