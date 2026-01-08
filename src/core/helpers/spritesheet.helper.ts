import type { Sprite, SpritesheetRegion } from '@/core/types';
import { EventBus } from '../event-bus';
import { ref, type Ref } from 'vue';
import { AnimatedSprite } from '../models/animated-sprite.model';
import {
  MAIN_SPRITESHEET_HEIGHT,
  MAIN_SPRITESHEET_WIDTH,
  OBJECT_SPRITESHEET_HEIGHT,
  OBJECT_SPRITESHEET_WIDTH,
} from '../globals';
import mainSpritesheet from '@/assets/spritesheets/app-spritesheet.png';
import mainSpritesheetJson from '@/assets/spritesheets/app-spritesheet.json';
import objectSpritesheet from '@/assets/spritesheets/object-spritesheet.png';
import objectSpritesheetJson from '@/assets/spritesheets/object-spritesheet.json';

const MAIN_SPRITESHEET_CANVAS: OffscreenCanvas = new OffscreenCanvas(MAIN_SPRITESHEET_WIDTH, MAIN_SPRITESHEET_HEIGHT);
const MAIN_SPRITESHEET_REGIONS: Record<string, SpritesheetRegion[]> = mainSpritesheetJson;
const OBJECT_SPRITESHEET_CANVAS: OffscreenCanvas = new OffscreenCanvas(
  OBJECT_SPRITESHEET_WIDTH,
  OBJECT_SPRITESHEET_HEIGHT,
);
const OBJECT_SPRITESHEET_REGIONS: Record<string, SpritesheetRegion[]> = objectSpritesheetJson;

export const SMTX_ANIMATED_SPRITES: Ref<AnimatedSprite[]> = ref([]);

export async function initSpritesheets() {
  const mainCtx = MAIN_SPRITESHEET_CANVAS.getContext('2d', { willReadFrequently: true })!;
  const mainImg = new Image(MAIN_SPRITESHEET_WIDTH, MAIN_SPRITESHEET_HEIGHT);
  mainImg.onload = () => {
    mainCtx.drawImage(mainImg, 0, 0);
    mainCtx.imageSmoothingEnabled = false;
    cutSpritesheet(MAIN_SPRITESHEET_CANVAS, MAIN_SPRITESHEET_REGIONS);
  };
  mainImg.src = mainSpritesheet;

  const objCtx = OBJECT_SPRITESHEET_CANVAS.getContext('2d', { willReadFrequently: true })!;
  const objImg = new Image(OBJECT_SPRITESHEET_WIDTH, OBJECT_SPRITESHEET_HEIGHT);
  objImg.onload = () => {
    objCtx.drawImage(objImg, 0, 0);
    objCtx.imageSmoothingEnabled = false;
    cutSpritesheet(OBJECT_SPRITESHEET_CANVAS, OBJECT_SPRITESHEET_REGIONS);
  };
  objImg.src = objectSpritesheet;
}

export function getAnimatedSprite(key: string): AnimatedSprite | undefined {
  return SMTX_ANIMATED_SPRITES.value.find((as) => as.key === key);
}

// ----------------------------------------------------------------------------
// internal functions

async function cutSpritesheet(canvas: OffscreenCanvas, jsonRegions: Record<string, SpritesheetRegion[]>): Promise<void> {
  for (const jsonKey of Object.keys(jsonRegions)) {
    const sprites: Sprite[] = await cutSpritesheetRegion(canvas, jsonRegions, jsonKey);
    SMTX_ANIMATED_SPRITES.value.push(new AnimatedSprite(jsonKey, sprites));
  }
  EventBus.sendSpritesheetInitEvent();
}

async function cutSpritesheetRegion(canvas: OffscreenCanvas, jsonRegions: Record<string, SpritesheetRegion[]>, key: string): Promise<Sprite[]> {
  const regions: SpritesheetRegion[] | undefined = jsonRegions[key];
  if (!regions || regions.length === 0) throw new Error('Region does not exist for key: ' + key);

  const spritesheetCtx = canvas.getContext('2d', { willReadFrequently: true })!;
  const resultSprites: Sprite[] = [];

  let curRegion: SpritesheetRegion | null = null
  for (let idx = 0; idx < regions.length; idx++) {
    curRegion = regions[idx]!;
    const imageData = spritesheetCtx.getImageData(curRegion.x, curRegion.y, curRegion.w, curRegion.h);
    resultSprites.push({
      region: curRegion,
      data: imageData,
    });
  }
  return resultSprites;
}
