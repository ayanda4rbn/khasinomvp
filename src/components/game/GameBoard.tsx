import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';
import { TableArea } from './TableArea';
import { handleAITurn } from './utils/AILogic';
import { SocialMediaLinks } from '@/components/layout/SocialMediaLinks';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameBoardProps {
  playerGoesFirst: boolean;
  tableCards: Card[];
  playerHand: Card[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  playerGoesFirst, 
  tableCards: initialTableCards, 
  playerHand: initialPlayerHand 
}) => {
  const navigate = useNavigate();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const playerName = localStorage.getItem("guestName") || "Player";
  const [tableCards, setTableCards] = useState<Card[]>(initialTableCards);
  const [playerHand, setPlayerHand] = useState<Card[]>(initialPlayerHand);
  const [isPlayerTurn, setIsPlayerTurn] = useState(playerGoesFirst);

  // Effect to handle AI's turn
  useEffect(() => {
    if (!isPlayerTurn) {
      const timer = setTimeout(() => {
        handleAITurn(tableCards, playerHand, setTableCards, setPlayerHand, setIsPlayerTurn);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, tableCards, playerHand]);

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
    
    // Get drop coordinates relative to the table
    const tableRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - tableRect.left;
    const y = e.clientY - tableRect.top;
    
    // Check if the position overlaps with any existing cards
    const cardWidth = 48; // w-12 = 3rem = 48px
    const cardHeight = 64; // h-16 = 4rem = 64px
    const isOverlapping = tableCards.some(existingCard => {
      const existingX = existingCard.tableX || 0;
      const existingY = existingCard.tableY || 0;
      return (
        x < existingX + cardWidth &&
        x + cardWidth > existingX &&
        y < existingY + cardHeight &&
        y + cardHeight > existingY
      );
    });

    if (isOverlapping) {
      toast.error("Cannot place card on top of another card!");
      return;
    }

    // Add the card to the table with its position
    const newTableCards = [...tableCards, { ...card, tableX: x, tableY: y }];
    setTableCards(newTableCards);

    // Remove the card from player's hand
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);

    // End player's turn
    setIsPlayerTurn(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen bg-casino-green p-4 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-2">
        <div className="flex items-center gap-4">
          <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <AlertDialogTrigger asChild>
              <h2 className="text-2xl font-bold cursor-pointer hover:text-casino-gold">
                Cassino Game
              </h2>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Game?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave the current game? Your progress will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate('/')}>Leave Game</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            variant="link" 
            className="text-white hover:text-casino-gold"
          >
            Rules
          </Button>
        </div>
        <SocialMediaLinks />
        <p>Round 1</p>
      </div>

      {/* AI's Cards */}
      <div className="mb-1">
        <p className="text-white mb-1">AI's Cards: {playerHand.length}</p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {Array(playerHand.length).fill(null).map((_, index) => (
            <CardComponent
              key={`ai-${index}`}
              card={{ value: 0, suit: 'hearts', faceUp: false }}
            />
          ))}
        </div>
      </div>

      {/* Table Area with Captured Cards Boxes */}
      <div className="flex-grow flex items-center justify-center mb-1">
        <TableArea
          tableCards={tableCards}
          onDragOver={handleDragOver}
          onDrop={handleTableDrop}
          playerName={playerName}
        />
      </div>

      {/* Player's Hand */}
      <div className="mt-auto">
        <p className="text-white mb-1">{playerName}'s Cards: {playerHand.length}</p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {playerHand.map((card, index) => (
            <CardComponent
              key={`hand-${index}`}
              card={{ ...card, faceUp: true }}
              isDraggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};