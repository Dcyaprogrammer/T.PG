import { createCliRenderer, BoxRenderable, TextRenderable, InputRenderable } from '@opentui/core';
import { layoutMetrics, startScreenShortcuts, themeColors, type CommandShortcut } from './theme';

export async function startUi() {
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

  const header = buildHeader(renderer, palette);
  layout.add(header);

  const commands = buildCommandList(renderer, palette);
  layout.add(commands);

  const input = buildCommandInput(renderer, palette);
  layout.add(input.container);

  const statusBar = buildStatusBar(renderer, palette);
  layout.add(statusBar);

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

function buildCommandInput(renderer: any, palette: typeof themeColors) {
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
    content: '> how could I …',
    fg: palette.text,
  });

  const caption = new TextRenderable(renderer, {
    id: 'caption',
    content: 'enter send',
    fg: palette.textMuted,
  });

  const input = new InputRenderable(renderer, {
    id: 'input',
    backgroundColor: palette.background,
    textColor: palette.text,
    placeholderColor: palette.textMuted,
    cursorColor: palette.secondary,
    focusedBackgroundColor: palette.background,
    focusedTextColor: palette.text,
    placeholder: 'type a command or ask a question…',
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