
import React from 'react';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';

interface ChowedCardsSectionProps {
  title: string;
  cards: Card[];
  borderColor: "casino-gold" | "[#ea384c]";
}

export const ChowedCardsSection: React.FC<ChowedCardsSectionProps> = ({
  title,
  cards,
  borderColor
}) => {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-start">
        <span className="text-white mb-2 text-sm md:text-base whitespace-nowrap">{title}</span>
        <div className={`w-10 h-14 md:w-12 md:h-16 border-2 border-${borderColor} rounded-lg relative`}>
          {cards.map((card, index) => (
            <div 
              key={`chowed-${index}`}
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
    </div>
  );
};
