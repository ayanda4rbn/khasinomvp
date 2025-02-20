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
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);

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
      const freshDeck = getStandardDeck();
      const shuffledDeck = shuffleDeck(freshDeck);
      const { dealt: selectedCards, remaining } = dealCards(shuffledDeck, 5);
      setSelectionCards(selectedCards);
      setGameDeck(remaining);
    }
  }, [gameMode]);

  const handleCardSelect = (index: number) => {
    if (playerSelectedCard) return;

    const selectedCard = { ...selectionCards[index], faceUp: true };
    setPlayerSelectedCard(selectedCard);

    const remainingCards = selectionCards.filter((_, i) => i !== index);
    const aiCardIndex = Math.floor(Math.random() * remainingCards.length);
    const aiCard = { ...remainingCards[aiCardIndex], faceUp: true };
    setAiSelectedCard(aiCard);

    const updatedSelectionCards = selectionCards.map((card, i) => {
      if (i === index) return selectedCard;
      if (i === aiCardIndex) return aiCard;
      return card;
    });
    setSelectionCards(updatedSelectionCards);

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
    // Always deal 10 cards per player
    const { dealt: playerCards, remaining: afterPlayerDeal } = dealCards(gameDeck, 10);
    const { dealt: aiCards, remaining: afterAIDeal } = dealCards(afterPlayerDeal, 10);
    
    setPlayerHand(playerCards);
    setAiHand(aiCards);
    setTableCards([]);
    setGameDeck(afterAIDeal);
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
          aiHand={aiHand}
          deck={gameDeck}
          currentRound={currentRound}
          setCurrentRound={setCurrentRound}
        />
      )}
    </>
  );
};

export default Game;
