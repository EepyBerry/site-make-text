<template>
  <canvas ref="spriteCanvas" class="sprite animated" width="24" height="24"></canvas>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import type { AnimatedSprite } from '@/core/models/animated-sprite.model';
import { getAnimatedSprite } from '@/core/helpers/spritesheet.helper';
import { updateFrameIndex, updateRawFrameIndex } from '@/core/utils/spritesheet-utils';
import { onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { WordType, type DynamicSpriteProps } from '@/types';

const spriteCanvas = useTemplateRef('spriteCanvas')!;
const emptySprite: Ref<AnimatedSprite | null> = ref(null);
const blockSprite: Ref<AnimatedSprite | null> = ref(null);
const crossSprite: Ref<AnimatedSprite | null> = ref(null);
const letterSprites: Ref<AnimatedSprite[]> = ref([]);
const spriteFrameIndex: Ref<number> = ref(0);

const $props = withDefaults(defineProps<DynamicSpriteProps>(), {
  width: '2rem',
  word: 'TEXT',
  color: '#ffffff',
  type: WordType.NOUN,
  moreLettersOnTop: true,
  crossedOut: false,
});

onMounted(() => {
  if (!EventBus.spritesheetInitEvent.value) return;
  _loadEmptySprite();
  _loadBlockSprite();
  _loadCrossSprite();
  _reloadLetterSprites();
  _updateCanvas(spriteCanvas.value!);
});
watch($props, () => {
  _reloadLetterSprites();
  _updateCanvas(spriteCanvas.value!);
});
watch(EventBus.spritesheetInitEvent, () => {
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

function extractFrames(scale: number = 2): ImageData[] {
  const scaledImageSize: number = 24 * scale;

  const rawCanvas: OffscreenCanvas = new OffscreenCanvas(24, 24);
  const scaleCanvas: OffscreenCanvas = new OffscreenCanvas(scaledImageSize, scaledImageSize);
  const rawCtx = rawCanvas.getContext('2d', { willReadFrequently: true, alpha: true });
  const scaleCtx = scaleCanvas.getContext('2d', { willReadFrequently: true, alpha: true });
  if (!rawCtx || !scaleCtx)
    throw new Error('Cannot extract frames: context was not properly initialized');

  // prepare raw canvas
  rawCtx.globalCompositeOperation = 'source-in';

  // prepare scaled-up canvas
  _clearCanvas(scaleCtx);
  scaleCtx.scale(scale, scale);
  scaleCtx.globalCompositeOperation = 'source-over';
  scaleCtx.imageSmoothingEnabled = false;

  // skip empty words
  if (!letterSprites.value || letterSprites.value.length === 0) {
    return [];
  }

  // iterate on frames and draw them one by one on canvas first, and then as a gif frame
  const frames: ImageData[] = [];
  for (let i = 0; i < 3; i++) {
    _clearCanvas(rawCtx);
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
  return frames;
}

// ----------------------------------------------------------------------------
// internal functions

function _loadEmptySprite() {
  const emptyAnimSprite = getAnimatedSprite('empty');
  if (!emptyAnimSprite) throw new Error('Cannot find sprite for icon-empty');
  emptySprite.value = emptyAnimSprite;
}
function _loadBlockSprite() {
  const blockAnimSprite = getAnimatedSprite('block');
  if (!blockAnimSprite) throw new Error('Cannot find sprite for icon-block');
  blockSprite.value = blockAnimSprite;
}
function _loadCrossSprite() {
  const crossAnimSprite = getAnimatedSprite('cross');
  if (!crossAnimSprite) throw new Error('Cannot find sprite for icon-empty');
  crossSprite.value = crossAnimSprite;
}
function _reloadLetterSprites() {
  letterSprites.value.splice(0);
  for (let i = 0; i < $props.word.length; i++) {
    const letter = $props.word.charAt(i);

    // check if we must use small letters; special case for 5-letter words
    const useSmallLetters: boolean =
      $props.word.length === 5
        ? $props.moreLettersOnTop
          ? i <= 2
          : i >= 2
        : [3, 6, 7].includes($props.word.length);

    // check if we must use tiny letters; special case for 7-letter words
    const useTinyLetters: boolean =
      $props.word.length === 7
        ? $props.moreLettersOnTop
          ? i <= 3
          : i >= 3
        : [7, 8].includes($props.word.length);

    // get each letter's AnimatedSprite
    const letterAnimSprite = getAnimatedSprite(
      `letter-${letter.toLowerCase()}${useTinyLetters ? '-tiny' : useSmallLetters ? '-small' : ''}`,
    );
    if (!letterAnimSprite) continue;
    letterSprites.value.push(letterAnimSprite!);
  }
}

function _updateCanvas(canvas: HTMLCanvasElement | OffscreenCanvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })! as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!ctx) return;
  _clearCanvas(ctx);
  ctx.globalCompositeOperation = 'source-in';

  if (!letterSprites.value || letterSprites.value.length === 0) {
    _drawEmpty(ctx, spriteFrameIndex.value);
    return;
  }

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
  ctx.clearRect(0, 0, 24, 24);
}
function _applyColor(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  ctx.fillStyle = $props.color;
  ctx.fillRect(0, 0, 24, 24);
  ctx.fillStyle = '#ffffff';
}

function _drawLetter(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  ctx.putImageData(letterSprites.value[0]!.frames[frameIndex]!.data, 6, 6);
}
function _drawLettersAsDuo(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 6);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 11, 6);
}
function _drawLettersAsTrio(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 6);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 8, 6);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 16, 6);
}
function _drawLettersAsQuad(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  if (letterSprites.value.length !== 4) return;
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 0);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 11, 0);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 1, 12);
  ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 11, 12);
}
function _drawLettersAsQuint(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
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
function _drawLettersAsHexa(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 0);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 8, 0);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 16, 0);
  ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 0, 12);
  ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 8, 12);
  ctx.putImageData(letterSprites.value[5]!.frames[frameIndex]!.data, 16, 12);
}
function _drawLettersAsHepta(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
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
function _drawLettersAsOcto(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 0);
  ctx.putImageData(letterSprites.value[1]!.frames[frameIndex]!.data, 6, 0);
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(frameIndex)]!.data, 12, 0);
  ctx.putImageData(letterSprites.value[3]!.frames[frameIndex]!.data, 18, 0);
  ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(frameIndex)]!.data, 0, 12);
  ctx.putImageData(letterSprites.value[5]!.frames[frameIndex]!.data, 6, 12);
  ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(frameIndex)]!.data, 12, 12);
  ctx.putImageData(letterSprites.value[7]!.frames[frameIndex]!.data, 18, 12);
}

function _drawEmpty(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  ctx.putImageData(emptySprite.value!.frames[frameIndex]!.data, 0, 0);
}

/**
 * Overrides the drawing by using current image data as a clip mask on the block sprite
 * @param ctx
 */
function _drawBlock(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  const wordImgData = ctx.getImageData(0, 0, 24, 24);

  ctx.putImageData(blockSprite.value!.frames[frameIndex]!.data, 0, 0);
  ctx.fillStyle = $props.color;
  ctx.fillRect(0, 0, 24, 24);

  const blockImageData = ctx.getImageData(0, 0, 24, 24);
  for (let i = 0; i < wordImgData.data.length; i += 4) {
    blockImageData.data[i + 3] = wordImgData.data[i + 3]! > 0 ? 0 : blockImageData.data[i + 3]!;
  }
  ctx.putImageData(blockImageData, 0, 0);
}

/**
 * Overrides the drawing by overlaying the cross sprite on the rest
 * @param ctx
 */
function _drawCross(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frameIndex: number,
) {
  const wordImgData = ctx.getImageData(0, 0, 24, 24);

  const crossFrameData = crossSprite.value!.frames[frameIndex]!.data;
  for (let i = 0; i < crossFrameData.data.length; i += 4) {
    wordImgData.data[i + 0] =
      crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 0]! : wordImgData.data[i + 0]!;
    wordImgData.data[i + 1] =
      crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 1]! : wordImgData.data[i + 1]!;
    wordImgData.data[i + 2] =
      crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 2]! : wordImgData.data[i + 2]!;
    wordImgData.data[i + 3] =
      crossFrameData.data[i + 3]! > 0 ? crossFrameData.data[i + 3]! : wordImgData.data[i + 3]!;
  }
  ctx.putImageData(wordImgData, 0, 0);
}
</script>

<style scoped lang="scss">
canvas {
  width: v-bind(width);
  height: v-bind(width);
}
</style>
