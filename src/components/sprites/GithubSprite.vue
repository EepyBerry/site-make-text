<template>
  <img id="sprite-github" :src="getCurrentFrameURL()">
</template>
<script setup lang="ts">
import { EventBus } from '@/core/event-bus';
import { getAnimatedSprite } from '@/core/spritesheet-cutter';
import { ref, watch, type Ref } from 'vue';

const spriteFrameUrls: Ref<string[]> = ref([])
const spriteFrameIndex: Ref<number> = ref(0)

withDefaults(defineProps<{ width: string }>(), { width: '2rem' })
watch(EventBus.spritesheetInitEvent, e => {
  if (!e) return
  spriteFrameUrls.value.push(...getAnimatedSprite("sprite-github")!.urls)
})
watch(EventBus.tickEvent, () => {
  spriteFrameIndex.value++
  if (spriteFrameIndex.value === 3) spriteFrameIndex.value = 0
})

function getCurrentFrameURL(): string {
  if (spriteFrameIndex.value < 0 || spriteFrameIndex.value > 2 || spriteFrameUrls.value.length === 0) return '';
  return spriteFrameUrls.value[spriteFrameIndex.value]!
}
</script>

<style lang="scss">
#sprite-github {
  aspect-ratio: 1 / 1;
  width: v-bind(width)
}
</style>
