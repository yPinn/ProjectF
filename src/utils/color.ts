export function hexToRgb(hex: string): string {
  const c = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16)).join(',')
}
