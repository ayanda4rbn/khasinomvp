import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';
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

    // End player's turn and trigger AI turn
    setIsPlayerTurn(false);
    setTimeout(handleAITurn, 1000);
  };

  const handleAITurn = () => {
    // Simple AI: just discard a random card
    const aiCardIndex = Math.floor(Math.random() * playerHand.length);
    const aiCard = playerHand[aiCardIndex];

    // Find a random empty spot on the table
    let x, y;
    let isValidPosition = false;
    const maxAttempts = 50;
    let attempts = 0;

    while (!isValidPosition && attempts < maxAttempts) {
      x = Math.random() * 400 + 50; // Add some padding from edges
      y = Math.random() * 200 + 50;

      isValidPosition = !tableCards.some(existingCard => {
        const existingX = existingCard.tableX || 0;
        const existingY = existingCard.tableY || 0;
        return (
          x < existingX + 48 &&
          x + 48 > existingX &&
          y < existingY + 64 &&
          y + 64 > existingY
        );
      });

      attempts++;
    }

    if (isValidPosition) {
      const newTableCards = [...tableCards, { ...aiCard, tableX: x, tableY: y }];
      setTableCards(newTableCards);

      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(aiCardIndex, 1);
      setPlayerHand(newPlayerHand);

      toast.info("AI discarded a card");
      setIsPlayerTurn(true);
    } else {
      toast.error("AI couldn't find a valid position to place the card");
      setIsPlayerTurn(true);
    }
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
        <div className="flex items-start w-full max-w-[800px]">
          {/* Left side area for chowed cards */}
          <div className="flex flex-col justify-between h-[300px] mr-4">
            {/* AI's chowed cards */}
            <div className="flex items-center">
              <span className="text-white mr-2 whitespace-nowrap">AI chowed cards</span>
              <div className="w-12 h-16 border-2 border-casino-gold rounded-lg"></div>
            </div>
            {/* Player's chowed cards */}
            <div className="flex items-center">
              <span className="text-white mr-2 whitespace-nowrap">{playerName}'s chowed cards</span>
              <div className="w-12 h-16 border-2 border-casino-gold rounded-lg"></div>
            </div>
          </div>

          {/* Main Table */}
          <div 
            className="w-[500px] h-[300px] bg-[#0F8A3C] rounded-lg relative"
            onDragOver={handleDragOver}
            onDrop={handleTableDrop}
          >
            {tableCards.map((card, index) => (
              <div
                key={`table-${index}`}
                style={{
                  position: 'absolute',
                  left: card.tableX || 0,
                  top: card.tableY || 0,
                }}
              >
                <CardComponent
                  card={{ ...card, faceUp: true }}
                />
              </div>
            ))}
          </div>
        </div>
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