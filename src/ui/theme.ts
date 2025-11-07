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
  { command: '/new', description: 'new session', hint: 'ctrl+x n' },
  { command: '/help', description: 'show help', hint: 'ctrl+x h' },
  { command: '/share', description: 'share session', hint: 'ctrl+x s' },
  { command: '/models', description: 'list models', hint: 'ctrl+x m' },
  { command: '/agents', description: 'list agents', hint: 'ctrl+x a' },
];

export const layoutMetrics = {
  padding: 4,
  gap: 3,
  commandListWidth: 40,
} as const;

