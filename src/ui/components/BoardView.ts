import { BoxRenderable, TextRenderable, type CliRenderer } from '@opentui/core';
import cliBoxes from 'cli-boxes';
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
        gap: 0, // Cards will stack directly
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
  const cardLines = card.faceUp ? createFaceUpCard(card) : createFaceDownCard();
  return new TextRenderable(renderer, {
    id: `card-${card.id}`,
    content: cardLines,
    fg: card.faceUp ? card.fg : boardTheme.yellow,
    bg: card.faceUp ? card.bg : boardTheme.cardFaceDownBg,
  });
}

function createFaceUpCard(card: BoardCard): string {
  const suitSymbol = suitToSymbol(card.suit);
  const rankLabel = card.label.length === 1 ? ` ${card.label}` : card.label;
  const rankLabelRev = card.label.length === 1 ? `${card.label} ` : card.label;
  
  // Use cli-boxes for consistent, beautiful borders
  const box = cliBoxes.round; // Rounded corners for modern look
  const width = 7; // Inner width (excluding borders)
  const horizontal = box.top.repeat(width);
  
  // Card dimensions: 9 chars wide (7 + 2 borders), 7 lines tall
  const lines: string[] = [];
  
  // Top border
  lines.push(`${box.topLeft}${horizontal}${box.topRight}`);
  
  // Top-left corner with rank and suit
  const topContent = `${rankLabel}${suitSymbol}`.padEnd(width);
  lines.push(`${box.left}${topContent}${box.right}`);
  
  // Middle lines
  lines.push(`${box.left}${' '.repeat(width)}${box.right}`);
  // Center symbol - properly centered
  const centerPadding = Math.floor((width - 1) / 2);
  const centerContent = ' '.repeat(centerPadding) + suitSymbol + ' '.repeat(width - centerPadding - 1);
  lines.push(`${box.left}${centerContent}${box.right}`);
  lines.push(`${box.left}${' '.repeat(width)}${box.right}`);
  
  // Bottom-right corner with rank and suit (upside down)
  const bottomContent = `${suitSymbol}${rankLabelRev}`.padStart(width);
  lines.push(`${box.left}${bottomContent}${box.right}`);
  
  // Bottom border
  lines.push(`${box.bottomLeft}${horizontal}${box.bottomRight}`);
  
  return lines.join('\n');
}

function createFaceDownCard(): string {
  // Face-down card with checkerboard pattern (yellow and dark pattern)
  const box = cliBoxes.bold; // Bold borders for face-down cards to make them stand out
  const width = 7; // Inner width
  const horizontal = box.top.repeat(width);
  
  const lines: string[] = [];
  
  // Top border
  lines.push(`${box.topLeft}${horizontal}${box.topRight}`);
  
  // Checkerboard pattern - alternating blocks
  const patterns = ['█', '░'];
  for (let i = 0; i < 5; i++) {
    let line = box.left;
    for (let j = 0; j < width; j++) {
      const patternIndex = (i + j) % 2;
      line += patterns[patternIndex];
    }
    line += box.right;
    lines.push(line);
  }
  
  // Bottom border
  lines.push(`${box.bottomLeft}${horizontal}${box.bottomRight}`);
  
  return lines.join('\n');
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

