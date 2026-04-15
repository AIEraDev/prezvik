export const GRID_COLUMNS = 12;
export const GRID_GAP = 24;

export function createColumns(count: number) {
  const colWidth = 100 / count;

  return Array.from({ length: count }, (_, i) => ({
    x: i * colWidth,
    width: colWidth,
  }));
}
