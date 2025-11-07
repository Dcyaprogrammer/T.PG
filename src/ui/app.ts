import { createCliRenderer, BoxRenderable, TextRenderable } from '@opentui/core';

export async function startUi() {
  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: true,
  });

  const layout = new BoxRenderable(renderer, {
    id: 'layout',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  });
  renderer.root.add(layout);

  const title = new TextRenderable(renderer, {
    id: 'title',
    content: 'Spider Solitaire',
  });
  layout.add(title);

  const hint = new TextRenderable(renderer, {
    id: 'hint',
    content: 'Press ":" to enter command mode. Press Ctrl+C to quit.',
  });
  layout.add(hint);

  renderer.start();
}