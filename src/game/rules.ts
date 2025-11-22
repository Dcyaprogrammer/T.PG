import type { Card } from './card';
import { Pile } from './pile';

/**
 * Spider Solitaire game rules validation and utilities
 */

/**
 * Check if a card can be placed on top of another card
 * Rules:
 * - Can place on empty pile (any card)
 * - Can place if: target card rank is one higher than source card rank, same suit
 */
export function canPlaceOn(card: Card, targetCard: Card | null): boolean {
  // Can always place on empty pile
  if (!targetCard) {
    return true;
  }

  // Target card must be face up
  if (!targetCard.faceUp) {
    return false;
  }

  // Source card rank must be exactly one less than target card rank
  if (card.rank !== targetCard.rank - 1) {
    return false;
  }

  // Must be same suit
  if (card.suit !== targetCard.suit) {
    return false;
  }

  return true;
}

/**
 * Check if a stack of cards can be moved from one pile to another
 */
export function canMoveStack(
  fromPile: Pile,
  count: number,
  toPile: Pile,
): boolean {
  // Basic validation
  if (count <= 0 || count > fromPile.length) {
    return false;
  }

  // Check if the cards to move form a valid descending run
  if (!fromPile.canTakeDescendingRun(count)) {
    return false;
  }

  // Get the bottom card of the stack to move (the one that will be placed)
  const run = fromPile.peekRun(count);
  const bottomCard = run[0]!; // First card in the run is the bottom card

  // Get the top card of the target pile
  const targetTop = toPile.peek();

  // Check if the bottom card can be placed on the target
  return canPlaceOn(bottomCard, targetTop || null);
}

/**
 * Check if a card should be flipped after a move
 * (i.e., if it's the new top card and it's face down)
 */
export function shouldFlipTopCard(pile: Pile): boolean {
  const top = pile.peek();
  return top !== undefined && !top.faceUp;
}

/**
 * Create a flipped version of a card
 */
export function flipCard(card: Card): Card {
  return { ...card, faceUp: true };
}

