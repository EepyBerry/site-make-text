import type { SpritesheetRegion } from "@/types"
import appSpritesheetJson from '@/assets/spritesheet/app-spritesheet.json';
import appSpritesheet from '@/assets/spritesheet/app-spritesheet.png';

const SPRITESHEET_CANVAS: OffscreenCanvas = new OffscreenCanvas(384, 72)
const SPRITESHEET_REGIONS: Record<string, SpritesheetRegion[]> = appSpritesheetJson

export function initSpritesheetCanvas() {
  const ctx: OffscreenCanvasRenderingContext2D = SPRITESHEET_CANVAS.getContext('2d')!
  const img = new Image()
  img.src = appSpritesheet
  ctx.drawImage(img, 0, 0)
}

export function cutSpritesheetSprite(key: string): Uint8ClampedArray[] {
  const frames: SpritesheetRegion[] | undefined = SPRITESHEET_REGIONS[key]
  if (!frames || frames.length === 0) throw new Error("Region does not exist for key: " + key);

  const ctx: OffscreenCanvasRenderingContext2D = SPRITESHEET_CANVAS.getContext('2d', { willReadFrequently: true })!
  return frames.map(f => ctx.getImageData(f.x, f.y, f.w, f.h).data)
}
