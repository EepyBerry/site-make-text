<template>
  <ColorPicker
    class="picker"
    alpha-channel="hide"
    default-format="hex"
  >
    <template #hue-range-input-label>
      <span class="a11y--visually-hidden"></span>
    </template>
    <template #alpha-range-input-label>
      <span class="a11y--visually-hidden"></span>
    </template>
  </ColorPicker>
</template>

<script setup lang="ts">
import type { ColorPicker } from 'vue-accessible-color-picker';
</script>
