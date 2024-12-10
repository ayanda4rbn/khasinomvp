import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface GameBoardProps {
  playerGoesFirst: boolean;
  tableCards: Card[];
  playerHand: Card[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerGoesFirst, tableCards, playerHand }) => {
  const playerName = localStorage.getItem("guestName") || "Player";

  return (
    <div className="min-h-screen bg-casino-green p-8">
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-8">
        <h2 className="text-2xl font-bold">Cassino Game</h2>
        <p>Round 1</p>
      </div>

      {/* AI's Cards */}
      <div className="mb-8">
        <p className="text-white mb-2">AI's Cards: 10</p>
        <div className="flex flex-wrap justify-center gap-2">
          {Array(10).fill(null).map((_, index) => (
            <CardComponent
              key={`ai-${index}`}
              card={{ value: 0, suit: 'hearts', faceUp: false }}
            />
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#0B3B1F] rounded-lg" />
        <div className="relative p-8">
          <div className="flex flex-wrap justify-center gap-4">
            {tableCards.map((card, index) => (
              <CardComponent
                key={`table-${index}`}
                card={{ ...card, faceUp: true }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Player's Hand */}
      <div>
        <p className="text-white mb-2">{playerName}'s Cards: {playerHand.length}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {playerHand.map((card, index) => (
            <CardComponent
              key={`hand-${index}`}
              card={{ ...card, faceUp: true }}
            />
          ))}
        </div>
        <p className="text-white text-center mt-4">
          {playerGoesFirst ? "Your turn" : "AI's turn"}. Drag cards to perform actions.
        </p>
      </div>
    </div>
  );
};