export const spacingScale = [4, 8, 16, 24, 32, 48, 64];

export function space(level: number) {
  return spacingScale[level] || 16;
}
