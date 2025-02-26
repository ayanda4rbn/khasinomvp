// This file now serves as the main entry point for deck management functionality
export { STANDARD_DECK, getStandardDeck } from './deckCore';
export { validateDeck, isCardInArray, logCardState } from './deckValidation';
export { shuffleDeck, dealCards } from './deckOperations';