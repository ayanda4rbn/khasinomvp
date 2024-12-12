export interface Card {
  value: number;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  faceUp?: boolean;
  selected?: boolean;
  tableX?: number;
  tableY?: number;
}