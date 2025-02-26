
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
  const aiBuildValue = hasAIBuild ? builds.find(build => build.owner === 'ai')?.value : null;

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
  if (hasAIBuild && aiBuildValue) {
    for (const aiCard of aiHand) {
      for (const tableCard of tableCards) {
        const sum = aiCard.value + tableCard.value;
        // Only add if sum equals existing build value
        if (sum === aiBuildValue) {
          const aiBuild = builds.find(build => build.owner === 'ai');
          if (aiBuild) {
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

  // Priority 4: Augment opponent's build if possible (when AI has a matching card)
  for (const aiCard of aiHand) {
    for (const build of builds) {
      if (build.owner === 'player') {
        const newSum = build.value + aiCard.value;
        // Can only augment if AI has a matching card for the new value
        // If AI has its own build, can only augment to match that build's value
        if (newSum <= 10 && 
            newSum < build.value * 2 && 
            aiHand.some(card => card.value === newSum) &&
            (!hasAIBuild || newSum === aiBuildValue)) {
          return {
            type: 'augment',
            card: aiCard,
            augmentBuild: build
          };
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

  // If no other moves possible, discard lowest value card that's not the last matching card for a build
  if (aiHand.length > 0) {
    // Sort cards by value (ascending)
    const sortedHand = [...aiHand].sort((a, b) => a.value - b.value);
    
    // Find the first card that's either:
    // 1. Not matching any AI build value, or
    // 2. Has another copy in hand if it matches the build value
    for (const card of sortedHand) {
      const matchesAiBuild = hasAIBuild && card.value === aiBuildValue;
      const hasAnotherCopy = aiHand.filter(c => c.value === card.value).length > 1;
      
      if (!matchesAiBuild || hasAnotherCopy) {
        return { 
          type: 'discard',
          card: card
        };
      }
    }
  }

  return null;
};
