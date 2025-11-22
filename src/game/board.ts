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
  highlighted?: boolean; // Whether this card is highlighted for selection
  selected?: boolean; // Whether this card is part of the selected stack
}

export interface BoardColumn {
  index: number;
  cards: BoardCard[];
  focused?: boolean; // Whether this column has cursor focus
  selected?: boolean; // Whether this column is selected as source
}

export interface SelectionState {
  sourceColumn: number | null;
  selectedCount: number | null;
  targetColumn: number | null;
  cursorColumn: number; // Current cursor position
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
  selection?: SelectionState;
}

export function createBoardSnapshot(
  state: GameState,
  selection?: SelectionState,
): BoardSnapshot {
  const columns = state.tableau.map((pile, index) =>
    buildColumn(pile, index, selection),
  );
  return {
    theme: boardTheme,
    columns,
    stock: {
      count: state.stock.length,
      canDeal: state.canDealRow(),
    },
    completed: state.completed.length,
    moves: state.moves.length,
    selection,
  };
}

function buildColumn(pile: Pile, index: number, selection?: SelectionState): BoardColumn {
  const cards = pile.toArray();
  const isSourceColumn = selection?.sourceColumn === index;
  const isFocused = selection?.cursorColumn === index;
  const selectedCount = isSourceColumn ? selection?.selectedCount ?? null : null;

  const boardCards = cards.map((card, cardIndex) => {
    const isSelected = isSourceColumn && selectedCount !== null
      ? cardIndex >= cards.length - selectedCount
      : false;
    const isHighlighted = isFocused && cardIndex === cards.length - 1;

    return toBoardCard(card, isSelected, isHighlighted);
  });

  return {
    index,
    cards: boardCards,
    focused: isFocused,
    selected: isSourceColumn,
  };
}

function toBoardCard(
  card: Card,
  selected = false,
  highlighted = false,
): BoardCard {
  const baseCard: BoardCard = {
    id: card.id,
    label: card.faceUp ? formatRank(card.rank) : '###',
    faceUp: card.faceUp,
    fg: card.faceUp ? suitColor(card.suit) : boardTheme.textMuted,
    bg: card.faceUp ? boardTheme.cardFaceUpBg : boardTheme.cardFaceDownBg,
    border: selected ? boardTheme.accent : highlighted ? boardTheme.yellow : boardTheme.cardBorder,
    suit: card.suit,
    selected,
    highlighted,
  };

  // Apply highlight colors
  if (selected) {
    // Use a lighter version of the accent color for selected cards
    baseCard.bg = boardTheme.backgroundAlt; // Lighter background
    baseCard.border = boardTheme.accent;
  } else if (highlighted) {
    baseCard.border = boardTheme.yellow;
  }

  return baseCard;
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

