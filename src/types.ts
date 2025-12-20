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

export enum WordType { NOUN = "noun", PROPERTY = "property" }
export type DynamicSpriteProps = { width?: string, word?: string, color?: string, moreLettersOnTop?: boolean, type?: WordType|string }
