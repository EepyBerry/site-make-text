<template>
  <canvas ref="spriteCanvas" width="24" height="24"></canvas>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import type { AnimatedSprite } from '@/core/models/animated-sprite.model';
import { getAnimatedSprite } from '@/core/spritesheet-cutter';
import { updateFrameIndex } from '@/core/spritesheet-utils';
import { ref, useTemplateRef, watch, type Ref } from 'vue';

const spriteCanvas = useTemplateRef("spriteCanvas")!
const letterSprites: Ref<AnimatedSprite[]> = ref([])
const spriteFrameIndex: Ref<number> = ref(0)

const $props = withDefaults(defineProps<{ word?: string, color?: string, showBlock?: boolean }>(), {
  word: 'TEXT', color: '#ffffff', showBlock: false
})
watch($props, () => reloadLetters())
watch(EventBus.spritesheetInitEvent, reloadLetters)
watch(EventBus.tickEvent, () => {
  updateFrameIndex(spriteFrameIndex)
  updateCanvas()
})

function reloadLetters() {
  letterSprites.value.splice(0)
  for (let i = 0; i < $props.word.length; i++) {
    const letter = $props.word.charAt(i)
    const letterAnimSprite = getAnimatedSprite("letter-"+letter.toLowerCase())
    if (!letterAnimSprite) throw new Error("Cannot find sprite for letter: "+letter)
    letterSprites.value.push(letterAnimSprite)
  }
}

function updateCanvas() {
  
}
</script>

<style scoped lang="scss">
canvas {
  width: 3rem;
  height: 3rem;
}
</style>
