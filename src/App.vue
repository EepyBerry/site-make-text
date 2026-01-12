<template>
  <AppHeader />
  <AppContent />
  <AppFooter />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import AppContent from './components/AppContent.vue';
import { EventBus } from './core/event-bus';
import { initAppSpritesheet, loadDefaultObjectSpritesheet } from './core/helpers/spritesheet.helper';
import { FRAME_DURATION_MS } from './core/globals';

// main tick loop to synchronize every sprite
onMounted(async () => {
  await initAppSpritesheet();
  await loadDefaultObjectSpritesheet();
  EventBus.sendSpritesheetInitEvent();
  setInterval(EventBus.sendTickEvent, FRAME_DURATION_MS);
});
</script>
