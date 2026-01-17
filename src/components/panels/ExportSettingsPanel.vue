<template>
  <section id="export-settings">
    <StaticSprite width="2.5rem" height="2.5rem" sprite="export-scale" />
    <div class="setting-wrapper">
      <SliderElement
        id="setting-scale"
        v-model="exportSettings.scale"
        min="1"
        max="5"
        aria-label="Export scale (1-4, increments of 24px)"
        title="Export scale (1-4, increments of 24px)"
      />
      <p>{{ exportSettings.scale }}</p>
    </div>

    <StaticSprite width="2.5rem" height="2.5rem" sprite="export-crop" />
    <RadioElement>
      <RadioOptionElement
        v-model="exportSettings.cropGrid"
        pid="setting-crop"
        id="nocrop"
        :value="false"
        internal-aria-label="Export grid as-is"
        internal-title="Export grid as-is"
      >
        <StaticSprite width="2.5rem" height="2.5rem" sprite="off" />
      </RadioOptionElement>
      <RadioOptionElement
        v-model="exportSettings.cropGrid"
        pid="setting-crop"
        id="docrop"
        :value="true"
        internal-aria-label="Crop grid to remove excess space"
        internal-title="Crop grid to remove excess space"
      >
        <StaticSprite width="2.5rem" height="2.5rem" sprite="on" />
      </RadioOptionElement>
    </RadioElement>

    <StaticSprite width="2.5rem" height="2.5rem" sprite="export-type" />
    <RadioElement>
      <RadioOptionElement
        v-model="exportSettings.combinedOnly"
        pid="setting-type"
        id="all"
        :value="false"
        internal-aria-label="Export all words separately"
        internal-title="Export all words separately"
      >
        <DynamicSprite word="separate" width="2.5rem" :more-letters-on-top="false" />
      </RadioOptionElement>
      <RadioOptionElement
        v-model="exportSettings.combinedOnly"
        pid="setting-type"
        id="combined"
        :value="true"
        internal-aria-label="Export combined image only"
        internal-title="Export combined image only"
      >
        <DynamicSprite word="combined" width="2.5rem" :more-letters-on-top="false" />
      </RadioOptionElement>
    </RadioElement>

    <StaticSprite width="2.5rem" height="2.5rem" sprite="export-format" />
    <RadioElement>
      <RadioOptionElement
        v-model="exportSettings.format"
        pid="setting-format"
        id="gif"
        value="gif"
        internal-aria-label="Set word as a noun"
        internal-title="Export words as .gif"
      >
        <StaticSprite width="2.5rem" height="2.5rem" sprite="format-gif" />
      </RadioOptionElement>
      <RadioOptionElement
        v-model="exportSettings.format"
        pid="setting-format"
        id="webp"
        value="webp"
        internal-aria-label="Set word as a property (adds background)"
        internal-title="Export words as .webp"
      >
        <StaticSprite width="2.5rem" height="2.5rem" sprite="format-webp" />
      </RadioOptionElement>
    </RadioElement>

    <button
      type="button"
      id="button-export"
      class="primary animated"
      @click="$emit('export', exportSettings)"
      aria-label="Export words"
      title="Export words"
    >
      <StaticSprite width="2.5rem" height="2.5rem" sprite="export-exp" />
      <StaticSprite width="2.5rem" height="2.5rem" sprite="export-ort" />
    </button>
  </section>
</template>

<script setup lang="ts">
import RadioElement from '@/components/elements/RadioElement.vue';
import RadioOptionElement from '@/components/elements/RadioOptionElement.vue';
import type { ExportSettingsOptions } from '@/core/types';
import { ref, type Ref } from 'vue';
import SliderElement from '../elements/SliderElement.vue';

const exportSettings: Ref<ExportSettingsOptions> = ref({
  scale: 3,
  cropGrid: true,
  format: 'webp',
  combinedOnly: true,
});

defineEmits(['export']);
</script>

<style lang="scss">
#export-settings {
  width: 100%;
  padding: 0.5rem;
  background: var(--smtx-panel);
  border-radius: 8px;
  border-bottom-right-radius: 0;

  display: grid;
  grid-template-columns: 3rem 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 1rem 0;

  input {
    width: 100%;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 2px;
  }
  button#button-export {
    grid-column: 1 / span 2;
    color: var(--smtx-text);

    font-size: 1.125rem;
    font-weight: 600;

    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
  }
}
.setting-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  p {
    align-self: center;
    min-width: 3ch;
    width: 3ch;
    padding-left: 8px;

    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
  }
}
</style>
