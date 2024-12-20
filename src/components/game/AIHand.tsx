import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface AIHandProps {
  cards: Card[];
}

export const AIHand: React.FC<AIHandProps> = ({ cards }) => {
  return (
    <div className="mb-1">
      <p className="text-white mb-1">AI's Cards: {cards.length}</p>
      <div className="flex flex-wrap justify-center gap-0.5">
        {Array(cards.length).fill(null).map((_, index) => (
          <CardComponent
            key={`ai-${index}`}
            card={{ value: 0, suit: 'hearts', faceUp: false }}
          />
        ))}
      </div>
    </div>
  );
};