import type { Sprite, SpritesheetRegion } from '@/types'
import appSpritesheetJson from '@/assets/spritesheet/app-spritesheet.json'
import appSpritesheet from '@/assets/spritesheet/app-spritesheet.png'
import { EventBus } from './event-bus'
import { ref, type Ref } from 'vue'
import { AnimatedSprite } from './models/animated-sprite.model'
import { SPRITESHEET_HEIGHT, SPRITESHEET_WIDTH } from './globals'

const SPRITESHEET_CANVAS: OffscreenCanvas = new OffscreenCanvas(SPRITESHEET_WIDTH, SPRITESHEET_HEIGHT)
const SPRITESHEET_ANIMSPRITES: Record<string, SpritesheetRegion[]> = appSpritesheetJson

export const SMTX_ANIMATED_SPRITES: Ref<AnimatedSprite[]> = ref([])

export async function initSpritesheetCanvas() {
  const ctx = SPRITESHEET_CANVAS.getContext('2d', { willReadFrequently: true })!
  const img = new Image(SPRITESHEET_WIDTH, SPRITESHEET_HEIGHT)
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
  for (const region of Object.entries(SPRITESHEET_ANIMSPRITES)) {
    const sprites: Sprite[] = await cutSpritesheetRegion(region[0], region[1])
    SMTX_ANIMATED_SPRITES.value.push(new AnimatedSprite(region[0], sprites))
  }
  EventBus.sendSpritesheetInitEvent()
}

async function cutSpritesheetRegion(
  key: string,
  regionsRef: SpritesheetRegion[],
): Promise<Sprite[]> {
  const frames: SpritesheetRegion[] | undefined = SPRITESHEET_ANIMSPRITES[key]
  if (!frames || frames.length === 0) throw new Error('Region does not exist for key: ' + key)

  const spritesheetCtx = SPRITESHEET_CANVAS.getContext('2d', { willReadFrequently: true })!
  const resultSprites: Sprite[] = []
  for (let idx = 0; idx < frames.length; idx++) {
    const f = frames[idx]!
    const imageData = spritesheetCtx.getImageData(f.x, f.y, f.w, f.h)
    resultSprites.push({
      region: regionsRef[idx]!,
      data: imageData
    })
  }
  return resultSprites
}
