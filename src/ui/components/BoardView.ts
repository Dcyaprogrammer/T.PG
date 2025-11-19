import { BoxRenderable, TextRenderable, type CliRenderer } from '@opentui/core';
import type { GameState } from '../../game/gameState';
import { boardTheme, createBoardSnapshot, type BoardCard } from '../../game/board';
import { Suit } from '../../game/card';

interface BoardView {
  container: BoxRenderable;
  refresh: () => void;
}

export function createBoardView(renderer: CliRenderer, game: GameState): BoardView {
  const container = new BoxRenderable(renderer, {
    id: 'board-view',
    flexDirection: 'column',
    backgroundColor: boardTheme.background,
    border: true,
    borderColor: boardTheme.pileSeparator,
    padding: 1,
    gap: 1,
  });

  const columnsRow = new BoxRenderable(renderer, {
    id: 'board-columns',
    flexDirection: 'row',
    gap: 2,
    backgroundColor: boardTheme.background,
  });

  const statusRow = new BoxRenderable(renderer, {
    id: 'board-status',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
  });

  container.add(columnsRow);
  container.add(statusRow);

  function refresh(): void {
    const snapshot = createBoardSnapshot(game);

    clearChildren(columnsRow);
    clearChildren(statusRow);

    for (const column of snapshot.columns) {
      const colBox = new BoxRenderable(renderer, {
        id: `column-${column.index}`,
        flexDirection: 'column',
        gap: 0,
        backgroundColor: boardTheme.backgroundAlt,
        border: true,
        borderColor: boardTheme.cardBorder,
        padding: 0,
        paddingLeft: 1,
        paddingRight: 1,
      });

      const title = new TextRenderable(renderer, {
        id: `column-${column.index}-title`,
        content: `Col ${column.index + 1}`,
        fg: boardTheme.textMuted,
      });
      colBox.add(title);

      if (column.cards.length === 0) {
        colBox.add(
          new TextRenderable(renderer, {
            id: `column-${column.index}-empty`,
            content: '(empty)',
            fg: boardTheme.textMuted,
          }),
        );
      } else {
        for (const card of column.cards) {
          colBox.add(createCardRenderable(renderer, card));
        }
      }

      columnsRow.add(colBox);
    }

    const stockText = new TextRenderable(renderer, {
      id: 'stock-info',
      content: `Stock: ${snapshot.stock.count}`,
      fg: snapshot.stock.canDeal ? boardTheme.accent : boardTheme.textMuted,
    });

    const completedText = new TextRenderable(renderer, {
      id: 'completed-info',
      content: `Completed: ${snapshot.completed}`,
      fg: boardTheme.green,
    });

    const movesText = new TextRenderable(renderer, {
      id: 'moves-info',
      content: `Moves: ${snapshot.moves}`,
      fg: boardTheme.yellow,
    });

    statusRow.add(stockText);
    statusRow.add(completedText);
    statusRow.add(movesText);
  }

  refresh();

  return { container, refresh };
}

function createCardRenderable(renderer: CliRenderer, card: BoardCard): TextRenderable {
  const content = card.faceUp ? formatFaceUpCard(card) : '[###]';
  return new TextRenderable(renderer, {
    id: `card-${card.id}`,
    content,
    fg: card.faceUp ? card.fg : boardTheme.textMuted,
    bg: card.faceUp ? card.bg : boardTheme.cardFaceDownBg,
  });
}

function formatFaceUpCard(card: BoardCard): string {
  const suitSymbol = suitToSymbol(card.suit);
  return `[${card.label}${suitSymbol}]`;
}

function suitToSymbol(suit: BoardCard['suit']): string {
  switch (suit) {
    case Suit.Heart:
      return '♥';
    case Suit.Diamond:
      return '♦';
    case Suit.Club:
      return '♣';
    case Suit.Spade:
    default:
      return '♠';
  }
}

function clearChildren(box: BoxRenderable): void {
  for (const child of box.getChildren()) {
    box.remove(child.id);
  }
}

