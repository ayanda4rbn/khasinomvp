import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/types/game';
import { CardComponent } from './CardComponent';
import { SocialMediaLinks } from '@/components/layout/SocialMediaLinks';
import { Button } from '@/components/ui/button';
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

export const GameBoard: React.FC<GameBoardProps> = ({ playerGoesFirst, tableCards, playerHand }) => {
  const navigate = useNavigate();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const playerName = localStorage.getItem("guestName") || "Player";

  const handleLogoClick = () => {
    setShowLeaveDialog(true);
  };

  const handleLeaveGame = () => {
    navigate('/');
  };

  const handleAIDiscard = (playerCard: Card) => {
    // AI logic to discard a low-value card when player plays a smaller card
    const aiHand = [/* ... AI's current hand */];
    let cardToDiscard = aiHand[0];
    
    // Sort cards by value, prioritizing non-point cards and lower values
    aiHand.sort((a, b) => {
      // Prioritize non-face cards and lower values
      if (a.value < 10 && b.value >= 10) return -1;
      if (a.value >= 10 && b.value < 10) return 1;
      return a.value - b.value;
    });
    
    // Select the lowest value card that isn't a point card
    cardToDiscard = aiHand.find(card => card.value < 10) || aiHand[0];
    
    // Add the discarded card to the table
    // setTableCards([...tableCards, cardToDiscard]);
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
                <AlertDialogAction onClick={handleLeaveGame}>Leave Game</AlertDialogAction>
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
        <p className="text-white mb-1">AI's Cards: 10</p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {Array(10).fill(null).map((_, index) => (
            <CardComponent
              key={`ai-${index}`}
              card={{ value: 0, suit: 'hearts', faceUp: false }}
            />
          ))}
        </div>
      </div>

      {/* Table Area with Captured Cards Boxes */}
      <div className="flex-grow flex items-center justify-center mb-1">
        <div className="w-[500px] h-[300px] relative flex">
          {/* Main Table */}
          <div className="flex-1 bg-[#0F8A3C] rounded-lg">
            <div className="p-4 h-full flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-1 items-center">
                {tableCards.map((card, index) => (
                  <CardComponent
                    key={`table-${index}`}
                    card={{ ...card, faceUp: true }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Captured Cards Area */}
      <div className="flex justify-between mb-4 px-4">
        <div className="flex items-center">
          <span className="text-white mr-2">AI chowed cards</span>
          <div className="w-20 h-28 border-2 border-casino-gold rounded-lg"></div>
        </div>
        <div className="flex items-center">
          <span className="text-white mr-2">{playerName}'s chowed cards</span>
          <div className="w-20 h-28 border-2 border-casino-gold rounded-lg"></div>
        </div>
      </div>

      {/* Player's Hand */}
      <div>
        <p className="text-white mb-1">{playerName}'s Cards: {playerHand.length}</p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {playerHand.map((card, index) => (
            <CardComponent
              key={`hand-${index}`}
              card={{ ...card, faceUp: true }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};