<template>
  <section id="section-export-settings">
    <StaticSprite width="2.5rem" sprite="icon-export-scale" />
    <input
      id="setting-scale"
      v-model="exportSettings.scale"
      type="number"
      min="1"
      max="10"
      style="text-transform: uppercase"
      aria-label="Exported image scale (1 = 24px*24px)"
      title="Exported image scale (1 = 24px*24px)"
    />

    <StaticSprite width="2.5rem" sprite="icon-export-type" />
    <RadioElement>
      <RadioOptionElement
        v-model="exportSettings.combinedOnly"
        pid="setting-type"
        id="all"
        :value="false"
        internal-aria-label="Export all words separately (with combined image)"
        internal-title="Export all words separately (with combined image)"
      >
        <DynamicSprite word="separate" width="2.5rem" :more-letters-on-top="false" />
      </RadioOptionElement>
      <RadioOptionElement
        v-model="exportSettings.combinedOnly"
        pid="setting-format"
        id="combined"
        :value="true"
        internal-aria-label="Export combined image only"
        internal-title="Export combined image only"
      >
        <DynamicSprite word="combined" width="2.5rem" :more-letters-on-top="false" />
      </RadioOptionElement>
    </RadioElement>

    <StaticSprite width="2.5rem" sprite="icon-export-format" />
    <RadioElement>
      <RadioOptionElement
        v-model="exportSettings.format"
        pid="setting-format"
        id="gif"
        value="gif"
        internal-aria-label="Set word as a noun"
        internal-title="Export words as .gif"
      >
        <StaticSprite width="2.5rem" sprite="icon-format-gif" />
      </RadioOptionElement>
      <RadioOptionElement
        v-model="exportSettings.format"
        pid="setting-format"
        id="webp"
        value="webp"
        internal-aria-label="Set word as a property (adds background)"
        internal-title="Export words as .webp"
      >
        <StaticSprite width="2.5rem" sprite="icon-format-webp" />
      </RadioOptionElement>
    </RadioElement>

    <button type="button" id="button-export" class="primary animated" @click="$emit('export', exportSettings)"
      aria-label="Export words"
      title="Export words"
    >
      <StaticSprite width="2.5rem" sprite="icon-export-exp" />
      <StaticSprite width="2.5rem" sprite="icon-export-ort" />
    </button>
  </section>
</template>

<script setup lang="ts">
import RadioElement from '@/components/elements/RadioElement.vue';
import RadioOptionElement from '@/components/elements/RadioOptionElement.vue';
import type { ExportSettingsOptions } from '@/types';
import { ref, type Ref } from 'vue';

const exportSettings: Ref<ExportSettingsOptions> = ref({ scale: 3, format: 'webp', combinedOnly: false })

defineEmits(['export'])
</script>

<style lang="scss">
#section-export-settings {
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
</style>
