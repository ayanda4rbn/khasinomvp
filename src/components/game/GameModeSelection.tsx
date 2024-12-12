import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GameModeSelectionProps {
  onSelectMode: (mode: "ai" | "multiplayer" | "three_hands" | "four_hands" | "partners") => void;
}

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const { toast } = useToast();

  const handleModeSelect = (mode: "ai" | "multiplayer" | "three_hands" | "four_hands" | "partners") => {
    if (mode !== "ai") {
      toast({
        title: "Coming Soon",
        description: "This game mode is under development",
      });
    }
    onSelectMode(mode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green">
      <div className="text-center space-y-8">
        <h2 className="text-4xl font-bold text-white mb-8">Select Game Mode</h2>
        <div className="space-y-4">
          <Button 
            onClick={() => handleModeSelect("ai")}
            className="w-64 bg-casino-gold hover:bg-yellow-500 text-black px-8 py-6 text-lg block mx-auto"
          >
            Play vs AI
          </Button>
          <Button 
            onClick={() => handleModeSelect("multiplayer")}
            className="w-64 bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg block mx-auto"
          >
            2 Players
          </Button>
          <Button 
            onClick={() => handleModeSelect("three_hands")}
            className="w-64 bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg block mx-auto"
          >
            3 Hands
          </Button>
          <Button 
            onClick={() => handleModeSelect("four_hands")}
            className="w-64 bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg block mx-auto flex flex-col items-center"
          >
            <span>4 Hands</span>
            <span className="text-sm">(Every Man for Himself)</span>
          </Button>
          <Button 
            onClick={() => handleModeSelect("partners")}
            className="w-64 bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg block mx-auto"
          >
            Partners
          </Button>
        </div>
      </div>
    </div>
  );
};