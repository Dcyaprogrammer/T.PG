import type { Card } from './card';

function assertCount(pileSize: number, count: number): void {
  if (count <= 0) {
    throw new Error(`count must be positive (received ${count})`);
  }
  if (count > pileSize) {
    throw new Error(`cannot take ${count} cards from pile of size ${pileSize}`);
  }
}

function isDescendingSameSuit(cards: readonly Card[]): boolean {
  if (cards.length === 0) {
    return true;
  }

  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1];
    const curr = cards[i];
    if (!prev.faceUp || !curr.faceUp) {
      return false;
    }
    if (prev.suit !== curr.suit) {
      return false;
    }
    if (prev.rank !== curr.rank + 1) {
      return false;
    }
  }
  return true;
}

function isCompleteSequence(cards: readonly Card[]): boolean {
  if (cards.length !== 13) {
    return false;
  }
  if (cards[0]?.rank !== 13 || cards[0]?.faceUp === false) {
    return false;
  }
  if (cards[cards.length - 1]?.rank !== 1) {
    return false;
  }
  return isDescendingSameSuit(cards);
}

export class Pile {
  private cards: Card[];

  constructor(initialCards: Iterable<Card> = []) {
    this.cards = Array.isArray(initialCards)
      ? initialCards.slice()
      : Array.from(initialCards);
  }

  get length(): number {
    return this.cards.length;
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  peek(): Card | undefined {
    return this.cards[this.cards.length - 1];
  }

  toArray(): Card[] {
    return this.cards.slice();
  }

  push(card: Card): void {
    this.cards.push(card);
  }

  pushMany(cards: Iterable<Card>): void {
    for (const card of cards) {
      this.cards.push(card);
    }
  }

  pop(): Card | undefined {
    return this.cards.pop();
  }

  popMany(count: number): Card[] {
    assertCount(this.cards.length, count);
    const start = this.cards.length - count;
    return this.cards.splice(start, count);
  }

  takeDescendingRun(count: number): Card[] {
    const run = this.peekRun(count);
    if (!isDescendingSameSuit(run)) {
      throw new Error('requested run is not a face-up descending sequence of the same suit');
    }
    return this.popMany(count);
  }

  canTakeDescendingRun(count: number): boolean {
    if (count <= 0 || count > this.cards.length) {
      return false;
    }
    return isDescendingSameSuit(this.peekRun(count));
  }

  maxMovableRunLength(): number {
    let length = 0;
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const current = this.cards[i];
      if (!current.faceUp) {
        break;
      }
      if (length === 0) {
        length = 1;
        continue;
      }
      const next = this.cards[i + 1]!;
      if (current.suit !== next.suit || current.rank !== next.rank + 1) {
        break;
      }
      length += 1;
    }
    return length;
  }

  collectCompleteSequence(): Card[] | null {
    const runLength = this.maxMovableRunLength();
    if (runLength < 13) {
      return null;
    }
    const sequence = this.peekRun(13);
    if (!isCompleteSequence(sequence)) {
      return null;
    }
    return this.popMany(13);
  }

  peekRun(count: number): Card[] {
    assertCount(this.cards.length, count);
    const start = this.cards.length - count;
    return this.cards.slice(start);
  }
}

export const pileUtils = {
  isDescendingSameSuit,
  isCompleteSequence,
};

