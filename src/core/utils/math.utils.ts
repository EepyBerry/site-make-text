import type { Vector2 } from '@/core/types';

export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(x, max));
}

export function getGridElement<T extends Vector2>(gridData: T[] | undefined, x: number, y: number) {
  return gridData?.find((d) => d.x === x && d.y === y);
}
export function getGridElementIndex<T extends Vector2>(gridData: T[] | undefined, x: number, y: number): number {
  if (!gridData) return -1;
  return gridData?.findIndex((d) => d.x === x && d.y === y);
}

export function isBetween(n: number | null | undefined, min: number, max: number): boolean {
  if (n === undefined || n === null) return false;
  return n >= min && n <= max;
}
export function isZeroOrPositive(n: number | null | undefined): boolean {
  return n !== undefined && n !== null && n >= 0;
}
