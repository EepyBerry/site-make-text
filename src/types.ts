export interface Sprite {
  region: SpritesheetRegion
  blob: Blob
  blobURL: string
}

export interface SpritesheetRegion {
  x: number
  y: number
  w: number
  h: number
}
