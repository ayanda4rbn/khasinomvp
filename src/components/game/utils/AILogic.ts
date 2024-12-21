import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";
import { findBestMove } from './aiStrategyLogic';
import { handleAIBuild } from './aiBuildLogic';
import { handleAIDiscard } from './aiHelpers';

export const handleAITurn = (
  tableCards: Card[],
  aiHand: Card[],
  builds: BuildType[],
  setTableCards: (cards: Card[]) => void,
  setAiHand: (cards: Card[]) => void,
  setBuilds: (builds: BuildType[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  setAiChowedCards: (cards: Card[]) => void
) => {
  const move = findBestMove(aiHand, tableCards, builds);

  if (!move) {
    toast.error("AI has no valid moves");
    setIsPlayerTurn(true);
    return;
  }

  switch (move.type) {
    case 'capture':
      if (move.captureCards?.length) {
        // Remove captured cards from table
        setTableCards(tableCards.filter(card => 
          !move.captureCards?.some(captureCard => 
            captureCard.value === card.value && 
            captureCard.suit === card.suit
          )
        ));
        // Add captured cards to AI's chowed pile
        setAiChowedCards(prev => [...prev, ...(move.captureCards || [])]);
      }
      if (move.captureBuilds?.length) {
        const capturedBuildCards = move.captureBuilds.flatMap(build => build.cards);
        setBuilds(builds.filter(build => 
          !move.captureBuilds?.some(captureBuild => 
            captureBuild.id === build.id
          )
        ));
        // Add captured build cards to AI's chowed pile
        setAiChowedCards(prev => [...prev, ...capturedBuildCards]);
      }
      toast.success("AI captured cards!");
      break;

    case 'build':
      if (move.buildWith) {
        const buildValue = move.card.value + move.buildWith.value;
        if (aiHand.some(card => card.value === buildValue)) {
          const x = Math.random() * 400 + 50;
          const y = Math.random() * 200 + 50;
          // Ensure smaller card is on top
          const buildCards = move.card.value < move.buildWith.value
            ? [move.card, move.buildWith]
            : [move.buildWith, move.card];
          const newBuild: BuildType = {
            id: Date.now(),
            cards: buildCards,
            value: buildValue,
            position: { x, y },
            owner: 'ai'
          };
          setBuilds([...builds, newBuild]);
          setTableCards(tableCards.filter(card => 
            card.value !== move.buildWith.value || 
            card.suit !== move.buildWith.suit
          ));
          toast.info("AI created a build!");
        } else {
          handleAIDiscard(move.card, tableCards, setTableCards);
        }
      }
      break;

    case 'discard':
      handleAIDiscard(move.card, tableCards, setTableCards);
      toast.info("AI discarded a card");
      break;
  }

  setAiHand(aiHand.filter(card => 
    card.value !== move.card.value || 
    card.suit !== move.card.suit
  ));

  setIsPlayerTurn(true);
};