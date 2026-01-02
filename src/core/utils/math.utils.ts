import type { Vector2 } from '@/types';

export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(x, max));
}

export function getGridElement<T extends Vector2>(grid: T[] | undefined, x: number, y: number) {
  return grid?.find((d) => d.x === x && d.y === y);
}
export function getGridElementIndex<T extends Vector2>(grid: T[] | undefined, x: number, y: number): number {
  if (!grid) return -1;
  return grid?.findIndex((d) => d.x === x && d.y === y);
}

export function isBetween(n: number|null|undefined, min: number, max: number): boolean {
  if (n === undefined || n === null) return false;
  return n >= min && n <= max
}
export function isZeroOrPositive(n: number|null|undefined): boolean {
  return n !== undefined && n !== null && n >= 0;
}
