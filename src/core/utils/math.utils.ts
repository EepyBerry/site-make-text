
export type Coordinates = { x: number; y: number }
export function coordsEqual(c1: Coordinates, c2: Coordinates) {
  return c1.x === c2.x && c1.y === c2.y
}
