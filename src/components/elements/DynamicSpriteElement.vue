<template>
  <canvas ref="spriteCanvas" class="sprite animated" width="24" height="24"></canvas>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import type { AnimatedSprite } from '@/core/models/animated-sprite.model';
import { getAnimatedSprite, getWordObject, isWordSpecial, updateFrameIndex, updateRawFrameIndex } from '@/core/helpers/spritesheet.helper';
import { onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { WordType, type DynamicSpriteFrameData, type DynamicSpriteProps } from '@/core/types';
import { SPRITESHEET_CELL_SIZE } from '@/core/globals';
import { allComponentsEqualTo } from '@/core/utils/color.utils';
import tinycolor from 'tinycolor2';

const spriteCanvas = useTemplateRef('spriteCanvas')!;
const emptySprite: Ref<AnimatedSprite | null> = ref(null);
const blockSprite: Ref<AnimatedSprite | null> = ref(null);
const crossSprite: Ref<AnimatedSprite | null> = ref(null);
const letterSprites: Ref<AnimatedSprite[]> = ref([]);
const specialObjectSprite: Ref<AnimatedSprite | null> = ref(null);
const spriteFrameIndex: Ref<number> = ref(0);

const $props = withDefaults(defineProps<DynamicSpriteProps>(), { x: -1, y: -1 });

onMounted(() => {
  if (!EventBus.spritesheetInitEvent.value) return;
  _checkSpecialMode();
  _loadEmptySprite();
  _loadBlockSprite();
  _loadCrossSprite();
  _reloadLetterSprites();
  _updateCanvas(spriteCanvas.value!);
});
watch($props, () => {
  _checkSpecialMode();
  _reloadLetterSprites();
  _updateCanvas(spriteCanvas.value!);
});
watch(EventBus.spritesheetInitEvent, () => {
  _checkSpecialMode();
  _loadEmptySprite();
  _loadBlockSprite();
  _loadCrossSprite();
  _reloadLetterSprites();
  _updateCanvas(spriteCanvas.value!);
});
watch(EventBus.spritesheetReloadEvent, () => {
  _checkSpecialMode();
  _loadEmptySprite();
  _loadBlockSprite();
  _loadCrossSprite();
  _reloadLetterSprites();
  _updateCanvas(spriteCanvas.value!);
});
watch(EventBus.tickEvent, () => {
  updateFrameIndex(spriteFrameIndex);
  _updateCanvas(spriteCanvas.value!);
});
defineExpose({ extractFrames });

// ----------------------------------------------------------------------------
// exposed functions

function extractFrames(scale: number = 2): DynamicSpriteFrameData {
  const scaledImageSize: number = SPRITESHEET_CELL_SIZE * scale;

  const rawCanvas: OffscreenCanvas = new OffscreenCanvas(SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);
  const scaleCanvas: OffscreenCanvas = new OffscreenCanvas(scaledImageSize, scaledImageSize);
  const rawCtx = rawCanvas.getContext('2d', { willReadFrequently: true, alpha: true, colorSpace: 'srgb' });
  const scaleCtx = scaleCanvas.getContext('2d', { willReadFrequently: true, alpha: true, colorSpace: 'srgb' });
  if (!rawCtx || !scaleCtx) throw new Error('Cannot extract frames: context was not properly initialized');

  // prepare raw canvas
  rawCtx.globalCompositeOperation = 'source-in';

  // prepare scaled-up canvas
  _clearCanvas(scaleCtx);
  scaleCtx.scale(scale, scale);
  scaleCtx.globalCompositeOperation = 'source-over';
  scaleCtx.imageSmoothingEnabled = false;

  // skip empty words
  if (!letterSprites.value || letterSprites.value.length === 0) {
    return { x: $props.x, y: $props.y, frames: [], isEmpty: true };
  }

  // iterate on frames and draw them one by one on canvas first, and then as a gif frame
  const frames: ImageData[] = [];
  for (let i = 0; i < 3; i++) {
    _clearCanvas(rawCtx);

    // early skip if we draw the object instead of the letters
    if ($props.drawObject === true && specialObjectSprite.value !== null) {
      _drawObject(rawCtx, i);
      _clearCanvas(scaleCtx);
      scaleCtx.drawImage(rawCanvas, 0, 0);
      frames.push(scaleCtx.getImageData(0, 0, scaledImageSize, scaledImageSize));
      continue;
    }

    // Draw letters
    switch (letterSprites.value.length) {
      case 1:
        _drawLetter(rawCtx, i);
        break;
      case 2:
        _drawLettersAsDuo(rawCtx, i);
        break;
      case 3:
        _drawLettersAsTrio(rawCtx, i);
        break;
      case 4:
        _drawLettersAsQuad(rawCtx, i);
        break;
      case 5:
        _drawLettersAsQuint(rawCtx, i);
        break;
      case 6:
        _drawLettersAsHexa(rawCtx, i);
        break;
      case 7:
        _drawLettersAsHepta(rawCtx, i);
        break;
      case 8:
        _drawLettersAsOcto(rawCtx, i);
        break;
    }
    _applyColor(rawCtx);
    if ($props.type === WordType.PROPERTY) _drawBlock(rawCtx, i);
    if ($props.crossedOut) _drawCross(rawCtx, i);

    // Scale raw data on scaleCanvas
    _clearCanvas(scaleCtx);
    scaleCtx.drawImage(rawCanvas, 0, 0);
    frames.push(scaleCtx.getImageData(0, 0, scaledImageSize, scaledImageSize));
  }
  return { x: $props.x, y: $props.y, frames, isEmpty: $props.word?.length === 0 };
}

// ----------------------------------------------------------------------------
// internal functions

function _checkSpecialMode() {
  if (!isWordSpecial($props.word)) {
    specialObjectSprite.value = null;
    return;
  }
  const objectAnimSprite = getAnimatedSprite(getWordObject($props.word!));
  specialObjectSprite.value = objectAnimSprite ?? null;
}

function _loadEmptySprite() {
  const emptyAnimSprite = getAnimatedSprite('empty');
  if (!emptyAnimSprite) throw new Error('Cannot find sprite for "empty"');
  emptySprite.value = emptyAnimSprite;
}
function _loadBlockSprite() {
  const blockAnimSprite = getAnimatedSprite('block');
  if (!blockAnimSprite) throw new Error('Cannot find sprite for "block"');
  blockSprite.value = blockAnimSprite;
}
function _loadCrossSprite() {
  const crossAnimSprite = getAnimatedSprite('cross');
  if (!crossAnimSprite) throw new Error('Cannot find sprite for "cross"');
  crossSprite.value = crossAnimSprite;
}
function _reloadLetterSprites() {
  letterSprites.value.splice(0);
  for (let i = 0; i < $props.word!.length; i++) {
    // get letter; replace invalid letters by '?'
    let letter = $props.word!.charAt(i);
    if (!/^[A-Za-z0-9\?\!\.\,\>\<\:\;]+$/.test(letter)) letter = '?';

    // check if we must use small letters; special case for 5-letter words
    const useSmallLetters: boolean =
      $props.word!.length === 5 ? ($props.moreLettersOnTop ? i <= 2 : i >= 2) : [3, 6, 7].includes($props.word!.length);

    // check if we must use tiny letters; special case for 7-letter words
    const useTinyLetters: boolean =
      $props.word!.length === 7 ? ($props.moreLettersOnTop ? i <= 3 : i >= 3) : [7, 8].includes($props.word!.length);

    // get each letter's AnimatedSprite
    const letterAnimSprite = getAnimatedSprite(
      `letter-${letter.toLowerCase()}${useTinyLetters ? '-tiny' : useSmallLetters ? '-small' : ''}`,
    );
    if (!letterAnimSprite) continue;
    letterSprites.value.push(letterAnimSprite!);
  }
}

function _updateCanvas(canvas: HTMLCanvasElement | OffscreenCanvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' })! as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!ctx) return;
  _clearCanvas(ctx);
  ctx.globalCompositeOperation = 'source-in';

  // early return if the word is empty
  if (!letterSprites.value || letterSprites.value.length === 0) {
    _drawEmpty(ctx, spriteFrameIndex.value);
    return;
  }

  // early return if we draw the object instead of the letters
  if ($props.drawObject === true && specialObjectSprite.value !== null) {
    _drawObject(ctx, spriteFrameIndex.value);
    return;
  }

  // continue here if we draw the letters
  switch (letterSprites.value.length) {
    case 1:
      _drawLetter(ctx, spriteFrameIndex.value);
      break;
    case 2:
      _drawLettersAsDuo(ctx, spriteFrameIndex.value);
      break;
    case 3:
      _drawLettersAsTrio(ctx, spriteFrameIndex.value);
      break;
    case 4:
      _drawLettersAsQuad(ctx, spriteFrameIndex.value);
      break;
    case 5:
      _drawLettersAsQuint(ctx, spriteFrameIndex.value);
      break;
    case 6:
      _drawLettersAsHexa(ctx, spriteFrameIndex.value);
      break;
    case 7:
      _drawLettersAsHepta(ctx, spriteFrameIndex.value);
      break;
    case 8:
      _drawLettersAsOcto(ctx, spriteFrameIndex.value);
      break;
  }
  _applyColor(ctx);
  if ($props.type === WordType.PROPERTY) {
    _drawBlock(ctx, spriteFrameIndex.value);
  }
  if ($props.crossedOut) {
    _drawCross(ctx, spriteFrameIndex.value);
  }
}

function _clearCanvas(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  ctx.clearRect(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);
}
function _applyColor(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  ctx.fillStyle = $props.color!;
  ctx.fillRect(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);
  ctx.fillStyle = '#ffffff';
}

function _drawLetter(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  ctx.putImageData(letterSprites.value[0]!.frames[frameIndex]!.data, 6, 6);
}
function _drawLettersAsDuo(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 6);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 11, 6);
}
function _drawLettersAsTrio(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 6);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 8, 6);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 16, 6);
}
function _drawLettersAsQuad(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  if (letterSprites.value.length !== 4) return;
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 0);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 11, 0);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 12);
  ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 11, 12);
}
function _drawLettersAsQuint(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  if ($props.moreLettersOnTop) {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 0);
    ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 8, 0);
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 16, 0);
    ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 1, 12);
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 11, 12);
  } else {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 0);
    ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 11, 0);
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 12);
    ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 8, 12);
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 16, 12);
  }
}
function _drawLettersAsHexa(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 0);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 8, 0);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 16, 0);
  ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 0, 12);
  ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 8, 12);
  ctx.putImageData(letterSprites.value[5]!.frames[frameIndex]!.data, 16, 12);
}
function _drawLettersAsHepta(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  if ($props.moreLettersOnTop) {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 0);
    ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 6, 0);
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 12, 0);
    ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 18, 0);
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 12);
    ctx.putImageData(letterSprites.value[5]!.frames[frameIndex]!.data, 8, 12);
    ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(frameIndex)]!.data, 15, 12);
  } else {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 0);
    ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 8, 0);
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 15, 0);
    ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 0, 12);
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 6, 12);
    ctx.putImageData(letterSprites.value[5]!.frames[frameIndex]!.data, 12, 12);
    ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(frameIndex)]!.data, 18, 12);
  }
}
function _drawLettersAsOcto(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 0);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 6, 0);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 12, 0);
  ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 18, 0);
  ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 12);
  ctx.putImageData(letterSprites.value[5]!.frames[frameIndex]!.data, 6, 12);
  ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(frameIndex)]!.data, 12, 12);
  ctx.putImageData(letterSprites.value[7]!.frames[frameIndex]!.data, 18, 12);
}

function _drawEmpty(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  ctx.putImageData(emptySprite.value!.frames[frameIndex]!.data, 0, 0);
}

/**
 * Overrides the drawing by using current image data as a clip mask on the block sprite
 * @param ctx
 */
function _drawBlock(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  const wordImgData = ctx.getImageData(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);

  ctx.putImageData(blockSprite.value!.frames[frameIndex]!.data, 0, 0);
  ctx.fillStyle = $props.color!;
  ctx.fillRect(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);

  const blockImageData = ctx.getImageData(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);
  for (let i = 0; i < wordImgData.data.length; i += 4) {
    blockImageData.data[i + 3] = wordImgData.data[i + 3]! > 0 ? 0 : blockImageData.data[i + 3]!;
  }
  ctx.putImageData(blockImageData, 0, 0);
}

/**
 * Overrides the drawing by overlaying the cross sprite on the rest
 * @param ctx
 */
function _drawCross(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  const canvasData = ctx.getImageData(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);

  const crossFrameData = crossSprite.value!.frames[frameIndex]!.data;
  for (let i = 0; i < crossFrameData.data.length; i += 4) {
    canvasData.data[i + 0] = crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 0]! : canvasData.data[i + 0]!;
    canvasData.data[i + 1] = crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 1]! : canvasData.data[i + 1]!;
    canvasData.data[i + 2] = crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 2]! : canvasData.data[i + 2]!;
    canvasData.data[i + 3] = crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 3]! : canvasData.data[i + 3]!;
  }
  ctx.putImageData(canvasData, 0, 0);
}

// ----------------------------------------------------------------------------
// special mode functions (when a word corresponds to an object and object drawing is enabled)

function _drawObject(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frameIndex: number) {
  const canvasData = ctx.getImageData(0, 0, SPRITESHEET_CELL_SIZE, SPRITESHEET_CELL_SIZE);
  const objectFrameData = specialObjectSprite.value!.frames[frameIndex]!.data;
  let propsColorRGB: tinycolor.Instance | null = null
  for (let i = 0; i < objectFrameData.data.length; i += 4) {
    if (allComponentsEqualTo(objectFrameData.data[i+0]!, objectFrameData.data[i+1]!, objectFrameData.data[i+2]!, 221)) {
      propsColorRGB = tinycolor($props.color)
      propsColorRGB.lighten(30);
      canvasData.data[i+0] = propsColorRGB.toRgb().r
      canvasData.data[i+1] = propsColorRGB.toRgb().g
      canvasData.data[i+2] = propsColorRGB.toRgb().b
      canvasData.data[i+3] = objectFrameData.data[i+3]!
      continue;
    }
    if (allComponentsEqualTo(objectFrameData.data[i+0]!, objectFrameData.data[i+1]!, objectFrameData.data[i+2]!, 170)) {
      propsColorRGB = tinycolor($props.color)
      canvasData.data[i+0] = propsColorRGB.toRgb().r
      canvasData.data[i+1] = propsColorRGB.toRgb().g
      canvasData.data[i+2] = propsColorRGB.toRgb().b
      canvasData.data[i+3] = objectFrameData.data[i+3]!
      continue;
    }
    if (allComponentsEqualTo(objectFrameData.data[i+0]!, objectFrameData.data[i+1]!, objectFrameData.data[i+2]!, 85)) {
      propsColorRGB = tinycolor($props.color)
      propsColorRGB.darken(15);
      canvasData.data[i+0] = propsColorRGB.toRgb().r
      canvasData.data[i+1] = propsColorRGB.toRgb().g
      canvasData.data[i+2] = propsColorRGB.toRgb().b
      canvasData.data[i+3] = objectFrameData.data[i+3]!
      continue;
    }
    canvasData.data[i+0] = objectFrameData.data[i+0]!
    canvasData.data[i+1] = objectFrameData.data[i+1]!
    canvasData.data[i+2] = objectFrameData.data[i+2]!
    canvasData.data[i+3] = objectFrameData.data[i+3]!
  }
  ctx.putImageData(canvasData, 0, 0);
}

</script>

<style scoped lang="scss">
canvas {
  width: v-bind(width);
  height: v-bind(width);
  pointer-events: none;
}
</style>
