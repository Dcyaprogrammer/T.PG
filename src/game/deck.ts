import { Card, Rank, Suit, createCard } from './card';

export type Rng = () => number;

export interface DeckOptions {
  numSuits?: 1 | 2 | 4;
  numDecks?: number;
  rng?: Rng;
}

export function createDeck(options: DeckOptions = {}): Card[] {
    const numSuits = options.numSuits ?? 1;
    const numDecks = options.numDecks ?? 2;
  
    const suitOrder: Suit[] = [Suit.Spade, Suit.Heart, Suit.Diamond, Suit.Club];
    const suits = suitOrder.slice(0, numSuits);
  
    const deck: Card[] = [];
    for (let d = 0; d < numDecks; d++) {
      for (const s of suits) {
        for (let r = 1 as Rank; r <= 13; r++) {
          deck.push(createCard(s, r as Rank, false));
        }
      }
      // if numSuits < 4，replicate to 52/deck
      if (numSuits < 4) {
        const perSuit = 13;
        const need = 52 - suits.length * perSuit;
        // repeat first suit
        for (let i = 0; i < need; i++) {
          const rank = ((i % 13) + 1) as Rank;
          deck.push(createCard(suits[0]!, rank, false));
        }
      }
    }
    return deck;
  }

/** Fisher–Yates */
export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }