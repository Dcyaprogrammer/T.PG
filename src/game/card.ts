// follow spider card rules
export const CARD_WIDTH = 10;
export const CARD_HEIGHT = 7;
// A - K
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export enum Suit {
    Spade = 'S',
    Heart = 'H',
    Diamond = 'D',
    Club = 'C',
  }

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  faceUp: boolean;
}

export function createCard(suit: Suit, rank: Rank, faceUp = false, id?: string): Card {
    return {
      id: id ?? `${suit}-${rank}-${crypto.randomUUID()}`,
      suit,
      rank,
      faceUp,
    };
  }
