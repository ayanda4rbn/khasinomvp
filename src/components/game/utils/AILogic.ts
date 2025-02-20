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
  setAiChowedCards: React.Dispatch<React.SetStateAction<Card[]>>
) => {
  const move = findBestMove(aiHand, tableCards, builds);

  if (!move) {
    toast.error("AI has no valid moves");
    setIsPlayerTurn(true);
    return;
  }

  // Check if AI has a build on the table
  const hasAIBuild = builds.some(build => build.owner === 'ai');

  switch (move.type) {
    case 'capture':
      if (move.captureCards?.length) {
        setTableCards(tableCards.filter(card => 
          !move.captureCards?.some(captureCard => 
            captureCard.value === card.value && 
            captureCard.suit === card.suit
          )
        ));
        const sortedCaptureCards = [...(move.captureCards || [])].sort((a, b) => a.value - b.value);
        setAiChowedCards(prev => [...prev, ...sortedCaptureCards, move.card]);
      }
      if (move.captureBuilds?.length) {
        const capturedBuildCards = move.captureBuilds.flatMap(build => build.cards);
        setBuilds(builds.filter(build => 
          !move.captureBuilds?.some(captureBuild => 
            captureBuild.id === build.id
          )
        ));
        setAiChowedCards(prev => [...prev, ...capturedBuildCards, move.card]);
        toast.success("AI captured a build!");
      }
      break;

    case 'build':
      if (move.buildWith && !hasAIBuild) {
        const buildValue = move.card.value + move.buildWith.value;
        if (aiHand.some(card => card.value === buildValue)) {
          const x = Math.random() * 400 + 50;
          const y = Math.random() * 200 + 50;
          
          const buildCards = [move.buildWith, move.card].sort((a, b) => b.value - a.value);
          
          // Check for existing build with same value
          const existingBuild = builds.find(b => b.value === buildValue && b.owner === 'ai');
          if (existingBuild) {
            const updatedBuild = {
              ...existingBuild,
              cards: [...existingBuild.cards, ...buildCards].sort((a, b) => b.value - a.value)
            };
            setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
          } else {
            const newBuild: BuildType = {
              id: Date.now(),
              cards: buildCards,
              value: buildValue,
              position: { x, y },
              owner: 'ai'
            };
            setBuilds([...builds, newBuild]);
          }
          
          setTableCards(tableCards.filter(card => 
            card.value !== move.buildWith.value || 
            card.suit !== move.buildWith.suit
          ));
          toast.info("AI created a build!");
        }
      }
      break;

    case 'augment':
      if (move.augmentBuild && !hasAIBuild) {
        // Can't augment AI's own build
        if (move.augmentBuild.owner === 'ai') {
          setIsPlayerTurn(true);
          return;
        }

        const newBuildValue = move.augmentBuild.value + move.card.value;
        if (newBuildValue <= 10 && newBuildValue < move.augmentBuild.value * 2 && aiHand.some(card => card.value === newBuildValue)) {
          const allCards = [...move.augmentBuild.cards, move.card].sort((a, b) => b.value - a.value);
          const updatedBuild: BuildType = {
            ...move.augmentBuild,
            cards: allCards,
            value: newBuildValue,
            owner: 'ai' // Transfer ownership to AI
          };
          setBuilds(builds.map(b => b.id === move.augmentBuild?.id ? updatedBuild : b));
          toast.info("AI augmented a build!");
        }
      }
      break;

    case 'discard':
      if (hasAIBuild) {
        toast.error("AI cannot discard with an existing build!");
        setIsPlayerTurn(true);
        return;
      }
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
