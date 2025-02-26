
import { Card, BuildType } from '@/types/game';
import { canCaptureCards } from './aiHelpers';

export const findBestMove = (
  aiHand: Card[], 
  tableCards: Card[], 
  builds: BuildType[]
): { 
  type: 'capture' | 'build' | 'discard' | 'augment',
  card: Card,
  captureCards?: Card[],
  captureBuilds?: BuildType[],
  buildWith?: Card,
  augmentBuild?: BuildType,
  existingBuild?: BuildType
} | null => {
  // Priority 1: Capture valuable cards
  for (const aiCard of aiHand) {
    const { cards: capturableCards, builds: capturableBuilds } = canCaptureCards(aiCard, tableCards, builds);
    const hasValuableCapture = capturableCards.some(card => 
      (card.value === 1) || 
      (card.value === 2 && card.suit === 'spades') || 
      (card.value === 10 && card.suit === 'diamonds')
    );
    
    if (hasValuableCapture) {
      return { 
        type: 'capture',
        card: aiCard,
        captureCards: capturableCards,
        captureBuilds: capturableBuilds
      };
    }
  }

  // Priority 2: Capture spades
  for (const aiCard of aiHand) {
    const { cards: capturableCards, builds: capturableBuilds } = canCaptureCards(aiCard, tableCards, builds);
    const hasSpadesCapture = capturableCards.some(card => card.suit === 'spades');
    
    if (hasSpadesCapture) {
      return { 
        type: 'capture',
        card: aiCard,
        captureCards: capturableCards,
        captureBuilds: capturableBuilds
      };
    }
  }

  // Priority 3: Build if possible (only if no existing AI build)
  const hasAIBuild = builds.some(build => build.owner === 'ai');
  if (!hasAIBuild) {
    for (const aiCard of aiHand) {
      for (const tableCard of tableCards) {
        const sum = aiCard.value + tableCard.value;
        // Check if there's already a build with this value from the opponent
        const existingOpponentBuild = builds.some(build => build.value === sum && build.owner === 'player');
        // Allow building if no opponent build exists with this value
        if (sum <= 10 && !existingOpponentBuild && aiHand.some(card => card.value === sum)) {
          return {
            type: 'build',
            card: aiCard,
            buildWith: tableCard
          };
        }
      }
    }
  }

  // Priority 3.5: Try to add to AI's existing build (compound build)
  if (hasAIBuild) {
    const aiBuild = builds.find(build => build.owner === 'ai');
    if (aiBuild) {
      for (const aiCard of aiHand) {
        for (const tableCard of tableCards) {
          const sum = aiCard.value + tableCard.value;
          // Only add if sum equals build value and not making it a double
          if (sum === aiBuild.value && sum < aiBuild.value * 2) {
            return {
              type: 'build',
              card: aiCard,
              buildWith: tableCard,
              existingBuild: aiBuild
            };
          }
        }
      }
    }
  }

  // Priority 4: Augment opponent's build if possible (only if no existing AI build)
  if (!hasAIBuild) {
    for (const aiCard of aiHand) {
      for (const build of builds) {
        if (build.owner === 'player') {
          const newSum = build.value + aiCard.value;
          // Check if it would make it a compound build (2x or more of original)
          if (newSum <= 10 && newSum < build.value * 2 && aiHand.some(card => card.value === newSum)) {
            return {
              type: 'augment',
              card: aiCard,
              augmentBuild: build
            };
          }
        }
      }
    }
  }

  // Priority 5: Regular captures
  for (const aiCard of aiHand) {
    const { cards: capturableCards, builds: capturableBuilds } = canCaptureCards(aiCard, tableCards, builds);
    if (capturableCards.length > 0 || capturableBuilds.length > 0) {
      return { 
        type: 'capture',
        card: aiCard,
        captureCards: capturableCards,
        captureBuilds: capturableBuilds
      };
    }
  }

  // If no other moves possible, discard lowest value card
  if (aiHand.length > 0) {
    const lowestCard = aiHand.reduce((prev, curr) => 
      prev.value <= curr.value ? prev : curr
    );
    return { 
      type: 'discard',
      card: lowestCard
    };
  }

  return null;
};
