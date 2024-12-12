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
        <div className="flex items-start w-full max-w-[800px] pl-8">
          {/* Left side area for chowed cards */}
          <div className="flex flex-col justify-between h-[300px] mr-6">
            {/* AI's chowed cards */}
            <div className="flex items-center">
              <span className="text-white mr-2 whitespace-nowrap">AI chowed cards</span>
              <div className="w-14 h-20 border-2 border-casino-gold rounded-lg"></div>
            </div>
            {/* Player's chowed cards */}
            <div className="flex items-center">
              <span className="text-white mr-2 whitespace-nowrap">{playerName}'s chowed cards</span>
              <div className="w-14 h-20 border-2 border-casino-gold rounded-lg"></div>
            </div>
          </div>

          {/* Main Table */}
          <div className="w-[500px] h-[300px] bg-[#0F8A3C] rounded-lg">
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

      {/* Player's Hand */}
      <div className="mt-auto">
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