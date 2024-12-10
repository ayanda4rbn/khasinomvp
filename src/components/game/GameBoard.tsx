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
    <div className="min-h-screen bg-casino-green p-4">
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-4">
        <h2 className="text-2xl font-bold">Cassino Game</h2>
        <p>Round 1</p>
      </div>

      {/* AI's Cards */}
      <div className="mb-4">
        <p className="text-white mb-2">AI's Cards: 10</p>
        <div className="flex flex-wrap justify-center gap-1">
          {Array(10).fill(null).map((_, index) => (
            <CardComponent
              key={`ai-${index}`}
              card={{ value: 0, suit: 'hearts', faceUp: false }}
            />
          ))}
        </div>
      </div>

      {/* Table Area - Square shape with darker green */}
      <div className="relative mb-4">
        <div className="w-full pb-[100%] relative"> {/* This creates a square aspect ratio */}
          <div className="absolute inset-0 bg-[#0B3B1F] rounded-lg">
            <div className="p-8 h-full flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-2 items-center">
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
        <p className="text-white mb-2">{playerName}'s Cards: {playerHand.length}</p>
        <div className="flex flex-wrap justify-center gap-1">
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