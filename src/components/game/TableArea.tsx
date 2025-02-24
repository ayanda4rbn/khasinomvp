import React, { useState, useRef } from 'react';
import { Card, BuildType } from '@/types/game';
import { CardComponent } from './CardComponent';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

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
  playerHand: Card[];
  setPlayerHand: (hand: Card[]) => void;
  setTableCards: (cards: Card[]) => void;
  setPlayerChowedCards: React.Dispatch<React.SetStateAction<Card[]>>;
  setIsPlayerTurn: (isPlayerTurn: boolean) => void;
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
  playerHand,
  setPlayerHand,
  setTableCards,
  setPlayerChowedCards,
  setIsPlayerTurn,
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [draggedTableCard, setDraggedTableCard] = useState<Card | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const generateRandomPosition = () => {
    if (!tableRef.current) return { x: 0, y: 0 };
    const tableWidth = tableRef.current.clientWidth;
    const tableHeight = tableRef.current.clientHeight;
    const cardWidth = 48;
    const cardHeight = 64;
    
    return {
      x: Math.random() * (tableWidth - cardWidth - 20) + 10,
      y: Math.random() * (tableHeight - cardHeight - 20) + 10
    };
  };

  const handleTableCardDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (!isPlayerTurn) {
      e.preventDefault();
      return;
    }
    setDraggedTableCard(card);
    e.dataTransfer.setData('text/plain', 'table-card');
  };

  const handleCardDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const handCardIndex = e.dataTransfer.getData('text/plain');
    const isFromHand = !isNaN(Number(handCardIndex));
    const cardFromHand = isFromHand ? playerHand[Number(handCardIndex)] : null;
    
    // Get drop coordinates relative to table
    const tableRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - tableRect.left;
    const y = e.clientY - tableRect.top;

    // Find overlapping card
    const overlappingCard = tableCards.find(card => {
      const cardRect = {
        left: card.tableX || 0,
        top: card.tableY || 0,
        right: (card.tableX || 0) + 48,
        bottom: (card.tableY || 0) + 64
      };
      return x >= cardRect.left && x <= cardRect.right && y >= cardRect.top && y <= cardRect.bottom;
    });

    if (cardFromHand && overlappingCard) {
      // Handle matching values (chow)
      if (cardFromHand.value === overlappingCard.value) {
        const newChowedCards = [...playerChowedCards, overlappingCard, cardFromHand];
        setPlayerChowedCards(newChowedCards);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        setPlayerHand(playerHand.filter((_, i) => i !== Number(handCardIndex)));
        setIsPlayerTurn(false);
        toast.success("Cards chowed!");
        return;
      }
    }

    if (draggedTableCard && overlappingCard && cardFromHand) {
      // Calculate total value for potential build
      const totalValue = draggedTableCard.value + overlappingCard.value + cardFromHand.value;
      
      // Check if player has matching card for the build
      if (totalValue <= 10 && playerHand.some(c => c.value === totalValue)) {
        const { x: newX, y: newY } = generateRandomPosition();
        const newBuild: BuildType = {
          id: Date.now(),
          cards: [draggedTableCard, overlappingCard, cardFromHand],
          value: totalValue,
          position: { x: newX, y: newY },
          owner: 'player'
        };
        
        setTableCards(prev => prev.filter(c => c !== draggedTableCard && c !== overlappingCard));
        setPlayerHand(prev => prev.filter((_, i) => i !== Number(handCardIndex)));
        builds?.push(newBuild);
        toast.success("Build created!");
        return;
      }
    }

    // Default card placement with random position
    if (cardFromHand) {
      const { x: newX, y: newY } = generateRandomPosition();
      const newCard: Card = {
        ...cardFromHand,
        tableX: newX,
        tableY: newY,
        playedBy: 'player',
        faceUp: true
      };
      setTableCards([...tableCards, newCard]);
      setPlayerHand(playerHand.filter((_, i) => i !== Number(handCardIndex)));
    }
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
        ref={tableRef}
        className="w-full md:w-[550px] h-[200px] md:h-[300px] bg-[#0F8A3C] rounded-lg relative overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCardDrop}
      >
        {/* Regular table cards */}
        {tableCards.map((card, index) => (
          <div
            key={`table-${index}`}
            className="absolute"
            style={{
              left: card.tableX ? `${card.tableX}px` : 0,
              top: card.tableY ? `${card.tableY}px` : 0,
              zIndex: 10 + index,
            }}
            draggable={isPlayerTurn}
            onDragStart={(e) => handleTableCardDragStart(e, card)}
          >
            <CardComponent
              card={{ ...card, faceUp: true }}
              isSelected={selectedCards.includes(card)}
            />
          </div>
        ))}

        {/* Builds displayed as card stacks */}
        {builds.map((build, buildIndex) => (
          <div
            key={`build-${buildIndex}`}
            className="absolute"
            style={{
              left: `${build.position.x}px`,
              top: `${build.position.y}px`,
              zIndex: 100 + buildIndex,
            }}
          >
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
            <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-casino-gold rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold z-50">
              {build.value}
            </div>
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
