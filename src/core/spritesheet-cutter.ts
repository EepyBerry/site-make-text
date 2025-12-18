import type { Sprite, SpritesheetRegion } from '@/types'
import appSpritesheetJson from '@/assets/spritesheet/app-spritesheet.json'
import appSpritesheet from '@/assets/spritesheet/app-spritesheet.png'
import { EventBus } from './event-bus'
import { ref, toRaw, type Ref } from 'vue'
import { AnimatedSprite } from './models/animated-sprite.model'

const SPRITE_WORK_CANVAS: OffscreenCanvas = new OffscreenCanvas(24, 24)
const SPRITESHEET_CANVAS: OffscreenCanvas = new OffscreenCanvas(384, 72)
const SPRITESHEET_REGIONS: Record<string, SpritesheetRegion[]> = appSpritesheetJson

export const SMTX_ANIMATED_SPRITES: Ref<AnimatedSprite[]> = ref([])

export async function initSpritesheetCanvas() {
  SPRITESHEET_CANVAS.width = 384
  SPRITESHEET_CANVAS.height = 72
  const ctx = SPRITESHEET_CANVAS.getContext('2d')!
  const img = new Image(384, 72)
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    ctx.imageSmoothingEnabled = false
    cutSpritesheet()
  }
  img.src = appSpritesheet
}

export function getAnimatedSprite(key: string): AnimatedSprite | undefined {
  return SMTX_ANIMATED_SPRITES.value.find(as => as.key === key)
}

async function cutSpritesheet(): Promise<void> {
  for (const region of Object.entries(SPRITESHEET_REGIONS)) {
    const sprites: Sprite[] = await cutSpritesheetRegion(region[0], region[1])
    SMTX_ANIMATED_SPRITES.value.push(new AnimatedSprite(region[0], sprites))
  }
  console.log(toRaw(SMTX_ANIMATED_SPRITES.value))
  EventBus.sendSpritesheetInitEvent()
}

async function cutSpritesheetRegion(
  key: string,
  regionsRef: SpritesheetRegion[],
): Promise<Sprite[]> {
  const frames: SpritesheetRegion[] | undefined = SPRITESHEET_REGIONS[key]
  if (!frames || frames.length === 0) throw new Error('Region does not exist for key: ' + key)

  const spritesheetCtx = SPRITESHEET_CANVAS.getContext('2d', { willReadFrequently: true })!
  const spriteCtx = SPRITE_WORK_CANVAS.getContext('2d', { willReadFrequently: true })!

  const resultSprites: Sprite[] = []
  for (let idx = 0; idx < frames.length; idx++) {
    const f = frames[idx]!
    const region = regionsRef[idx]!
    const imageData = spritesheetCtx.getImageData(f.x, f.y, f.w, f.h)
    // adapt canvas and draw sprite, then get its ImageData
    SPRITE_WORK_CANVAS.width = region.w
    SPRITE_WORK_CANVAS.height = region.h
    spriteCtx.clearRect(0, 0, region.w, region.h)
    spriteCtx.putImageData(imageData, 0, 0)
    // Create blob and push all data to result array as a Sprite
    const spriteBlob = await SPRITE_WORK_CANVAS.convertToBlob({ type: 'image/png' })
    resultSprites.push({
      region: regionsRef[idx]!,
      blob: spriteBlob,
      blobURL: URL.createObjectURL(spriteBlob),
    })
  }
  return resultSprites
}
