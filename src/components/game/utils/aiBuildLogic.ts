import { Card, BuildType } from '@/types/game';

export const handleAIBuild = (
  card: Card,
  tableCard: Card,
  aiHand: Card[],
  tableCards: Card[],
  builds: BuildType[],
  setTableCards: (cards: Card[]) => void,
  setBuilds: (builds: BuildType[]) => void
): boolean => {
  const buildValue = card.value + tableCard.value;
  
  if (buildValue <= 10 && aiHand.some(c => c.value === buildValue)) {
    const buildCards = card.value < tableCard.value 
      ? [card, tableCard] 
      : [tableCard, card];
    
    const newBuild: BuildType = {
      id: Date.now(),
      cards: buildCards,
      value: buildValue,
      position: { x: tableCard.tableX || 0, y: tableCard.tableY || 0 },
      owner: 'ai'
    };
    
    setBuilds([...builds, newBuild]);
    setTableCards(tableCards.filter(c => c !== tableCard));
    return true;
  }
  return false;
};