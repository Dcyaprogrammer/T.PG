import type { Card, Rank } from './card';
import { Suit } from './card';
import type { GameState } from './gameState';
import type { Pile } from './pile';

export interface BoardTheme {
  background: string;
  backgroundAlt: string;
  pileSeparator: string;
  cardFaceUpBg: string;
  cardFaceDownBg: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  red: string;
  green: string;
  yellow: string;
  purple: string;
  cyan: string;
}

export const boardTheme: BoardTheme = {
  background: '#282c34',
  backgroundAlt: '#30343c',
  pileSeparator: '#3e4451',
  cardFaceUpBg: '#3a3f4b',
  cardFaceDownBg: '#21252b',
  cardBorder: '#4b5263',
  text: '#abb2bf',
  textMuted: '#6d717a',
  accent: '#61afef',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  purple: '#c778dd',
  cyan: '#56b6c2',
};

export interface BoardCard {
  id: string;
  label: string;
  faceUp: boolean;
  fg: string;
  bg: string;
  border: string;
  suit: Suit;
}

export interface BoardColumn {
  index: number;
  cards: BoardCard[];
}

export interface BoardSnapshot {
  theme: BoardTheme;
  columns: BoardColumn[];
  stock: {
    count: number;
    canDeal: boolean;
  };
  completed: number;
  moves: number;
}

export function createBoardSnapshot(state: GameState): BoardSnapshot {
  const columns = state.tableau.map((pile, index) => buildColumn(pile, index));
  return {
    theme: boardTheme,
    columns,
    stock: {
      count: state.stock.length,
      canDeal: state.canDealRow(),
    },
    completed: state.completed.length,
    moves: state.moves.length,
  };
}

function buildColumn(pile: Pile, index: number): BoardColumn {
  const cards = pile
    .toArray()
    .map((card) => toBoardCard(card));
  return { index, cards };
}

function toBoardCard(card: Card): BoardCard {
  if (!card.faceUp) {
    return {
      id: card.id,
      label: '###',
      faceUp: false,
      fg: boardTheme.textMuted,
      bg: boardTheme.cardFaceDownBg,
      border: boardTheme.cardBorder,
      suit: card.suit,
    };
  }

  return {
    id: card.id,
    label: formatRank(card.rank),
    faceUp: true,
    fg: suitColor(card.suit),
    bg: boardTheme.cardFaceUpBg,
    border: boardTheme.cardBorder,
    suit: card.suit,
  };
}

function suitColor(suit: Suit): string {
  switch (suit) {
    case Suit.Heart:
    case Suit.Diamond:
      return boardTheme.red;
    case Suit.Spade:
      return boardTheme.text;
    case Suit.Club:
      return boardTheme.green;
    default:
      return boardTheme.text;
  }
}

function formatRank(rank: Rank): string {
  switch (rank) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return rank.toString();
  }
}

