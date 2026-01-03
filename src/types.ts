export interface Sprite {
  region: SpritesheetRegion;
  data: ImageData;
}

export interface Vector2 {
  x?: number;
  y?: number;
}
export interface SpritesheetRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export enum WordType {
  NOUN = 'noun',
  PROPERTY = 'property',
}

// ----------------------------------------------------------------------------
// WordGridElement

export type WordGridExposes = {
  deselect: () => void;
}

// ----------------------------------------------------------------------------
// DynamicSpriteElement

export type DynamicSpriteProps = {
  x?: number;
  y?: number;
  width?: string;
  word?: string;
  color?: string;
  type?: WordType | string;
  moreLettersOnTop?: boolean;
  crossedOut?: boolean;
};
export type DynamicSpriteExposes = {
  extractFrames: (scale?: number) => ImageData[];
};

// ----------------------------------------------------------------------------
// ExportSettingsPanel

export type ExportSettingsOptions = {
  scale: number;
  format: 'gif' | 'webp';
  combinedOnly: boolean;
};
