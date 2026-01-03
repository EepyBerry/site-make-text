<template>
  <input
    type="range"
    step="1"
    :value="$model"
    @input="set($event)"
  />
</template>

<script setup lang="ts">
const $model = defineModel<number>();
function set(ev: Event) {
  $model.value = (ev.target as HTMLInputElement).valueAsNumber;
}
</script>

<style scoped lang="scss">
input[type=range] {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: 0;

  background: transparent;
  border: none;
  align-self: center;

  &::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 2px;
    background: var(--smtx-slider-track);
  }

  // thumb styles
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    margin-top: -0.5rem;
    z-index: 1;
    background: url('@/assets/spritesheet/slider-thumb.png');
    border-radius: 50%;
    height: 1.5rem;
    width: 1.5rem;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    z-index: 1;
    background: url('@/assets/spritesheet/slider-thumb.png');
    border-radius: 2px;
    border: none;
    width: 6px;
    cursor: pointer;
  }

  &:focus::-webkit-slider-thumb {
    outline: none;
    background: url('@/assets/spritesheet/slider-thumb-focus.png');
  }
  &:focus::-moz-range-thumb {
    outline: none;
    background: url('@/assets/spritesheet/slider-thumb-focus.png');
  }

}
</style>
