// ----------------------------------------------------------------------------
// spritesheet types

import type { SpritesheetSource } from './models/animated-sprite.model';

export interface Spritesheet {
  width: number;
  height: number;
  source: SpritesheetSource;
  descriptor: JsonSpritesheetDescriptor;
}
export interface JsonSpritesheetDescriptor {
  wordmap: Record<string, string>;
  regions: Record<string, SpritesheetRegion[]>;
}
export interface SpritesheetRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Sprite {
  region: SpritesheetRegion;
  data: ImageData;
}

// ----------------------------------------------------------------------------
// generic types

export enum WordType {
  NOUN = 'noun',
  PROPERTY = 'property',
}
export interface Vector2 {
  x?: number;
  y?: number;
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
// SpritesheetSettingsPanel

export type SpritesheetSettingsOptions = {
  usermadeFile?: File;
  usermadeDescriptor?: JsonSpritesheetDescriptor;
  enableUsermadeObjects: boolean;
};

// ----------------------------------------------------------------------------
// ExportSettingsPanel

export type ExportSettingsOptions = {
  scale: number;
  format: 'gif' | 'webp';
  combinedOnly: boolean;
};
