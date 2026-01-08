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
  extractGridFrames: (scale?: number) => DynamicSpriteFrameData[];
};

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
  drawObject?: boolean;
};
export type DynamicSpriteFrameData = { frames: ImageData[] } & Required<Vector2>;
export type DynamicSpriteExposes = {
  extractFrames: (scale?: number) => DynamicSpriteFrameData;
};

// ----------------------------------------------------------------------------
// ExportSettingsPanel

export type ExportSettingsOptions = {
  scale: number;
  format: 'gif' | 'webp';
  combinedOnly: boolean;
};
