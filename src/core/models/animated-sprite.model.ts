import type { Sprite, SpritesheetRegion } from "@/types"

export class AnimatedSprite {
  private _key: string
  public get key(): string {
    return this._key
  }
  public set key(value: string) {
    this._key = value
  }

  private _frames: Sprite[]
  public get frames(): Sprite[] {
    return this._frames
  }
  public set frames(value: Sprite[]) {
    this._frames = value
  }

  constructor(key: string, frames: Sprite[]) {
    this._key = key
    this._frames = frames
  }

  public get urls(): string[] {
    return this._frames.map(f => f.blobURL)
  }
  public get regions(): SpritesheetRegion[] {
    return this._frames.map(f => f.region)
  }
}
