import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface GameBoardProps {
  playerGoesFirst: boolean;
  tableCards: Card[];
  playerHand: Card[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerGoesFirst, tableCards, playerHand }) => {
  return (
    <div className="min-h-screen bg-casino-green p-8">
      <div className="text-white mb-8">
        <h2 className="text-2xl font-bold">Playing vs AI</h2>
        <p>{playerGoesFirst ? "You" : "AI"} plays first</p>
      </div>

      {/* Table Cards */}
      <div className="mb-8">
        <h3 className="text-white mb-4">Table Cards:</h3>
        <div className="flex flex-wrap gap-2">
          {tableCards.map((card, index) => (
            <CardComponent
              key={`table-${index}`}
              card={{ ...card, faceUp: true }}
            />
          ))}
        </div>
      </div>

      {/* Player's Hand */}
      <div>
        <h3 className="text-white mb-4">Your Hand:</h3>
        <div className="flex flex-wrap gap-2">
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