// Tokyo Night-inspired dark theme with colorful accents
export const theme = {
  bg: '#1a1b26',
  surface: '#222436',
  surfaceHover: '#2a2c42',
  surfaceAlt: '#1e2030',
  border: '#363850',
  text: '#c0caf5',
  textMuted: '#7982a9',
  textBright: '#e0e6ff',
  accent: '#7aa2f7',
  red: '#f7768e',
  orange: '#ff9e64',
  yellow: '#e0af68',
  green: '#9ece6a',
  purple: '#bb9af7',
  cyan: '#7dcfff',
} as const;

export const phaseColors = {
  specify:   { bg: '#7aa2f720', text: '#7aa2f7', dot: '#7aa2f7', label: 'Specify' },
  plan:      { bg: '#bb9af720', text: '#bb9af7', dot: '#bb9af7', label: 'Plan' },
  tasks:     { bg: '#ff9e6420', text: '#ff9e64', dot: '#ff9e64', label: 'Tasks' },
  implement: { bg: '#9ece6a20', text: '#9ece6a', dot: '#9ece6a', label: 'Implement' },
  unknown:   { bg: '#56587020', text: '#565870', dot: '#565870', label: '—' },
} as const;

export function getPhaseColors(phase: string) {
  return phaseColors[phase as keyof typeof phaseColors] ?? phaseColors.unknown;
}
