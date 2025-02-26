
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
  console.log("[AI-TURN] Starting AI turn with:", {
    handSize: aiHand.length,
    tableCards: tableCards.length,
    builds: builds.length
  });

  const move = findBestMove(aiHand, tableCards, builds);

  if (!move) {
    toast.error("AI has no valid moves");
    setIsPlayerTurn(true);
    return;
  }

  console.log("[AI-TURN] Selected move:", { type: move.type });

  switch (move.type) {
    case 'capture':
      if (move.captureCards?.length) {
        console.log("[AI-CAPTURE] Capturing cards:", move.captureCards.length);
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
        console.log("[AI-CAPTURE] Capturing builds:", move.captureBuilds.length);
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
      if (move.buildWith) {
        console.log("[AI-BUILD] Creating new build");
        const buildValue = move.card.value + move.buildWith.value;
        if (aiHand.some(card => card.value === buildValue)) {
          const x = Math.random() * 400 + 50;
          const y = Math.random() * 200 + 50;
          
          // Sort only this pair of cards
          const newPair = [
            { ...move.buildWith, faceUp: true },
            { ...move.card, faceUp: true }
          ].sort((a, b) => b.value - a.value);
          
          // Check for existing build with same value owned by AI
          const existingBuild = builds.find(b => b.value === buildValue && b.owner === 'ai');
          if (existingBuild) {
            console.log("[AI-BUILD] Adding to existing build");
            const updatedBuild = {
              ...existingBuild,
              cards: [...existingBuild.cards, ...newPair]
            };
            setBuilds(builds.map(b => b.id === existingBuild.id ? updatedBuild : b));
          } else {
            console.log("[AI-BUILD] Creating new build");
            const newBuild: BuildType = {
              id: Date.now(),
              cards: newPair,
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
      if (move.augmentBuild) {
        console.log("[AI-BUILD] Augmenting existing build");
        // Can't augment AI's own build
        if (move.augmentBuild.owner === 'ai') {
          setIsPlayerTurn(true);
          return;
        }

        const newBuildValue = move.augmentBuild.value + move.card.value;
        if (newBuildValue <= 10 && newBuildValue < move.augmentBuild.value * 2 && aiHand.some(card => card.value === newBuildValue)) {
          // Check for existing build of same value owned by AI
          const existingAiBuild = builds.find(b => 
            b.id !== move.augmentBuild?.id && 
            b.value === newBuildValue && 
            b.owner === 'ai'
          );

          if (existingAiBuild) {
            // Add to existing build of same value
            const newPair = [...move.augmentBuild.cards, { ...move.card, faceUp: true }];
            const updatedBuild = {
              ...existingAiBuild,
              cards: [...existingAiBuild.cards, ...newPair]
            };
            setBuilds(builds.map(b => 
              b.id === existingAiBuild.id ? updatedBuild :
              b.id === move.augmentBuild?.id ? undefined : b
            ).filter(Boolean) as BuildType[]);
          } else {
            // Create new build from augmented cards
            const newPair = [...move.augmentBuild.cards, { ...move.card, faceUp: true }];
            const updatedBuild = {
              ...move.augmentBuild,
              cards: newPair,
              value: newBuildValue,
              owner: 'ai'
            };
            setBuilds(builds.map(b => b.id === move.augmentBuild?.id ? updatedBuild : b));
          }
          toast.info("AI augmented a build!");
        }
      }
      break;

    case 'discard':
      if (aiHand.some(c => c.value === move.card.value && c !== move.card)) {
        handleAIDiscard(move.card, tableCards, setTableCards);
        toast.info("AI discarded a card");
      } else {
        setIsPlayerTurn(true);
        return;
      }
      break;
  }

  setAiHand(aiHand.filter(card => 
    card.value !== move.card.value || 
    card.suit !== move.card.suit
  ));

  console.log("[AI-TURN] Turn completed. New hand size:", aiHand.length - 1);
  setIsPlayerTurn(true);
};
