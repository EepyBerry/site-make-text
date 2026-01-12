<template>
  <button class="button-file-input" @click="fileInputRef!.click()" :title="internalTitle" :aria-label="internalAriaLabel">
    <span v-if="fileName">{{ fileName }}</span>
    <span v-else><slot></slot></span>
  </button>
  <input
    ref="fileInputRef"
    :pid="pid"
    type="file"
    :accept="accept"
    @change="handleFile"
  />
</template>
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

const fileName = ref('')
const fileInputRef = useTemplateRef('fileInputRef')
defineProps<{ pid: string, accept: string, internalTitle?: string, internalAriaLabel?: string }>()
const $emit = defineEmits(['change'])

function handleFile(event: Event) {
  const tgt: HTMLInputElement = event.target as HTMLInputElement
  if (tgt.files!.length === 0) return;
  fileName.value = tgt.files![0]!.name;
  $emit('change', tgt.files![0]!)
}
</script>

<style lang="scss">
input[type=file] {
  display: none;
}
button.button-file-input {
  height: 100%;
  padding: 0.25rem 0.5rem;
  color: inherit;
  border: 2px dashed var(--smtx-button);
  border-radius: 2px;

  display: flex;
  align-items: center;
  justify-content: center;

  span {
    width: min-content;
    max-width: 24ch;
  }

  &:hover {
    border: 2px dashed var(--smtx-button-hover);
  }
  &:active {
    border: 2px dashed var(--smtx-button-active);
  }
}
</style>
