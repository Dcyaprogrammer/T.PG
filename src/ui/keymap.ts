import type { GameState } from '../game/gameState';
import type { SelectionState } from '../game/board';

export type GameMode = 'normal' | 'select-source' | 'select-count' | 'select-target';

export interface GameInteractionState {
  mode: GameMode;
  selection: SelectionState;
}

export function createGameInteractionState(columns: number): GameInteractionState {
  return {
    mode: 'normal',
    selection: {
      sourceColumn: null,
      selectedCount: null,
      targetColumn: null,
      cursorColumn: 0,
    },
  };
}

export interface KeyMapHandlers {
  onMove: (fromCol: number, count: number, toCol: number) => boolean;
  onDeal: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRefresh: () => void;
}

/**
 * Handle keyboard input for game interaction
 */
export function handleGameKey(
  key: { name: string; sequence: string; ctrl?: boolean },
  state: GameInteractionState,
  game: GameState,
  handlers: KeyMapHandlers,
): GameInteractionState {
  const { mode, selection } = state;
  const newState = { ...state, selection: { ...selection } };

  // Handle mode-specific keys
  if (mode === 'normal') {
    return handleNormalMode(key, newState, game, handlers);
  } else if (mode === 'select-source') {
    return handleSelectSourceMode(key, newState, game, handlers);
  } else if (mode === 'select-count') {
    return handleSelectCountMode(key, newState, game, handlers);
  } else if (mode === 'select-target') {
    return handleSelectTargetMode(key, newState, game, handlers);
  }

  return newState;
}

function handleNormalMode(
  key: { name: string; sequence: string },
  state: GameInteractionState,
  game: GameState,
  handlers: KeyMapHandlers,
): GameInteractionState {
  const { selection } = state;

  // Movement keys
  if (key.name === 'left' || key.sequence === 'h') {
    selection.cursorColumn = Math.max(0, selection.cursorColumn - 1);
    handlers.onRefresh();
    return { ...state, selection };
  }
  if (key.name === 'right' || key.sequence === 'l') {
    selection.cursorColumn = Math.min(game.columns - 1, selection.cursorColumn + 1);
    handlers.onRefresh();
    return { ...state, selection };
  }

  // Select source column
  if (key.name === 'space' || key.name === 'return') {
    const pile = game.tableau[selection.cursorColumn];
    if (pile && pile.length > 0 && pile.peek()?.faceUp) {
      // Enter select-count mode
      return {
        ...state,
        mode: 'select-count',
        selection: {
          ...selection,
          sourceColumn: selection.cursorColumn,
          selectedCount: 1, // Default to 1 card
        },
      };
    }
  }

  return state;
}

function handleSelectSourceMode(
  key: { name: string; sequence: string },
  state: GameInteractionState,
  game: GameState,
  handlers: KeyMapHandlers,
): GameInteractionState {
  // This mode is not currently used, but kept for future expansion
  return handleNormalMode(key, state, game, handlers);
}

function handleSelectCountMode(
  key: { name: string; sequence: string },
  state: GameInteractionState,
  game: GameState,
  handlers: KeyMapHandlers,
): GameInteractionState {
  const { selection } = state;

  // Number keys to select count
  const num = parseInt(key.sequence, 10);
  if (!isNaN(num) && num >= 1 && num <= 9) {
    const pile = game.tableau[selection.sourceColumn!];
    const maxMovable = pile.maxMovableRunLength();
    const newCount = Math.min(num, maxMovable);
    selection.selectedCount = newCount;
    handlers.onRefresh();
    return { ...state, selection };
  }

  // Arrow keys to adjust count
  if (key.name === 'up' || key.sequence === 'k') {
    const pile = game.tableau[selection.sourceColumn!];
    const maxMovable = pile.maxMovableRunLength();
    selection.selectedCount = Math.min(
      (selection.selectedCount ?? 1) + 1,
      maxMovable,
    );
    handlers.onRefresh();
    return { ...state, selection };
  }
  if (key.name === 'down' || key.sequence === 'j') {
    selection.selectedCount = Math.max(1, (selection.selectedCount ?? 1) - 1);
    handlers.onRefresh();
    return { ...state, selection };
  }

  // Confirm and move to select-target mode
  if (key.name === 'space' || key.name === 'return') {
    return {
      ...state,
      mode: 'select-target',
      selection: {
        ...selection,
        cursorColumn: selection.sourceColumn!,
      },
    };
  }

  // Cancel
  if (key.name === 'escape') {
    return {
      ...state,
      mode: 'normal',
      selection: {
        ...selection,
        sourceColumn: null,
        selectedCount: null,
      },
    };
  }

  return state;
}

function handleSelectTargetMode(
  key: { name: string; sequence: string },
  state: GameInteractionState,
  game: GameState,
  handlers: KeyMapHandlers,
): GameInteractionState {
  const { selection } = state;

  // Movement keys
  if (key.name === 'left' || key.sequence === 'h') {
    selection.cursorColumn = Math.max(0, selection.cursorColumn - 1);
    handlers.onRefresh();
    return { ...state, selection };
  }
  if (key.name === 'right' || key.sequence === 'l') {
    selection.cursorColumn = Math.min(game.columns - 1, selection.cursorColumn + 1);
    handlers.onRefresh();
    return { ...state, selection };
  }

  // Confirm move
  if (key.name === 'space' || key.name === 'return') {
    const success = handlers.onMove(
      selection.sourceColumn!,
      selection.selectedCount!,
      selection.cursorColumn,
    );
    if (success) {
      handlers.onRefresh();
      // Reset to normal mode
      return {
        ...state,
        mode: 'normal',
        selection: {
          sourceColumn: null,
          selectedCount: null,
          targetColumn: null,
          cursorColumn: selection.cursorColumn,
        },
      };
    }
  }

  // Cancel
  if (key.name === 'escape') {
    return {
      ...state,
      mode: 'normal',
      selection: {
        ...selection,
        sourceColumn: null,
        selectedCount: null,
        targetColumn: null,
      },
    };
  }

  return state;
}


