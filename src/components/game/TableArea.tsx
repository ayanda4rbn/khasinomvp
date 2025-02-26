
import React, { useState } from 'react';
import { Card, BuildType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { ChowedCardsSection } from './ChowedCardsSection';
import { BuildStack } from './BuildStack';
import { TableCard } from './TableCard';

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
      <div className="flex flex-row md:flex-col justify-between w-full md:w-48 h-full gap-8 md:gap-16 md:mr-4">
        <ChowedCardsSection
          title="AI chowed cards"
          cards={aiChowedCards}
          borderColor="[#ea384c]"
        />

        <ChowedCardsSection
          title={`${playerName}'s chowed`}
          cards={playerChowedCards}
          borderColor="casino-gold"
        />

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
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="absolute inset-0 p-4">
          {/* Table cards */}
          {tableCards.map((card, index) => (
            <TableCard
              key={`table-${index}`}
              card={card}
              index={index}
              isSelected={selectedCards.includes(card)}
              isDraggingTable={isDraggingTable}
              isPlayerTurn={isPlayerTurn}
              isPotentialTarget={potentialDropTarget === card}
              onDragStart={handleTableCardDragStart}
              onDragEnd={handleTableCardDragEnd}
              onDragOver={handleTableDragOver}
              onDragLeave={handleTableDragLeave}
              onClick={handleCardClick}
            />
          ))}

          {/* Builds */}
          {builds.map((build, buildIndex) => (
            <BuildStack key={`build-${buildIndex}`} build={build} />
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
