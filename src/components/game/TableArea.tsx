import React from 'react';
import { Card, BuildType } from '@/types/game';
import { CardComponent } from './CardComponent';

interface TableAreaProps {
  tableCards: Card[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  playerName: string;
  playerChowedCards: Card[];
  aiChowedCards: Card[];
  builds?: BuildType[];
}

export const TableArea: React.FC<TableAreaProps> = ({
  tableCards,
  onDragOver,
  onDrop,
  playerName,
  playerChowedCards = [], // Default to empty array if undefined
  aiChowedCards = [], // Default to empty array if undefined
  builds = [], // Default to empty array if undefined
}) => {
  return (
    <div className="flex items-start w-full max-w-[880px]">
      {/* Left side area for chowed cards */}
      <div className="flex flex-col justify-between h-[300px] mr-8">
        {/* AI's chowed cards */}
        <div className="flex items-center">
          <span className="text-white mr-2 whitespace-nowrap">AI chowed cards</span>
          <div className="w-12 h-16 border-2 border-casino-gold rounded-lg relative">
            {aiChowedCards.map((card, index) => (
              <div 
                key={`ai-chowed-${index}`}
                className="absolute"
                style={{ 
                  top: `${index * -2}px`, 
                  left: `${index * 2}px`,
                  zIndex: index 
                }}
              >
                <CardComponent card={{ ...card, faceUp: true }} />
              </div>
            ))}
          </div>
        </div>
        {/* Player's chowed cards */}
        <div className="flex items-center">
          <span className="text-white mr-2 whitespace-nowrap">{playerName}'s chowed cards</span>
          <div className="w-12 h-16 border-2 border-casino-gold rounded-lg relative">
            {playerChowedCards.map((card, index) => (
              <div 
                key={`player-chowed-${index}`}
                className="absolute"
                style={{ 
                  top: `${index * -2}px`, 
                  left: `${index * 2}px`,
                  zIndex: index 
                }}
              >
                <CardComponent card={{ ...card, faceUp: true }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div 
        className="w-[550px] h-[300px] bg-[#0F8A3C] rounded-lg relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Regular table cards */}
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

        {/* Builds displayed as card stacks with value indicators */}
        {builds.map((build, buildIndex) => (
          <div
            key={`build-${buildIndex}`}
            className="relative"
            style={{
              position: 'absolute',
              left: build.position.x,
              top: build.position.y,
            }}
          >
            {/* Stack of cards in the build */}
            {build.cards.map((card, cardIndex) => (
              <div
                key={`build-${buildIndex}-card-${cardIndex}`}
                className="absolute"
                style={{
                  top: `${cardIndex * -2}px`,
                  left: `${cardIndex * 2}px`,
                  zIndex: cardIndex,
                }}
              >
                <CardComponent card={{ ...card, faceUp: true }} />
              </div>
            ))}
            {/* Build value indicator */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-casino-gold rounded-full flex items-center justify-center text-white text-sm font-bold z-50">
              {build.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};