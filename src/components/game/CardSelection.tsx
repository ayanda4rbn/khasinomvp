import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';
import { useToast } from "@/hooks/use-toast";

interface CardSelectionProps {
  selectionCards: Card[];
  onCardSelect: (index: number) => void;
}

export const CardSelection: React.FC<CardSelectionProps> = ({ selectionCards, onCardSelect }) => {
  return (
    <div className="min-h-screen bg-casino-green p-8">
      <div className="text-white mb-8">
        <h2 className="text-2xl font-bold mb-4">Select a card to determine who plays first</h2>
        <p>The player with the lower value card will play first</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        {selectionCards.map((card, index) => (
          <CardComponent
            key={`selection-${index}`}
            card={card}
            onClick={() => !card.faceUp && onCardSelect(index)}
          />
        ))}
      </div>
    </div>
  );
};