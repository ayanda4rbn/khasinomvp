import { Button } from "@/components/ui/button";
import { useState } from "react";

const Game = () => {
  const [gameMode, setGameMode] = useState<"ai" | "multiplayer" | null>(null);

  if (!gameMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-casino-green">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-white mb-8">Select Game Mode</h2>
          <div className="space-y-4">
            <Button 
              onClick={() => setGameMode("ai")}
              className="w-64 bg-casino-gold hover:bg-yellow-500 text-black px-8 py-6 text-lg block mx-auto"
            >
              Play vs AI
            </Button>
            <Button 
              onClick={() => setGameMode("multiplayer")}
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
      <div className="text-white">
        <h2 className="text-2xl font-bold mb-4">
          {gameMode === "ai" ? "Playing vs AI" : "2 Players Mode"}
        </h2>
        {/* Game board will be implemented in the next iteration */}
        <p className="text-casino-gold">Game implementation coming soon...</p>
      </div>
    </div>
  );
};

export default Game;