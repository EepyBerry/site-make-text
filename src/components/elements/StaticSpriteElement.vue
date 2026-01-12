<template>
  <div ref="spriteImageRef" class="sprite" />
</template>
<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import { getAnimatedSprite, getSpritesheet, updateFrameIndex } from '@/core/helpers/spritesheet.helper';
import type { SpritesheetRegion } from '@/core/types';
import { onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { REM_SIZE, SPRITESHEET_CELL_SIZE } from '@/core/globals';

const spriteImageRef = useTemplateRef('spriteImageRef');
const spriteFrameRegions: Ref<SpritesheetRegion[]> = ref([]);
const spriteFrameIndex: Ref<number> = ref(0);

const $props = withDefaults(defineProps<{ sprite: string; width?: string }>(), { width: '2rem' });
onMounted(() => {
  if (!EventBus.tickEvent.value) return;
  setBackgroundSize();
  setBackgroundPosition();
});
watch(EventBus.spritesheetInitEvent, () => {
  setBackgroundSize();
  setBackgroundPosition();
});
watch(EventBus.tickEvent, () => {
  updateFrameIndex(spriteFrameIndex);
  setBackgroundPosition();
});

function setBackgroundSize() {
  spriteFrameRegions.value.push(...getAnimatedSprite($props.sprite)!.regions);
  const relativeBackgroundSize = computeMainSpritesheetBackgroundSize($props.width);
  spriteImageRef.value!.style.backgroundSize = `${relativeBackgroundSize[0]}px ${relativeBackgroundSize[1]}px`;
}
function setBackgroundPosition() {
  if (!spriteFrameRegions.value || !spriteFrameRegions.value[spriteFrameIndex.value]) return;
  const relativeBackgroundPosition = computeSpritesheetBackgroundPosition(
    spriteFrameRegions.value[spriteFrameIndex.value]!.x,
    spriteFrameRegions.value[spriteFrameIndex.value]!.y,
    $props.width,
  );
  spriteImageRef.value!.style.backgroundPosition = `-${relativeBackgroundPosition[0]}px -${relativeBackgroundPosition[1]}px`;
}

function computeMainSpritesheetBackgroundSize(elWidth: string): number[] {
  const mainSpritesheet = getSpritesheet('main')!
  const elWidthAsNumber: number = parseFloat(elWidth) * REM_SIZE;
  const backgroundSizeX = (mainSpritesheet.width * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  const backgroundSizeY = (mainSpritesheet.height * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  return [backgroundSizeX, backgroundSizeY];
}

function computeSpritesheetBackgroundPosition(frameX: number, frameY: number, elWidth: string): number[] {
  const elWidthAsNumber: number = parseFloat(elWidth) * REM_SIZE;
  const backgroundPositionX = (frameX * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  const backgroundPositionY = (frameY * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  return [backgroundPositionX, backgroundPositionY];
}

</script>

<style scoped lang="scss">
.sprite {
  aspect-ratio: 1 / 1;
  width: v-bind(width);
  height: v-bind(width);
  background-image: url('/src/assets/spritesheets/app-spritesheet.png');
  background-repeat: no-repeat;
}
</style>
