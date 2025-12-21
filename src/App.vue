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
import { initSpritesheetCanvas } from './core/helpers/spritesheet.helper';

// main tick loop to synchronize every sprite
onMounted(() => {
  initSpritesheetCanvas()
  setInterval(EventBus.sendTickEvent, 225)
})
</script>
