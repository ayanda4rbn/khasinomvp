
export interface Card {
  value: number;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  faceUp?: boolean;
  selected?: boolean;
  tableX?: number;
  tableY?: number;
  playedBy?: 'player' | 'ai';
}

export interface BuildType {
  id: number;
  cards: Card[];
  value: number;
  position: { x: number; y: number };
  owner: 'player' | 'ai' | null;
}

export interface GameScore {
  cardsCount: number;
  spadesCount: number;
  bigCasino: boolean;
  littleCasino: boolean;
  total: number;
}

export interface GameSummary {
  playerScore: GameScore;
  aiScore: GameScore;
  winner: 'player' | 'ai' | 'tie';
}
