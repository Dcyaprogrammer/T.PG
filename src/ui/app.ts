import { createCliRenderer, BoxRenderable, TextRenderable, InputRenderable } from '@opentui/core';
import { GameState } from '../game/gameState';
import { createBoardView } from './components/BoardView';
import { layoutMetrics, startScreenShortcuts, themeColors, type CommandShortcut } from './theme';

type UiMode = 'start' | 'game';

export async function startUi(game: GameState) {
  const palette = themeColors;
  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: true,
    backgroundColor: palette.background,
  });

  const layout = new BoxRenderable(renderer, {
    id: 'layout',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: layoutMetrics.padding,
    backgroundColor: palette.background,
    gap: layoutMetrics.gap,
  });
  renderer.root.add(layout);

  let currentMode: UiMode = 'start';
  let inCommandMode = false;

  const header = buildHeader(renderer, palette);
  layout.add(header);

  const boardView = createBoardView(renderer, game);
  boardView.container.visible = false;
  layout.add(boardView.container);

  const commands = buildCommandList(renderer, palette);
  layout.add(commands);

  const input = buildCommandInput(renderer, palette, {
    onEnter: (cmd: string) => {
      const normalized = cmd.trim().toLowerCase();
      if (currentMode === 'start') {
        if (normalized === ':start spider' || normalized === ':start' || normalized === 'start spider' || normalized === 'start') {
          switchToGame();
        }
      } else if (currentMode === 'game') {
        if (normalized === ':exit' || normalized === ':quit' || normalized === 'exit' || normalized === 'quit') {
          switchToStart();
        } else {
          input.container.visible = false;
        }
      }
      inCommandMode = false;
      input.input.value = '';
      input.input.blur();
    },
    onEscape: () => {
      inCommandMode = false;
      input.input.blur();
      input.input.value = '';
      if (currentMode === 'game') {
        input.container.visible = false;
      }
      renderer.requestRender();
    },
  });
  layout.add(input.container);

  const statusBar = buildStatusBar(renderer, palette);
  layout.add(statusBar);

  function switchToGame(): void {
    currentMode = 'game';
    header.visible = false;
    commands.visible = false;
    input.container.visible = false;
    boardView.container.visible = true;
    boardView.refresh();
    inCommandMode = false;
    renderer.requestRender();
  }

  function switchToStart(): void {
    currentMode = 'start';
    header.visible = true;
    commands.visible = true;
    input.container.visible = true;
    boardView.container.visible = false;
    inCommandMode = false;
    renderer.requestRender();
  }

  renderer.keyInput.on('keypress', (key) => {
    if (key.sequence === ':' && !inCommandMode) {
      inCommandMode = true;
      if (currentMode === 'game') {
        input.container.visible = true;
      }
      input.input.focus();
      input.input.value = '';
      input.input.requestRender();
      renderer.requestRender();
      return;
    }

    if (inCommandMode && key.name === 'escape') {
      inCommandMode = false;
      input.input.blur();
      input.input.value = '';
      if (currentMode === 'game') {
        input.container.visible = false;
      }
      renderer.requestRender();
      return;
    }
  });

  renderer.start();
}

function buildHeader(renderer: any, palette: typeof themeColors): BoxRenderable {
  const container = new BoxRenderable(renderer, {
    id: 'header',
    flexDirection: 'column',
    gap: 1,
    alignItems: 'center',
  });

  const logo = new TextRenderable(renderer, {
    id: 'logo',
    content: '⌬ Spider Solitaire',
    fg: palette.primary,
    attributes: 1,
  });
  container.add(logo);

  const subtitle = new TextRenderable(renderer, {
    id: 'subtitle',
    content: 'A terminal practice project inspired by OpenCode',
    fg: palette.textMuted,
  });
  container.add(subtitle);

  return container;
}

function buildCommandList(renderer: any, palette: typeof themeColors): BoxRenderable {
  const container = new BoxRenderable(renderer, {
    id: 'commands',
    flexDirection: 'column',
    gap: 1,
    alignItems: 'center',
  });

  const wrapper = new BoxRenderable(renderer, {
    id: 'commands-wrapper',
    border: true,
    borderColor: palette.border,
    backgroundColor: palette.backgroundAlt,
    padding: 2,
    gap: 1,
  });
  container.add(wrapper);

  const title = new TextRenderable(renderer, {
    id: 'commands-title',
    content: 'quick commands',
    fg: palette.secondary,
    attributes: 1,
  });
  wrapper.add(title);

  for (const shortcut of startScreenShortcuts) {
    wrapper.add(makeCommandRow(renderer, palette, shortcut));
  }

  return container;
}

function makeCommandRow(
  renderer: any,
  palette: typeof themeColors,
  shortcut: CommandShortcut,
): BoxRenderable {
  const row = new BoxRenderable(renderer, {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: layoutMetrics.commandListWidth,
  });

  const commandText = new TextRenderable(renderer, {
    content: `${shortcut.command.padEnd(10, ' ')}`,
    fg: palette.primary,
  });
  const description = new TextRenderable(renderer, {
    content: shortcut.description,
    fg: palette.text,
  });
  const hint = new TextRenderable(renderer, {
    content: shortcut.hint,
    fg: palette.accent,
  });

  row.add(commandText);
  row.add(description);
  row.add(hint);

  return row;
}

function buildCommandInput(
  renderer: any,
  palette: typeof themeColors,
  callbacks?: { onEnter?: (cmd: string) => void; onEscape?: () => void },
) {
  const container = new BoxRenderable(renderer, {
    id: 'command-input',
    flexDirection: 'column',
    backgroundColor: palette.backgroundAlt,
    border: true,
    borderColor: palette.border,
    padding: 2,
    gap: 1,
  });

  const prompt = new TextRenderable(renderer, {
    id: 'prompt',
    content: '> start spider',
    fg: palette.text,
  });

  const caption = new TextRenderable(renderer, {
    id: 'caption',
    content: 'press : to enter command mode, enter to start',
    fg: palette.textMuted,
  });

  const input = new InputRenderable(renderer, {
    id: 'input',
    backgroundColor: palette.background,
    textColor: '#ffffff',
    placeholderColor: palette.textMuted,
    cursorColor: palette.secondary,
    focusedBackgroundColor: palette.backgroundAlt,
    focusedTextColor: '#ffffff',
    placeholder: 'type :start spider or :start to begin…',
    live: true,
    height: 1,
    onKeyDown: (key) => {
      if (key.name === 'return') {
        const cmd = input.value;
        input.value = '';
        callbacks?.onEnter?.(cmd);
        renderer.requestRender();
        key.preventDefault();
      } else if (key.name === 'escape') {
        callbacks?.onEscape?.();
        key.preventDefault();
      }
      // Don't prevent default for other keys to allow normal input
    },
  });

  // Listen to input events to ensure rendering
  input.on('input', () => {
    renderer.requestRender();
  });

  container.add(prompt);
  container.add(input);
  container.add(caption);

  return { container, input };
}

function buildStatusBar(renderer: any, palette: typeof themeColors): BoxRenderable {
  const bar = new BoxRenderable(renderer, {
    id: 'status-bar',
    flexDirection: 'row',
    backgroundColor: palette.backgroundAlt,
    padding: 1,
    paddingLeft: 2,
    paddingRight: 2,
    justifyContent: 'space-between',
  });

  const left = new TextRenderable(renderer, {
    content: 'opencode zen Claude Opus 4.1',
    fg: palette.textMuted,
  });
  const right = new TextRenderable(renderer, {
    content: 'PLAN_AGENT',
    fg: palette.background,
    bg: palette.accent,
    attributes: 1,
  });

  bar.add(left);
  bar.add(right);

  return bar;
}