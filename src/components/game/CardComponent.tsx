
import React from 'react';
import { Card } from '@/types/game';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  isDraggable?: boolean;
  isSelected?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const CardComponent: React.FC<CardComponentProps> = ({ 
  card, 
  onClick, 
  className = '',
  isDraggable = false,
  isSelected = false,
  onDragStart,
  onDragEnd,
}) => {
  const suitSymbol = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }[card.suit];

  const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';
  const cardStyle = card.faceUp 
    ? `w-10 h-14 md:w-12 md:h-16 bg-white rounded-lg border-2 ${isSelected ? 'border-casino-gold' : 'border-gray-300'} flex flex-col items-center justify-center m-0.5 relative ${color} ${isSelected ? 'ring-2 ring-casino-gold' : ''} ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`
    : `w-10 h-14 md:w-12 md:h-16 bg-blue-500 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center m-0.5 cursor-pointer hover:bg-blue-600 ${className}`;

  return (
    <div 
      className={cardStyle} 
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-card-value={card.value}
      data-card-suit={card.suit}
    >
      {card.faceUp ? (
        <>
          <div className="absolute top-1 left-1.5 md:left-2 text-xs md:text-sm font-bold">{card.value}</div>
          <div className="absolute top-3 md:top-4 left-1.5 md:left-2 text-[10px] md:text-xs">{suitSymbol}</div>
          <div className="text-xl md:text-2xl">{suitSymbol}</div>
        </>
      ) : null}
    </div>
  );
};
