export interface YearPoint {
  year: number;
}

export function findYearIndex(points: readonly YearPoint[], year: number): number | null {
  if (!Number.isInteger(year)) {
    return null;
  }

  const index = points.findIndex((point) => point.year === year);
  return index < 0 ? null : index;
}

export function shouldAnnounceProgress(startIndex: number, currentIndex: number, lastIndex: number): boolean {
  const progress = currentIndex - startIndex;
  return progress === 0 || progress % 5 === 0 || currentIndex === lastIndex;
}
