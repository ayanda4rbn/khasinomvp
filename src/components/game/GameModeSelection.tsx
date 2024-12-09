import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GameModeSelectionProps {
  onSelectMode: (mode: "ai" | "multiplayer") => void;
}

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green">
      <div className="text-center space-y-8">
        <h2 className="text-4xl font-bold text-white mb-8">Select Game Mode</h2>
        <div className="space-y-4">
          <Button 
            onClick={() => onSelectMode("ai")}
            className="w-64 bg-casino-gold hover:bg-yellow-500 text-black px-8 py-6 text-lg block mx-auto"
          >
            Play vs AI
          </Button>
          <Button 
            onClick={() => {
              onSelectMode("multiplayer");
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
};