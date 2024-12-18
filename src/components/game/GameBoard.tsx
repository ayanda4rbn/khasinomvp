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
  deck: Card[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  playerGoesFirst, 
  tableCards: initialTableCards, 
  playerHand: initialPlayerHand,
  deck: initialDeck
}) => {
  const navigate = useNavigate();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const playerName = localStorage.getItem("guestName") || "Player";
  const [tableCards, setTableCards] = useState<Card[]>(initialTableCards);
  const [playerHand, setPlayerHand] = useState<Card[]>(initialPlayerHand);
  const [aiHand, setAiHand] = useState<Card[]>(initialPlayerHand);
  const [isPlayerTurn, setIsPlayerTurn] = useState(playerGoesFirst);
  const [currentRound, setCurrentRound] = useState(1);
  const [deck, setDeck] = useState<Card[]>(initialDeck);

  // Effect to handle AI's turn
  useEffect(() => {
    if (!isPlayerTurn && aiHand.length > 0) {
      const timer = setTimeout(() => {
        handleAITurn(tableCards, aiHand, setTableCards, setAiHand, setIsPlayerTurn);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, tableCards, aiHand]);

  // Effect to check if round is over and start new round
  useEffect(() => {
    if (playerHand.length === 0 && aiHand.length === 0 && currentRound === 1) {
      // Start round 2
      const timer = setTimeout(() => {
        setCurrentRound(2);
        dealNewRound();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [playerHand.length, aiHand.length, currentRound]);

  const dealNewRound = () => {
    // Deal remaining cards for round 2
    const newPlayerHand = deck.slice(0, 10);
    const newAiHand = deck.slice(10, 20);
    const remainingDeck = deck.slice(20);

    setPlayerHand(newPlayerHand);
    setAiHand(newAiHand);
    setDeck(remainingDeck);
    setIsPlayerTurn(playerGoesFirst); // Keep same first player for round 2
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
    
    const cardWidth = 48;
    const cardHeight = 64;
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

    const newCard: Card = {
      ...card,
      tableX: x,
      tableY: y,
      playedBy: 'player' as const
    };

    setTableCards([...tableCards, newCard]);
    
    const newPlayerHand = [...playerHand];
    newPlayerHand.splice(cardIndex, 1);
    setPlayerHand(newPlayerHand);

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
            <AlertDialogTrigger>
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
        <p>Round {currentRound}</p>
      </div>

      {/* AI's Cards */}
      <div className="mb-1">
        <p className="text-white mb-1">AI's Cards: {aiHand.length}</p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {Array(aiHand.length).fill(null).map((_, index) => (
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