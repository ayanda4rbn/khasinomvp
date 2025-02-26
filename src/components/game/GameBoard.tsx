
import React, { useEffect, useState } from 'react';
import { Card } from '@/types/game';
import { TableArea } from './TableArea';
import { handleAITurn } from './utils/AILogic';
import { toast } from "sonner";
import { GameHeader } from './GameHeader';
import { PlayerHand } from './PlayerHand';
import { AIHand } from './AIHand';
import { useGameState } from './hooks/useGameState';
import { handleDragStart, handleBuildCapture, handleBuildAugment, handleNewBuild } from './handlers/dragDropHandlers';
import { GameSummaryDialog } from './GameSummaryDialog';

interface GameBoardProps {
  playerGoesFirst: boolean;
  tableCards: Card[];
  playerHand: Card[];
  aiHand: Card[];
  deck: Card[];
  currentRound: 1 | 2;
  setCurrentRound: React.Dispatch<React.SetStateAction<1 | 2>>;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  playerGoesFirst, 
  tableCards: initialTableCards, 
  playerHand: initialPlayerHand,
  aiHand: initialAiHand,
  deck: initialDeck,
  currentRound,
  setCurrentRound
}) => {
  const gameState = useGameState(
    playerGoesFirst,
    initialTableCards,
    initialPlayerHand,
    initialAiHand,
    initialDeck
  );
  const [hasPlayedCard, setHasPlayedCard] = useState(false);

  const handleEndTurn = () => {
    if (!hasPlayedCard) return;
    gameState.setIsPlayerTurn(false);
    setHasPlayedCard(false);
  };

  useEffect(() => {
    if (!gameState.isPlayerTurn && gameState.aiHand.length > 0) {
      const timer = setTimeout(() => {
        handleAITurn(
          gameState.tableCards,
          gameState.aiHand,
          gameState.builds,
          gameState.setTableCards,
          gameState.setAiHand,
          gameState.setBuilds,
          gameState.setIsPlayerTurn,
          gameState.setAiChowedCards
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isPlayerTurn, gameState.tableCards, gameState.aiHand, gameState.builds]);

  useEffect(() => {
    if (gameState.playerHand.length === 0 && gameState.aiHand.length === 0) {
      if (gameState.currentRound === 1) {
        const timer = setTimeout(() => {
          gameState.setCurrentRound(2);
          gameState.dealNewRound();
        }, 1500);
        return () => clearTimeout(timer);
      } else if (gameState.currentRound === 2) {
        // Check who made the last capture and give them the remaining table cards
        if (gameState.tableCards.length > 0) {
          const lastChower = gameState.lastChowedBy;
          console.log("Game ending - Last capture was by:", lastChower);
          console.log("Remaining table cards:", gameState.tableCards.length);
          
          if (lastChower === 'player') {
            gameState.setPlayerChowedCards(prev => [...prev, ...gameState.tableCards]);
            toast.success("Remaining cards go to player (last to capture)");
          } else {
            gameState.setAiChowedCards(prev => [...prev, ...gameState.tableCards]);
            toast.success("Remaining cards go to AI (last to capture)");
          }
          gameState.setTableCards([]);
        }
        
        // Calculate final game summary
        setTimeout(() => {
          gameState.calculateGameSummary();
        }, 100);
      }
    }
  }, [gameState.currentRound, gameState.playerHand.length, gameState.aiHand.length]);

  const handleTableDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const card = gameState.playerHand[cardIndex];
    
    const tableRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - tableRect.left;
    const y = e.clientY - tableRect.top;
    
    const overlappingBuild = gameState.builds.find(build => {
      const buildX = build.position.x;
      const buildY = build.position.y;
      const cardWidth = 48;
      const cardHeight = 64;
      
      return (
        x < buildX + cardWidth &&
        x + cardWidth > buildX &&
        y < buildY + cardHeight &&
        y + cardHeight > buildY
      );
    });

    const overlappingCard = gameState.tableCards.find(existingCard => {
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

    const hasPlayerBuild = gameState.builds.some(build => build.owner === 'player');
    
    if (overlappingBuild) {
      if (card.value === overlappingBuild.value) {
        handleBuildCapture(
          card,
          overlappingBuild,
          gameState.playerHand,
          cardIndex,
          gameState.setPlayerChowedCards,
          gameState.setBuilds,
          gameState.setPlayerHand,
          gameState.setIsPlayerTurn,
          gameState.builds,
          gameState.playerChowedCards  // Added the missing parameter
        );
        setHasPlayedCard(true);
        return;
      }

      if (handleBuildAugment(
        card,
        overlappingBuild,
        gameState.playerHand,
        cardIndex,
        hasPlayerBuild,
        gameState.setBuilds,
        gameState.setPlayerHand,
        gameState.setIsPlayerTurn,
        gameState.builds,
        gameState.setPlayerChowedCards
      )) {
        setHasPlayedCard(true);
        return;
      }
    }

    if (overlappingCard) {
      if (handleNewBuild(
        card,
        overlappingCard,
        gameState.playerHand,
        cardIndex,
        hasPlayerBuild,
        gameState.setBuilds,
        gameState.setTableCards,
        gameState.setPlayerHand,
        gameState.setPlayerChowedCards,
        gameState.setIsPlayerTurn,
        gameState.tableCards,
        gameState.builds
      )) {
        setHasPlayedCard(true);
        gameState.setIsPlayerTurn(false);
        return;
      }
    } else {
      if (gameState.currentRound === 1 && hasPlayerBuild) {
        toast.error("You cannot discard when you have an existing build in round 1!");
        return;
      }

      const newCard: Card = {
        ...card,
        tableX: x,
        tableY: y,
        playedBy: 'player',
        faceUp: true
      };

      gameState.setTableCards([...gameState.tableCards, newCard]);
      const newPlayerHand = [...gameState.playerHand];
      newPlayerHand.splice(cardIndex, 1);
      gameState.setPlayerHand(newPlayerHand);
      setHasPlayedCard(true);
      gameState.setIsPlayerTurn(false);
    }
  };

  return (
    <div className="h-screen bg-casino-green p-4 flex flex-col">
      <GameHeader 
        showLeaveDialog={gameState.showLeaveDialog}
        setShowLeaveDialog={gameState.setShowLeaveDialog}
        currentRound={gameState.currentRound}
      />
      
      <AIHand cards={gameState.aiHand} />

      <div className="flex-grow flex items-center justify-center mb-1">
        <TableArea
          tableCards={gameState.tableCards}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleTableDrop}
          playerName={gameState.playerName}
          playerChowedCards={gameState.playerChowedCards}
          aiChowedCards={gameState.aiChowedCards}
          builds={gameState.builds}
          isPlayerTurn={gameState.isPlayerTurn}
          onEndTurn={handleEndTurn}
          hasPlayedCard={hasPlayedCard}
        />
      </div>

      <PlayerHand 
        playerName={gameState.playerName}
        cards={gameState.playerHand}
        isPlayerTurn={gameState.isPlayerTurn}
        onDragStart={(e, index) => handleDragStart(e, index, gameState.isPlayerTurn)}
      />

      {gameState.gameSummary && (
        <GameSummaryDialog
          open={gameState.showGameSummary}
          onClose={() => gameState.setShowGameSummary(false)}
          summary={gameState.gameSummary}
          playerName={gameState.playerName}
        />
      )}
    </div>
  );
};
