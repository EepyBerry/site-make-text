export interface Sprite {
  region: SpritesheetRegion
  data: ImageData
}

export interface SpritesheetRegion {
  x: number
  y: number
  w: number
  h: number
}
