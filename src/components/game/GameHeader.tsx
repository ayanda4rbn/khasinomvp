import React from 'react';
import { useNavigate } from 'react-router-dom';
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

interface GameHeaderProps {
  showLeaveDialog: boolean;
  setShowLeaveDialog: (show: boolean) => void;
  currentRound: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  showLeaveDialog,
  setShowLeaveDialog,
  currentRound,
}) => {
  const navigate = useNavigate();

  return (
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
        <Button variant="link" className="text-white hover:text-casino-gold">
          Rules
        </Button>
      </div>
      <SocialMediaLinks />
      <p>Round {currentRound}</p>
    </div>
  );
};