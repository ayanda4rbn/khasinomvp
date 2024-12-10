import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';
import { SocialMediaLinks } from '@/components/layout/SocialMediaLinks';
import { Button } from '@/components/ui/button';

interface GameBoardProps {
  playerGoesFirst: boolean;
  tableCards: Card[];
  playerHand: Card[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerGoesFirst, tableCards, playerHand }) => {
  const playerName = localStorage.getItem("guestName") || "Player";

  return (
    <div className="h-screen bg-casino-green p-4 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-4">
        <h2 className="text-2xl font-bold">Cassino Game</h2>
        <div className="flex items-center gap-6">
          <Button 
            variant="link" 
            className="text-white hover:text-casino-gold"
          >
            Rules
          </Button>
          <SocialMediaLinks />
        </div>
        <p>Round 1</p>
      </div>

      {/* AI's Cards */}
      <div className="mb-2">
        <p className="text-white mb-1">AI's Cards: 10</p>
        <div className="flex flex-wrap justify-center gap-1">
          {Array(10).fill(null).map((_, index) => (
            <CardComponent
              key={`ai-${index}`}
              card={{ value: 0, suit: 'hearts', faceUp: false }}
            />
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-grow flex items-center justify-center mb-2">
        <div className="w-[400px] h-[400px] relative">
          <div className="absolute inset-0 bg-[#0F8A3C] rounded-lg">
            <div className="p-4 h-full flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-1 items-center">
                {tableCards.map((card, index) => (
                  <CardComponent
                    key={`table-${index}`}
                    card={{ ...card, faceUp: true }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player's Hand */}
      <div>
        <p className="text-white mb-1">{playerName}'s Cards: {playerHand.length}</p>
        <div className="flex flex-wrap justify-center gap-1">
          {playerHand.map((card, index) => (
            <CardComponent
              key={`hand-${index}`}
              card={{ ...card, faceUp: true }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};