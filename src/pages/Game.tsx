import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/types/game";
import { GameModeSelection } from "@/components/game/GameModeSelection";
import { CardSelection } from "@/components/game/CardSelection";
import { GameBoard } from "@/components/game/GameBoard";

const Game = () => {
  const [gameMode, setGameMode] = useState<"ai" | "multiplayer" | null>(null);
  const [gamePhase, setGamePhase] = useState<"selecting" | "playing" | null>("selecting");
  const [selectionCards, setSelectionCards] = useState<Card[]>([]);
  const [playerSelectedCard, setPlayerSelectedCard] = useState<Card | null>(null);
  const [aiSelectedCard, setAiSelectedCard] = useState<Card | null>(null);
  const [playerGoesFirst, setPlayerGoesFirst] = useState<boolean | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const { toast } = useToast();

  const initializeSelectionCards = () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const cards: Card[] = [];
    
    while (cards.length < 5) {
      const value = values[Math.floor(Math.random() * values.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const card = { value, suit, faceUp: false };
      
      if (!cards.some(c => c.value === value && c.suit === suit)) {
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

    // AI selects a random card
    let remainingCards = newCards.filter((_, i) => i !== index);
    const aiCardIndex = Math.floor(Math.random() * remainingCards.length);
    const aiCard = remainingCards[aiCardIndex];
    aiCard.faceUp = true;
    aiCard.selected = true;

    setPlayerSelectedCard(selectedCard);
    setAiSelectedCard(aiCard);

    // Determine who goes first using the selected card values
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
    const remainingDeck = newDeck.slice(20);

    setPlayerHand(playerCards);
    setDeck(remainingDeck);
    setTableCards([]);
  };

  const initializeDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const newDeck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        newDeck.push({ suit, value });
      }
    }

    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    return newDeck;
  };

  useEffect(() => {
    if (gameMode === "ai") {
      initializeSelectionCards();
    }
  }, [gameMode]);

  if (!gameMode) {
    return <GameModeSelection onSelectMode={setGameMode} />;
  }

  if (gamePhase === "selecting") {
    return <CardSelection selectionCards={selectionCards} onCardSelect={handleCardSelect} />;
  }

  return (
    <GameBoard
      playerGoesFirst={playerGoesFirst!}
      tableCards={tableCards}
      playerHand={playerHand}
    />
  );
};

export default Game;