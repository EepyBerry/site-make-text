<template>
  <input
    :id="`${pid}-${id}`"
    ref="htmlRadio"
    v-model="optionModel"
    type="radio"
    :value="value"
    :checked="value === optionModel"
  />

  <button
    type="button"
    class="radio-option"
    :class="{ selected: value === optionModel }"
    @click="select()"
    :aria-label="internalAriaLabel"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { WordType } from '@/types';
import { useTemplateRef } from 'vue';

defineProps<{
  pid: string;
  id: string;
  value: string | number | boolean | object;
  internalAriaLabel?: string;
}>();
const optionModel = defineModel<string | number | boolean | WordType>();
const htmlRadio = useTemplateRef('htmlRadio');

function select() {
  (htmlRadio.value as HTMLInputElement).click();
}
</script>

<style scoped lang="scss">
.radio-option {
  flex: 1;
  height: 100%;
  padding: 0 0.75rem;
  background: var(--smtx-radio);
  border: none;
  color: var(--smtx-text);
  font-weight: 600;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--smtx-primary);
  }
  &:active {
    background: var(--smtx-radio);
  }
  &.selected {
    background: var(--smtx-accent);
    cursor: default;
  }
}

input[type='radio'] {
  display: none;
}
</style>
