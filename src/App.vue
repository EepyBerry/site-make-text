<template>
  <AppHeader />
  <main>

  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import { EventBus } from './core/event-bus';
import { initSpritesheetCanvas } from './core/spritesheet-cutter';

// main tick loop to synchronize every sprite
onMounted(() => {
  initSpritesheetCanvas()
  setInterval(EventBus.sendTickEvent, 1000/3.0)
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
