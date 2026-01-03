<template>
  <section id="section-grid-settings">
    <StaticSprite width="2.5rem" sprite="icon-width" />
    <SliderElement
      id="setting-width"
      v-model="gridSettings.x"
      min="1"
      max="11"
      aria-label="Grid width in cells"
      title="Grid width in cells"
      @input="$emit('change', gridSettings)"
    />

    <StaticSprite width="2.5rem" sprite="icon-height" />
    <SliderElement
      id="setting-height"
      v-model="gridSettings.y"
      min="1"
      max="11"
      aria-label="Grid width in cells"
      title="Grid width in cells"
      @input="$emit('change', gridSettings)"
    />
  </section>
</template>
<script setup lang="ts">
import type { Vector2 } from '@/types';
import { ref, type Ref } from 'vue';
import SliderElement from '../elements/SliderElement.vue';

const gridSettings: Ref<Vector2> = ref({
  x: 3,
  y: 3
});
defineEmits(['change']);
</script>
<style lang="scss">

#section-grid-settings {
  width: 100%;
  padding: 0.5rem;
  background: var(--smtx-panel);
  border-radius: 8px;
  border-top-left-radius: 0;

  display: grid;
  grid-template-columns: 3rem 1fr;
  grid-template-rows: repeat(2, auto);
  gap: 1rem 0;

  input {
    width: 100%;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 2px;
  }
}
</style>
