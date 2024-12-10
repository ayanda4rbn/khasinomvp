import React from 'react';
import { Card } from '@/types/game';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  className?: string;
}

export const CardComponent: React.FC<CardComponentProps> = ({ card, onClick, className = '' }) => {
  const suitSymbol = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }[card.suit];

  const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';
  const cardStyle = card.faceUp 
    ? `w-12 h-16 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center m-1 ${color} ${card.selected ? 'ring-4 ring-casino-gold' : ''} ${className}`
    : `w-12 h-16 bg-blue-500 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center m-1 cursor-pointer hover:bg-blue-600 ${className}`;

  return (
    <div className={cardStyle} onClick={onClick}>
      {card.faceUp ? (
        <>
          <div className="text-sm font-bold">{card.value}</div>
          <div className="text-lg">{suitSymbol}</div>
        </>
      ) : null}
    </div>
  );
};