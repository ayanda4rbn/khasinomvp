
import React, { useState } from 'react';
import { Card, BuildType } from '@/types/game';
import { CardComponent } from './CardComponent';
import { Button } from '@/components/ui/button';

interface TableAreaProps {
  tableCards: Card[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  playerName: string;
  playerChowedCards: Card[];
  aiChowedCards: Card[];
  builds?: BuildType[];
  isPlayerTurn: boolean;
  onEndTurn: () => void;
  hasPlayedCard: boolean;
}

export const TableArea: React.FC<TableAreaProps> = ({
  tableCards,
  onDragOver,
  onDrop,
  playerName,
  playerChowedCards = [],
  aiChowedCards = [],
  builds = [],
  isPlayerTurn,
  onEndTurn,
  hasPlayedCard,
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isDraggingTable, setIsDraggingTable] = useState(false);

  const handleCardClick = (card: Card) => {
    if (!isPlayerTurn) return;

    // Check if clicking cards with the same value
    if (selectedCards.length > 0 && selectedCards[0].value === card.value) {
      // If we don't have a matching sum card, this should be a chow
      const sumValue = card.value;
      setSelectedCards([]);
      // Trigger chow logic here if needed
      return;
    }

    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleTableCardDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (!isPlayerTurn) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/table-card', JSON.stringify(card));
    setIsDraggingTable(true);
  };

  const handleTableCardDragEnd = () => {
    setIsDraggingTable(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center w-full max-w-[880px] gap-4 px-2">
      {/* Left side area for chowed cards */}
      <div className="flex flex-row md:flex-col justify-between w-full md:w-auto md:h-[300px] gap-4 md:mr-8">
        {/* AI's chowed cards */}
        <div className="flex items-center">
          <span className="text-white mr-2 text-sm md:text-base whitespace-nowrap">AI chowed cards</span>
          <div className="w-10 h-14 md:w-12 md:h-16 border-2 border-casino-gold rounded-lg relative">
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
          <span className="text-white mr-2 text-sm md:text-base whitespace-nowrap">{playerName}'s chowed</span>
          <div className="w-10 h-14 md:w-12 md:h-16 border-2 border-casino-gold rounded-lg relative">
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

        {/* End Turn Button */}
        {isPlayerTurn && (
          <Button 
            onClick={onEndTurn}
            className="hidden md:block mt-4"
            disabled={!hasPlayedCard}
          >
            End Turn
          </Button>
        )}
      </div>

      {/* Main Table */}
      <div 
        className="w-full md:w-[550px] h-[200px] md:h-[300px] bg-[#0F8A3C] rounded-lg relative overflow-hidden"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Grid for card placement */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2">
          {/* Regular table cards */}
          {tableCards.map((card, index) => (
            <div
              key={`table-${index}`}
              className="relative"
              draggable={isPlayerTurn}
              onDragStart={(e) => handleTableCardDragStart(e, card)}
              onDragEnd={handleTableCardDragEnd}
              onClick={() => handleCardClick(card)}
              style={{
                gridColumn: Math.floor((card.tableX || 0) / (550/6)) + 1,
                gridRow: Math.floor((card.tableY || 0) / (300/4)) + 1,
                zIndex: isDraggingTable ? 1000 : 1
              }}
            >
              <CardComponent
                card={{ ...card, faceUp: true }}
                isSelected={selectedCards.includes(card)}
                isDraggable={isPlayerTurn}
              />
            </div>
          ))}
        </div>

        {/* Builds displayed as card stacks with value indicators */}
        {builds.map((build, buildIndex) => (
          <div
            key={`build-${buildIndex}`}
            className="relative"
            style={{
              position: 'absolute',
              left: `${(build.position.x / 550) * 100}%`,
              top: `${(build.position.y / 300) * 100}%`,
              zIndex: 2
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
                  zIndex: cardIndex + 10,
                }}
              >
                <CardComponent card={{ ...card, faceUp: true }} />
              </div>
            ))}
            {/* Build value indicator */}
            <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-casino-gold rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold z-50">
              {build.value}
            </div>
            {/* Owner indicator */}
            <div className="absolute -bottom-2 -right-2 text-[10px] md:text-xs text-white bg-black/50 px-1 rounded">
              {build.owner === 'player' ? playerName : 'AI'}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile End Turn Button */}
      {isPlayerTurn && (
        <Button 
          onClick={onEndTurn}
          className="md:hidden w-full mt-2"
          disabled={!hasPlayedCard}
        >
          End Turn
        </Button>
      )}
    </div>
  );
};
