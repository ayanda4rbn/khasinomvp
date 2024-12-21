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

  switch (move.type) {
    case 'capture':
      if (move.captureCards?.length) {
        setTableCards(tableCards.filter(card => 
          !move.captureCards?.some(captureCard => 
            captureCard.value === card.value && 
            captureCard.suit === card.suit
          )
        ));
        // Sort captured cards by value and add capturing card last (on top)
        const sortedCaptureCards = [...(move.captureCards || [])].sort((a, b) => a.value - b.value);
        setAiChowedCards(prev => [...prev, ...sortedCaptureCards]);
      }
      if (move.captureBuilds?.length) {
        const capturedBuildCards = move.captureBuilds.flatMap(build => build.cards);
        setBuilds(builds.filter(build => 
          !move.captureBuilds?.some(captureBuild => 
            captureBuild.id === build.id
          )
        ));
        // Sort build cards by value and add capturing card last (on top)
        const sortedBuildCards = [...capturedBuildCards].sort((a, b) => a.value - b.value);
        setAiChowedCards(prev => [...prev, ...sortedBuildCards, move.card]);
      }
      toast.success("AI captured cards!");
      break;

    case 'build':
      if (move.buildWith) {
        const buildValue = move.card.value + move.buildWith.value;
        if (aiHand.some(card => card.value === buildValue)) {
          // Don't create a new build if one already exists
          if (builds.length > 0 && !builds.some(b => b.cards.includes(move.buildWith!))) {
            handleAIDiscard(move.card, tableCards, setTableCards);
            toast.info("AI couldn't create multiple builds, discarded instead");
            break;
          }

          const x = Math.random() * 400 + 50;
          const y = Math.random() * 200 + 50;
          
          // Sort cards by value to ensure smaller card is on top
          const buildCards = [move.buildWith, move.card].sort((a, b) => b.value - a.value);
            
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
      // Don't allow discarding if there's a build in round 1
      if (builds.length > 0) {
        // Try to find a capture or build move instead
        const alternativeMove = findBestMove(
          aiHand.filter(card => card !== move.card),
          tableCards,
          builds
        );
        if (alternativeMove && alternativeMove.type !== 'discard') {
          handleAITurn(
            tableCards,
            aiHand.filter(card => card !== move.card),
            builds,
            setTableCards,
            setAiHand,
            setBuilds,
            setIsPlayerTurn,
            setAiChowedCards
          );
          return;
        }
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