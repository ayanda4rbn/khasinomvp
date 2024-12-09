import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Card {
  value: number;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  faceUp?: boolean;
  selected?: boolean;
}

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
    
    // Create 5 random cards for selection
    while (cards.length < 5) {
      const value = values[Math.floor(Math.random() * values.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const card = { value, suit, faceUp: false };
      
      // Check if this exact card is already in the array
      if (!cards.some(c => c.value === value && c.suit === suit)) {
        cards.push(card);
      }
    }
    
    setSelectionCards(cards);
  };

  const handleCardSelect = (index: number) => {
    if (playerSelectedCard) return; // Prevent selecting multiple cards

    const newCards = [...selectionCards];
    newCards[index].faceUp = true;
    newCards[index].selected = true;
    setSelectionCards(newCards);
    setPlayerSelectedCard(newCards[index]);

    // AI selects a random card
    let remainingCards = newCards.filter((_, i) => i !== index);
    const aiCardIndex = Math.floor(Math.random() * remainingCards.length);
    const aiCard = remainingCards[aiCardIndex];
    aiCard.faceUp = true;
    aiCard.selected = true;
    setAiSelectedCard(aiCard);

    // Determine who goes first
    const playerFirst = playerSelectedCard!.value < aiCard.value;
    setPlayerGoesFirst(playerFirst);

    // Show result and prepare for game start
    toast({
      title: playerFirst ? "You go first!" : "AI goes first!",
      description: `You selected ${newCards[index].value}, AI selected ${aiCard.value}`,
    });

    // Start the game after a delay
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

    // Shuffle the deck
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

  const renderCard = (card: Card) => {
    const suitSymbol = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    }[card.suit];

    const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';
    const cardStyle = card.faceUp 
      ? `w-20 h-32 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center m-2 ${color} ${card.selected ? 'ring-4 ring-casino-gold' : ''}`
      : 'w-20 h-32 bg-blue-500 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center m-2 cursor-pointer hover:bg-blue-600';

    return (
      <div 
        className={cardStyle}
        onClick={() => !card.faceUp && gamePhase === "selecting" && handleCardSelect(selectionCards.indexOf(card))}
      >
        {card.faceUp ? (
          <>
            <div className="text-xl">{card.value}</div>
            <div className="text-2xl">{suitSymbol}</div>
          </>
        ) : null}
      </div>
    );
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-casino-green">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-white mb-8">Select Game Mode</h2>
          <div className="space-y-4">
            <Button 
              onClick={() => {
                setGameMode("ai");
                initializeSelectionCards();
              }}
              className="w-64 bg-casino-gold hover:bg-yellow-500 text-black px-8 py-6 text-lg block mx-auto"
            >
              Play vs AI
            </Button>
            <Button 
              onClick={() => {
                setGameMode("multiplayer");
                toast({
                  title: "Coming Soon",
                  description: "Multiplayer mode is under development",
                });
              }}
              className="w-64 bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg block mx-auto"
            >
              2 Players
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === "selecting") {
    return (
      <div className="min-h-screen bg-casino-green p-8">
        <div className="text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Select a card to determine who plays first</h2>
          <p>The player with the lower value card will play first</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {selectionCards.map((card, index) => (
            <div key={`selection-${index}`}>
              {renderCard(card)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-green p-8">
      <div className="text-white mb-8">
        <h2 className="text-2xl font-bold">
          {gameMode === "ai" ? "Playing vs AI" : "2 Players Mode"}
        </h2>
        <p>{playerGoesFirst ? "You" : "AI"} plays first</p>
      </div>

      {/* Table Cards */}
      <div className="mb-8">
        <h3 className="text-white mb-4">Table Cards:</h3>
        <div className="flex flex-wrap gap-2">
          {tableCards.map((card, index) => (
            <div key={`table-${index}`}>
              {renderCard({ ...card, faceUp: true })}
            </div>
          ))}
        </div>
      </div>

      {/* Player's Hand */}
      <div>
        <h3 className="text-white mb-4">Your Hand:</h3>
        <div className="flex flex-wrap gap-2">
          {playerHand.map((card, index) => (
            <div key={`hand-${index}`}>
              {renderCard({ ...card, faceUp: true })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;