
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
  const [potentialDropTarget, setPotentialDropTarget] = useState<Card | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Get table dimensions
    const tableRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - tableRect.left;
    const y = e.clientY - tableRect.top;
    
    // Define boundaries
    const CARD_WIDTH = 48;
    const CARD_HEIGHT = 64;
    const PADDING = 20;
    
    // Check if the cursor is within the safe drop zone
    const isWithinBounds = 
      x >= PADDING &&
      x <= tableRect.width - CARD_WIDTH - PADDING &&
      y >= PADDING &&
      y <= tableRect.height - CARD_HEIGHT - PADDING;
    
    // Only allow dropping within bounds
    if (!isWithinBounds) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const constrainPosition = (x: number, y: number, tableRect: DOMRect) => {
    const CARD_WIDTH = 48;
    const CARD_HEIGHT = 64;
    const PADDING = 20;
    
    return {
      x: Math.max(PADDING, Math.min(x, tableRect.width - CARD_WIDTH - PADDING)),
      y: Math.max(PADDING, Math.min(y, tableRect.height - CARD_HEIGHT - PADDING))
    };
  };

  const handleTableDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const tableRect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - tableRect.left;
    const rawY = e.clientY - tableRect.top;
    
    // Constrain the position within table boundaries
    const { x, y } = constrainPosition(rawX, rawY, tableRect);
    
    // Instead of creating a new event, we'll modify the original event's coordinates
    Object.defineProperties(e, {
      clientX: { value: tableRect.left + x },
      clientY: { value: tableRect.top + y }
    });
    
    onDrop(e);
  };

  const handleCardClick = (card: Card) => {
    if (!isPlayerTurn) return;

    if (selectedCards.length > 0 && selectedCards[0].value === card.value) {
      setSelectedCards([]);
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
    setPotentialDropTarget(null);
  };

  const handleTableDragOver = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    e.preventDefault();
    setPotentialDropTarget(card);
  };

  const handleTableDragLeave = () => {
    setPotentialDropTarget(null);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch w-full max-w-[1024px] gap-2">
      {/* Left side area for chowed cards */}
      <div className="flex flex-row md:flex-col justify-between w-full md:w-auto h-full gap-4 md:mr-4">
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
        className="w-full md:w-[800px] h-[300px] md:h-[400px] bg-[#0F8A3C] rounded-lg relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 p-4"
          onDragOver={handleDragOver}
          onDrop={handleTableDrop}
        >
          {/* Table cards */}
          {tableCards.map((card, index) => (
            <div
              key={`table-${index}`}
              className={`absolute transition-transform ${
                potentialDropTarget === card ? 'ring-4 ring-casino-gold ring-opacity-50' : ''
              }`}
              style={{
                left: Math.min(Math.max(card.tableX || 0, 0), 720) + 'px',
                top: Math.min(Math.max(card.tableY || 0, 0), 320) + 'px',
                zIndex: isDraggingTable ? 1000 : 1,
              }}
              draggable={isPlayerTurn}
              onDragStart={(e) => handleTableCardDragStart(e, card)}
              onDragEnd={handleTableCardDragEnd}
              onDragOver={(e) => handleTableDragOver(e, card)}
              onDragLeave={handleTableDragLeave}
              onClick={() => handleCardClick(card)}
            >
              <CardComponent
                card={{ ...card, faceUp: true }}
                isSelected={selectedCards.includes(card)}
                isDraggable={isPlayerTurn}
              />
            </div>
          ))}

          {/* Builds displayed as card stacks */}
          {builds.map((build, buildIndex) => (
            <div
              key={`build-${buildIndex}`}
              className="absolute"
              style={{
                left: Math.min(Math.max(build.position.x, 0), 720) + 'px',
                top: Math.min(Math.max(build.position.y, 0), 320) + 'px',
                zIndex: 2
              }}
            >
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
              <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-casino-gold rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold z-50">
                {build.value}
              </div>
              <div className="absolute -bottom-2 -right-2 text-[10px] md:text-xs text-white bg-black/50 px-1 rounded">
                {build.owner === 'player' ? playerName : 'AI'}
              </div>
            </div>
          ))}
        </div>
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
