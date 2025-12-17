<template>
  <img ref="sprite" class="sprite github" width="24" height="24" src="">
</template>

<script setup lang="ts">
import { cutSpritesheetSprite } from '@/scripts/spritesheet-cutter';
import { onMounted, ref, useTemplateRef, type Ref } from 'vue';

const sprite: Ref<HTMLImageElement|null> = useTemplateRef("sprite")
const spriteFrames: Ref<string[]> = ref([])
onMounted(() => {
  const spriteFrameData = cutSpritesheetSprite("sprite-github")
  spriteFrames.value.push(...spriteFrameData.map(fd => btoa(String.fromCharCode(...fd))))
  console.log(spriteFrameData)
})
</script>
