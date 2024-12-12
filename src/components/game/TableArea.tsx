import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface TableAreaProps {
  tableCards: Card[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  playerName: string;
}

export const TableArea: React.FC<TableAreaProps> = ({
  tableCards,
  onDragOver,
  onDrop,
  playerName,
}) => {
  return (
    <div className="flex items-start w-full max-w-[800px]">
      {/* Left side area for chowed cards */}
      <div className="flex flex-col justify-between h-[300px] mr-4">
        {/* AI's chowed cards */}
        <div className="flex items-center">
          <span className="text-white mr-2 whitespace-nowrap">AI chowed cards</span>
          <div className="w-12 h-16 border-2 border-casino-gold rounded-lg"></div>
        </div>
        {/* Player's chowed cards */}
        <div className="flex items-center">
          <span className="text-white mr-2 whitespace-nowrap">{playerName}'s chowed cards</span>
          <div className="w-12 h-16 border-2 border-casino-gold rounded-lg"></div>
        </div>
      </div>

      {/* Main Table */}
      <div 
        className="w-[500px] h-[300px] bg-[#0F8A3C] rounded-lg relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {tableCards.map((card, index) => (
          <div
            key={`table-${index}`}
            style={{
              position: 'absolute',
              left: card.tableX || 0,
              top: card.tableY || 0,
            }}
          >
            <CardComponent
              card={{ ...card, faceUp: true }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};