<template>
  <div ref="spriteImageRef" class="sprite" />
</template>
<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import { getAnimatedSprite } from '@/core/spritesheet-cutter';
import { computeSpritesheetBackgroundPosition, computeSpritesheetBackgroundSize, updateFrameIndex } from '@/core/spritesheet-utils';
import type { SpritesheetRegion } from '@/types';
import { ref, useTemplateRef, watch, type Ref } from 'vue';

const spriteImageRef = useTemplateRef("spriteImageRef")
const spriteFrameRegions: Ref<SpritesheetRegion[]> = ref([])
const spriteFrameIndex: Ref<number> = ref(0)

const $props = withDefaults(defineProps<{ sprite: string, width?: string }>(), { width: '2rem' })
watch(EventBus.spritesheetInitEvent, () => {
  setBackgroundSize()
  setBackgroundPosition()
})
watch(EventBus.tickEvent, () => {
  updateFrameIndex(spriteFrameIndex)
  setBackgroundPosition()
})

function setBackgroundSize() {
  spriteFrameRegions.value.push(...getAnimatedSprite($props.sprite)!.regions)
  const relativeBackgroundSize = computeSpritesheetBackgroundSize($props.width)
  spriteImageRef.value!.style.backgroundSize = `${relativeBackgroundSize[0]}px ${relativeBackgroundSize[1]}px`
}
function setBackgroundPosition() {
  if (!spriteFrameRegions.value || !spriteFrameRegions.value[spriteFrameIndex.value]) return;
  const relativeBackgroundPosition = computeSpritesheetBackgroundPosition(
    spriteFrameRegions.value[spriteFrameIndex.value]!.x,
    spriteFrameRegions.value[spriteFrameIndex.value]!.y,
    $props.width)
  spriteImageRef.value!.style.backgroundPosition = `-${relativeBackgroundPosition[0]}px -${relativeBackgroundPosition[1]}px`
}
</script>

<style scoped lang="scss">
.sprite {
  aspect-ratio: 1 / 1;
  width: v-bind(width);
  height: v-bind(width);
  background-image: url("/src/assets/spritesheet/app-spritesheet.png");
  background-repeat: no-repeat;
}
</style>
