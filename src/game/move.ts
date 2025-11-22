import type { Card } from './card';

/**
 * Move data structure for undo/redo functionality
 */

export interface MoveStackPayload {
  fromCol: number;
  toCol: number;
  count: number;
  cards: Card[]; // The cards that were moved
  flippedCard?: Card; // The card that was flipped in the source column (if any)
}

export interface DealRowPayload {
  cards: Card[]; // The cards that were dealt (one per column)
}

export interface MoveRecord {
  kind: 'move' | 'deal' | 'undo' | 'redo';
  payload?: MoveStackPayload | DealRowPayload;
}

/**
 * Create a move record for a stack move
 */
export function createMoveStackRecord(
  fromCol: number,
  toCol: number,
  count: number,
  cards: Card[],
  flippedCard?: Card,
): MoveRecord {
  return {
    kind: 'move',
    payload: {
      fromCol,
      toCol,
      count,
      cards,
      flippedCard,
    },
  };
}

/**
 * Create a move record for dealing a row
 */
export function createDealRowRecord(cards: Card[]): MoveRecord {
  return {
    kind: 'deal',
    payload: {
      cards,
    },
  };
}

