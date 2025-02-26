
import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface TableCardProps {
  card: Card;
  index: number;
  isSelected: boolean;
  isDraggingTable: boolean;
  isPlayerTurn: boolean;
  isPotentialTarget: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onDragLeave: () => void;
  onClick: (card: Card) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  card,
  index,
  isSelected,
  isDraggingTable,
  isPlayerTurn,
  isPotentialTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onClick,
}) => {
  return (
    <div
      key={`table-${index}`}
      className={`absolute transition-transform ${
        isPotentialTarget ? 'ring-4 ring-casino-gold ring-opacity-50' : ''
      }`}
      style={{
        left: Math.min(Math.max(card.tableX || 0, 0), 720) + 'px',
        top: Math.min(Math.max(card.tableY || 0, 0), 320) + 'px',
        zIndex: isDraggingTable ? 1000 : 1,
      }}
      draggable={isPlayerTurn}
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, card)}
      onDragLeave={onDragLeave}
      onClick={() => onClick(card)}
    >
      <CardComponent
        card={{ ...card, faceUp: true }}
        isSelected={isSelected}
        isDraggable={isPlayerTurn}
      />
    </div>
  );
};
