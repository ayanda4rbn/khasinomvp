
import React from 'react';
import { BuildType } from '@/types/game';
import { CardComponent } from './CardComponent';

interface BuildStackProps {
  build: BuildType;
}

export const BuildStack: React.FC<BuildStackProps> = ({ build }) => {
  return (
    <div
      className="absolute"
      style={{
        left: Math.min(Math.max(build.position.x, 0), 720) + 'px',
        top: Math.min(Math.max(build.position.y, 0), 320) + 'px',
        zIndex: 2
      }}
    >
      {build.cards.map((card, cardIndex) => (
        <div
          key={`build-card-${cardIndex}`}
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
      <div className={`absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs md:text-sm font-bold z-50 ${
        build.owner === 'player' 
          ? 'bg-casino-gold text-black' 
          : 'bg-[#ea384c] text-white'
      }`}>
        {build.value}
      </div>
    </div>
  );
};
