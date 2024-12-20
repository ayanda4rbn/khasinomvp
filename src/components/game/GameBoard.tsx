import React, { useState, useEffect } from 'react';
import { Card, BuildType } from '@/types/game';
import { TableArea } from './TableArea';
import { handleAITurn } from './utils/AILogic';
import { toast } from "sonner";
import { GameHeader } from './GameHeader';
import { PlayerHand } from './PlayerHand';
import { AIHand } from './AIHand';

interface GameBoardProps {
  playerGoesFirst: boolean;
  tableCards: Card[];
  playerHand: Card[];
  aiHand: Card[];
  deck: Card[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  playerGoesFirst, 
  tableCards: initialTableCards, 
  playerHand: initialPlayerHand,
  aiHand: initialAiHand,
  deck: initialDeck
}) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const playerName = localStorage.getItem("guestName") || "Player";
  const [tableCards, setTableCards] = useState<Card[]>(initialTableCards);
  const [playerHand, setPlayerHand] = useState<Card[]>(initialPlayerHand);
  const [aiHand, setAiHand] = useState<Card[]>(initialAiHand);
  const [isPlayerTurn, setIsPlayerTurn] = useState(playerGoesFirst);
  const [currentRound, setCurrentRound] = useState(1);
  const [deck, setDeck] = useState<Card[]>(initialDeck);
  const [builds, setBuilds] = useState<BuildType[]>([]);
  const [playerChowedCards, setPlayerChowedCards] = useState<Card[]>([]);
  const [aiChowedCards, setAiChowedCards] = useState<Card[]>([]);

  useEffect(() => {
    if (!isPlayerTurn && aiHand.length > 0) {
      const timer = setTimeout(() => {
        handleAITurn(
          tableCards, 
          aiHand, 
          builds,
          setTableCards, 
          setAiHand,
          setBuilds,
          setIsPlayerTurn
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, tableCards, aiHand, builds]);

  useEffect(() => {
    if (playerHand.length === 0 && aiHand.length === 0 && currentRound === 1) {
      const timer = setTimeout(() => {
        setCurrentRound(2);
        dealNewRound();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [playerHand.length, aiHand.length, currentRound]);

  const dealNewRound = () => {
    const newPlayerHand = deck.slice(0, 10);
    const newAiHand = deck.slice(10, 20);
    const remainingDeck = deck.slice(20);

    setPlayerHand(newPlayerHand);
    setAiHand(newAiHand);
    setDeck(remainingDeck);
    setIsPlayerTurn(playerGoesFirst);
    toast.success("Round 2 starting!");
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cardIndex: number) => {
    if (!isPlayerTurn) {
      e.preventDefault();
      toast.error("It's not your turn!");
      return;
    }
    e.dataTransfer.setData('text/plain', cardIndex.toString());
  };

  const handleTableDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const card = playerHand[cardIndex];
    
    const tableRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - tableRect.left;
    const y = e.clientY - tableRect.top;
    
    const overlappingCard = tableCards.find(existingCard => {
      const existingX = existingCard.tableX || 0;
      const existingY = existingCard.tableY || 0;
      const cardWidth = 48;
      const cardHeight = 64;
      
      return (
        x < existingX + cardWidth &&
        x + cardWidth > existingX &&
        y < existingY + cardHeight &&
        y + cardHeight > existingY
      );
    });

    if (overlappingCard) {
      const buildValue = card.value + overlappingCard.value;
      if (buildValue <= 10 && playerHand.some(c => c.value === buildValue)) {
        const buildCards = card.value < overlappingCard.value 
          ? [card, overlappingCard] 
          : [overlappingCard, card];
          
        const newBuild: BuildType = {
          id: Date.now(),
          cards: buildCards,
          value: buildValue,
          position: { x: overlappingCard.tableX || 0, y: overlappingCard.tableY || 0 },
          owner: 'player'
        };
        
        setBuilds([...builds, newBuild]);
        setTableCards(tableCards.filter(c => c !== overlappingCard));
        
        const newPlayerHand = [...playerHand];
        newPlayerHand.splice(cardIndex, 1);
        setPlayerHand(newPlayerHand);
      } else {
        toast.error("Invalid build! You must have a card matching the build value.");
        return;
      }
    } else {
      const newCard: Card = {
        ...card,
        tableX: x,
        tableY: y,
        playedBy: 'player',
        faceUp: true
      };

      setTableCards([...tableCards, newCard]);
      
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(cardIndex, 1);
      setPlayerHand(newPlayerHand);
    }

    setIsPlayerTurn(false);
  };

  return (
    <div className="h-screen bg-casino-green p-4 flex flex-col">
      <GameHeader 
        showLeaveDialog={showLeaveDialog}
        setShowLeaveDialog={setShowLeaveDialog}
        currentRound={currentRound}
      />
      
      <AIHand cards={aiHand} />

      <div className="flex-grow flex items-center justify-center mb-1">
        <TableArea
          tableCards={tableCards}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleTableDrop}
          playerName={playerName}
          playerChowedCards={playerChowedCards}
          aiChowedCards={aiChowedCards}
          builds={builds}
        />
      </div>

      <PlayerHand 
        playerName={playerName}
        cards={playerHand}
        isPlayerTurn={isPlayerTurn}
        onDragStart={handleDragStart}
      />
    </div>
  );
};