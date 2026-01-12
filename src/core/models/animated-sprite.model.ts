import type { Sprite, SpritesheetRegion } from '@/core/types';

export type SpritesheetSource = 'main' | 'object-default' | 'object-usermade';
export class AnimatedSprite {
  private _key: string;
  public get key(): string {
    return this._key;
  }
  public set key(value: string) {
    this._key = value;
  }

  private _frames: Sprite[];
  public get frames(): Sprite[] {
    return this._frames;
  }
  public set frames(value: Sprite[]) {
    this._frames = value;
  }

  private _source: SpritesheetSource;
  public get source(): SpritesheetSource {
    return this._source;
  }
  public set source(value: SpritesheetSource) {
    this._source = value;
  }

  constructor(key: string, source: SpritesheetSource, frames: Sprite[]) {
    this._key = key;
    this._source = source;
    this._frames = frames;
  }

  public get regions(): SpritesheetRegion[] {
    return this._frames.map((f) => f.region);
  }
}
