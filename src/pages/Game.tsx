import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Card {
  value: number;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

const Game = () => {
  const [gameMode, setGameMode] = useState<"ai" | "multiplayer" | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const { toast } = useToast();

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

  const startGame = async () => {
    const newDeck = initializeDeck();
    setDeck(newDeck);

    // Deal initial cards
    const initialPlayerHand = newDeck.slice(0, 10);
    const initialTableCards = newDeck.slice(10, 11); // One card on the table
    setPlayerHand(initialPlayerHand);
    setTableCards(initialTableCards);

    if (gameMode === "multiplayer") {
      try {
        const { data: game, error } = await supabase
          .from('games')
          .insert([
            {
              game_type: 'cassino',
              status: 'waiting',
              room_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            }
          ])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Game Created!",
          description: `Share this code with your friend: ${game.room_code}`,
        });
      } catch (error) {
        console.error('Error creating game:', error);
        toast({
          title: "Error",
          description: "Failed to create multiplayer game",
          variant: "destructive",
        });
      }
    }
  };

  const renderCard = (card: Card) => {
    const suitSymbol = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    }[card.suit];

    const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';

    return (
      <div className={`w-20 h-32 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center m-2 ${color}`}>
        <div className="text-xl">{card.value}</div>
        <div className="text-2xl">{suitSymbol}</div>
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
                startGame();
              }}
              className="w-64 bg-casino-gold hover:bg-yellow-500 text-black px-8 py-6 text-lg block mx-auto"
            >
              Play vs AI
            </Button>
            <Button 
              onClick={() => {
                setGameMode("multiplayer");
                startGame();
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

  return (
    <div className="min-h-screen bg-casino-green p-8">
      <div className="text-white mb-8">
        <h2 className="text-2xl font-bold">
          {gameMode === "ai" ? "Playing vs AI" : "2 Players Mode"}
        </h2>
      </div>

      {/* Table Cards */}
      <div className="mb-8">
        <h3 className="text-white mb-4">Table Cards:</h3>
        <div className="flex flex-wrap gap-2">
          {tableCards.map((card, index) => (
            <div key={`table-${index}`}>
              {renderCard(card)}
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
              {renderCard(card)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;