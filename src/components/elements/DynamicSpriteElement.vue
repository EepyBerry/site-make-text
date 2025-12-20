<template>
  <canvas ref="spriteCanvas" class="sprite animated" width="24" height="24"></canvas>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import type { AnimatedSprite } from '@/core/models/animated-sprite.model';
import { getAnimatedSprite } from '@/core/helpers/spritesheet.helper';
import { updateFrameIndex, updateRawFrameIndex } from '@/core/utils/spritesheet-utils';
import { ref, useTemplateRef, watch, type Ref } from 'vue';
import { WordType, type DynamicSpriteProps } from '@/types';

const spriteCanvas = useTemplateRef("spriteCanvas")!
const blockSprite: Ref<AnimatedSprite|null> = ref(null)
const letterSprites: Ref<AnimatedSprite[]> = ref([])
const spriteFrameIndex: Ref<number> = ref(0)

const $props = withDefaults(defineProps<DynamicSpriteProps>(), {
  width: '2rem',
  word: 'TEXT',
  color: '#ffffff',
  moreLettersOnTop: true,
  type: WordType.NOUN,
})

watch($props, () => {
   reloadLetterSprites()
   updateCanvas()
})
watch(EventBus.spritesheetInitEvent, () => {
  loadBlockSprite()
  reloadLetterSprites()
  updateCanvas()
})
watch(EventBus.tickEvent, () => {
  updateFrameIndex(spriteFrameIndex)
  updateCanvas()
})

function loadBlockSprite() {
  const blockAnimSprite = getAnimatedSprite('block')
  if (!blockAnimSprite) throw new Error("Cannot find sprite for block")
  blockSprite.value = blockAnimSprite
}
function reloadLetterSprites() {
  letterSprites.value.splice(0)
  for (let i = 0; i < $props.word.length; i++) {
    const letter = $props.word.charAt(i)

    // check if we must use small letters; special case for 5-letter words
    const useSmallLetters: boolean = $props.word.length === 5
      ? ($props.moreLettersOnTop ? i <= 2 : i >= 2)
      : [3, 6].includes($props.word.length)

    // get each letter's AnimatedSprite
    const letterAnimSprite = getAnimatedSprite(`letter-${letter.toLowerCase()}${useSmallLetters ? '-small' : ''}`)
    if (!letterAnimSprite) throw new Error("Cannot find sprite for letter: "+letter)
    letterSprites.value.push(letterAnimSprite!)
  }
  console.log(letterSprites.value.map(v => v.key))
}

function updateCanvas() {
  const ctx = spriteCanvas.value?.getContext('2d', { willReadFrequently: true })
  if (!ctx) return
  clearCanvas(ctx)

  if (!letterSprites.value || letterSprites.value.length === 0) return
  switch (letterSprites.value.length) {
    case 1: drawLetter(ctx); break;
    case 2: drawLettersAsDuo(ctx); break;
    case 3: drawLettersAsTrio(ctx); break;
    case 4: drawLettersAsQuad(ctx); break;
    case 5: drawLettersAsQuint(ctx); break;
    case 6: drawLettersAsHexa(ctx); break;
    case 6: drawLettersAsHepta(ctx); break;
    case 6: drawLettersAsOcto(ctx); break;
  }
  applyColor(ctx)

  if ($props.type === WordType.PROPERTY) {
    drawBlock(ctx)
  }
}

function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 24, 24)
  ctx.globalCompositeOperation = "source-in"
}
function applyColor(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = $props.color
  ctx.fillRect(0, 0, 24, 24)
  ctx.fillStyle = "#ffffff"
}

function drawLetter(ctx: CanvasRenderingContext2D) {
  ctx.putImageData(letterSprites.value[0]!.frames[spriteFrameIndex.value]!.data, 6, 6)
}
function drawLettersAsDuo(ctx: CanvasRenderingContext2D) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 1, 6)
  ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 11, 6)
}
function drawLettersAsTrio(ctx: CanvasRenderingContext2D) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 6)
  ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 8, 6)
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 16, 6)
}
function drawLettersAsQuad(ctx: CanvasRenderingContext2D) {
  if (letterSprites.value.length !== 4) return
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 1, 0)
  ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 11, 0)
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 1, 12)
  ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 11, 12)
}
function drawLettersAsQuint(ctx: CanvasRenderingContext2D) {
  if ($props.moreLettersOnTop) {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 0)
    ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 8, 0)
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 16, 0)
    ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 1, 12)
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 11, 12)
  } else {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 1, 0)
    ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 11, 0)
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 12)
    ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 8, 12)
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 16, 12)
  }
}
function drawLettersAsHexa(ctx: CanvasRenderingContext2D) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 0)
  ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 8, 0)
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 16, 0)
  ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 0, 12)
  ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 8, 12)
  ctx.putImageData(letterSprites.value[5]!.frames[spriteFrameIndex.value]!.data, 16, 12)
}
function drawLettersAsHepta(ctx: CanvasRenderingContext2D) {
  if ($props.moreLettersOnTop) {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 0)
    ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 6, 0)
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 12, 0)
    ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 18, 0)
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 1, 12)
    ctx.putImageData(letterSprites.value[5]!.frames[spriteFrameIndex.value]!.data, 8, 12)
    ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 15, 12)
  } else {
    ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 1, 0)
    ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 8, 0)
    ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 15, 0)
    ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 0, 12)
    ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 6, 12)
    ctx.putImageData(letterSprites.value[5]!.frames[spriteFrameIndex.value]!.data, 12, 12)
    ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 18, 12)
  }
}
function drawLettersAsOcto(ctx: CanvasRenderingContext2D) {
  ctx.putImageData(letterSprites.value[0]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 0)
  ctx.putImageData(letterSprites.value[1]!.frames[spriteFrameIndex.value]!.data, 6, 0)
  ctx.putImageData(letterSprites.value[2]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 12, 0)
  ctx.putImageData(letterSprites.value[3]!.frames[spriteFrameIndex.value]!.data, 18, 0)
  ctx.putImageData(letterSprites.value[4]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 0, 12)
  ctx.putImageData(letterSprites.value[5]!.frames[spriteFrameIndex.value]!.data, 6, 12)
  ctx.putImageData(letterSprites.value[6]!.frames[updateRawFrameIndex(spriteFrameIndex.value)]!.data, 12, 12)
  ctx.putImageData(letterSprites.value[7]!.frames[spriteFrameIndex.value]!.data, 18, 12)
}

/**
 * Overrides the drawing by using current image data as a clip mask on the block sprite
 * @param ctx
 */
function drawBlock(ctx: CanvasRenderingContext2D) {
  const letterImgData = ctx.getImageData(0, 0, 24, 24)

  ctx.putImageData(blockSprite.value!.frames[spriteFrameIndex.value]!.data, 0, 0)
  ctx.fillStyle = $props.color
  ctx.fillRect(0, 0, 24, 24)

  const blockImageData = ctx.getImageData(0, 0, 24, 24)
  for (let i = 0; i < letterImgData.data.length; i += 4) {
    blockImageData.data[i+3] = (letterImgData.data[i+3]! > 0 ? 0 : blockImageData.data[i+3]!)
  }
  ctx.putImageData(blockImageData, 0, 0)
}
</script>

<style scoped lang="scss">
canvas {
  width: v-bind(width);
  height: v-bind(width);
}
</style>
