import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface PlayerHandProps {
  playerName: string;
  cards: Card[];
  isPlayerTurn: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  playerName,
  cards,
  isPlayerTurn,
  onDragStart,
}) => {
  return (
    <div className="mt-auto">
      <p className="text-white mb-1">{playerName}'s Cards: {cards.length}</p>
      <div className="flex flex-wrap justify-center gap-0.5">
        {cards.map((card, index) => (
          <CardComponent
            key={`hand-${index}`}
            card={{ ...card, faceUp: true }}
            isDraggable={true}
            onDragStart={(e) => onDragStart(e, index)}
          />
        ))}
      </div>
    </div>
  );
};