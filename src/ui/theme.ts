export interface CommandShortcut {
  command: string;
  description: string;
  hint: string;
}

export const themeColors = {
  background: '#212121',
  backgroundAlt: '#252525',
  border: '#4b4c5c',
  text: '#e0e0e0',
  textMuted: '#6a6a6a',
  primary: '#fab283',
  secondary: '#5c9cf5',
  accent: '#9d7cd8',
} as const;

export const startScreenShortcuts: CommandShortcut[] = [
  { command: 'start spider', description: 'start new game', hint: ':start' },
  { command: '/help', description: 'show help', hint: ':help' },
  { command: '/quit', description: 'quit game', hint: ':quit' },
];

export const layoutMetrics = {
  padding: 4,
  gap: 3,
  commandListWidth: 40,
} as const;

