import type { JsonSpritesheetDescriptor, Sprite, Spritesheet, SpritesheetRegion } from '@/core/types';
import { EventBus } from '../event-bus';
import { ref, type Ref } from 'vue';
import { AnimatedSprite, type SpritesheetSource } from '../models/animated-sprite.model';
import mainSpritesheetURL from '@/assets/spritesheets/app-spritesheet.png';
import mainSpritesheetDescriptor from '@/assets/spritesheets/app-spritesheet.json';
import defaultObjSpritesheetURL from '@/assets/spritesheets/object-spritesheet.png';
import defaultObjSpritesheetDescriptor from '@/assets/spritesheets/object-spritesheet.json';
import { loadImage, drawImageOntoCanvas } from './image.helper';

/**
 * Main {@link AnimatedSprite} registry for the application.
 */
export const SMTX_ANIMSPRITE_REGISTRY: Ref<AnimatedSprite[]> = ref([]);

/**
 * Main spritesheet registry for the application.
 *
 * Contains at most three spritesheets: `main`, `object-default` and `object-usermade` (optional).
 */
export const SMTX_SPRITESHEET_REGISTRY: Ref<Spritesheet[]> = ref([]);

/**
 * App-wide toggle for user-made object spritesheet (overrides default sprites if enabled)
 */
export const SMTX_ENABLE_USERMADE_SPRITESHEET: Ref<boolean> = ref(false);

/**
 * Loads the main spritesheet and extract each {@link AnimatedSprite} according to its JSON descriptor file.
 */
export async function initAppSpritesheet() {
  const img = await loadImage(mainSpritesheetURL);
  drawImageOntoCanvas(img, async (_, ctx) => {
    await cutSpritesheet('main', ctx, mainSpritesheetDescriptor.regions);
    SMTX_SPRITESHEET_REGISTRY.value.push({
      width: img.naturalWidth,
      height: img.naturalHeight,
      source: 'main',
      descriptor: mainSpritesheetDescriptor,
    });
  });
}

export async function loadDefaultObjectSpritesheet() {
  const img = await loadImage(defaultObjSpritesheetURL);
  await drawImageOntoCanvas(img, async (_, ctx) => {
    await cutSpritesheet('object-default', ctx, defaultObjSpritesheetDescriptor.regions);
    SMTX_SPRITESHEET_REGISTRY.value.push({
      width: img.naturalWidth,
      height: img.naturalHeight,
      source: 'object-default',
      descriptor: defaultObjSpritesheetDescriptor,
    });
    EventBus.sendSpritesheetInitEvent();
  });
}

export async function loadUsermadeObjectSpritesheet(
  spritesheetFile: ImageBitmapSource,
  descriptor: JsonSpritesheetDescriptor,
) {
  // remove all custom object sprites from registry
  const objSprites = SMTX_ANIMSPRITE_REGISTRY.value.filter((as) => as.source !== 'object-usermade');
  SMTX_ANIMSPRITE_REGISTRY.value.splice(0);
  SMTX_ANIMSPRITE_REGISTRY.value.push(...objSprites);

  // remove existing custom spritesheet
  const usermadeSpritesheetIdx = SMTX_SPRITESHEET_REGISTRY.value.findIndex((as) => as.source === 'object-usermade');
  if (usermadeSpritesheetIdx >= 0) {
    SMTX_SPRITESHEET_REGISTRY.value.splice(usermadeSpritesheetIdx, 1);
  }

  // replace with new data
  drawImageOntoCanvas(spritesheetFile, async (canvas, ctx) => {
    await cutSpritesheet('object-usermade', ctx, descriptor.regions);
    SMTX_SPRITESHEET_REGISTRY.value.push({
      width: canvas.width,
      height: canvas.height,
      source: 'object-usermade',
      descriptor,
    });
    EventBus.sendSpritesheetReloadEvent();
  });
}

export function setEnableUsermadeObjectSpritesheet(value: boolean) {
  SMTX_ENABLE_USERMADE_SPRITESHEET.value = value;
  EventBus.sendSpritesheetReloadEvent();
}

// ----------------------------------------------------------------------------
// update functions

export function updateFrameIndex(current: Ref<number>): void {
  current.value++;
  if (current.value === 3) current.value = 0;
}
export function updateRawFrameIndex(index: number): number {
  index++;
  if (index === 3) index = 0;
  return index;
}

export function isWordSpecial(word?: string) {
  return getObjectWordMap()[word ?? ''] !== undefined;
}

export function getWordObject(word: string): string {
  return getObjectWordMap()[word]!.toLowerCase();
}

// ----------------------------------------------------------------------------
// getter functions

export function getObjectWordMap(): Record<string, string> {
  return {
    ...SMTX_SPRITESHEET_REGISTRY.value[1]?.descriptor.wordmap, // default object spritesheet
    ...(!!SMTX_ENABLE_USERMADE_SPRITESHEET.value
      ? SMTX_SPRITESHEET_REGISTRY.value[2]?.descriptor.wordmap // usermade object spritesheet
      : undefined),
  };
}
export function getSpritesheet(source: SpritesheetSource) {
  return SMTX_SPRITESHEET_REGISTRY.value.find((as) => as.source === source);
}
export function getAnimatedSprite(key: string): AnimatedSprite | undefined {
  // look from the end of the array to get the last sprite matching the given key
  // (accounts for custom spritesheet overrides)
  return SMTX_ANIMSPRITE_REGISTRY.value
    .slice()
    .reverse()
    .filter((s) => (SMTX_ENABLE_USERMADE_SPRITESHEET.value ? true : s.source !== 'object-usermade'))
    .find((as) => as.key === key);
}

// ----------------------------------------------------------------------------
// internal functions

async function cutSpritesheet(
  source: SpritesheetSource,
  canvasContext: OffscreenCanvasRenderingContext2D,
  jsonRegions: Record<string, SpritesheetRegion[]>,
): Promise<void> {
  for (const jsonKey of Object.keys(jsonRegions)) {
    const sprites: Sprite[] = await cutSpritesheetRegion(canvasContext, jsonRegions, jsonKey);
    SMTX_ANIMSPRITE_REGISTRY.value.push(new AnimatedSprite(jsonKey, source, sprites));
  }
}

async function cutSpritesheetRegion(
  canvasContext: OffscreenCanvasRenderingContext2D,
  jsonRegions: Record<string, SpritesheetRegion[]>,
  key: string,
): Promise<Sprite[]> {
  const regions: SpritesheetRegion[] | undefined = jsonRegions[key];
  if (!regions || regions.length < 1) throw new Error('Region does not exist for key: ' + key);

  const resultSprites: Sprite[] = [];
  let curRegion: SpritesheetRegion | null = null;
  for (let idx = 0; idx < 3; idx++) {
    curRegion = regions[idx] ?? regions[idx - 1]!;
    const imageData = canvasContext.getImageData(curRegion.x, curRegion.y, curRegion.w ?? 24, curRegion.h ?? 24);
    resultSprites.push({
      region: curRegion,
      data: imageData,
    });
  }
  return resultSprites;
}
