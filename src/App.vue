<template>
  <main>

  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppFooter from './components/AppFooter.vue';
import { EventBus } from './scripts/event-bus';
import { initSpritesheetCanvas } from './scripts/spritesheet-cutter';

// main tick loop to synchronize every sprite
onMounted(() => {
  initSpritesheetCanvas()
  setInterval(EventBus.sendTickEvent, 333)
})
</script>

<style lang="scss">
main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}
</style>
