const colorMap: Record<string, string> = {
  'dark brown': '#4a3226',
  'light brown': '#a67b5b',
  brown: '#8b5a2b',
  red: '#d62828',
  magenta: '#c2185b',
  black: '#111111',
  white: '#ffffff',
  navy: '#1b2a4a',
  beige: '#e8dcc8',
  cream: '#f5f0e6',
  gray: '#808080',
  grey: '#808080',
};

export function getSwatchColor(optionValue: string): string {
  const key = optionValue.trim().toLowerCase();
  return colorMap[key] ?? key;
}