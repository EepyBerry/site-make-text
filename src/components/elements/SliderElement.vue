<template>
  <input type="range" step="1" :value="$model" @input="set($event)" />
</template>

<script setup lang="ts">
const $model = defineModel<number>();
function set(ev: Event) {
  $model.value = (ev.target as HTMLInputElement).valueAsNumber;
}
</script>

<style scoped lang="scss">
input[type='range'] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0;

  background: transparent;
  border: none;
  align-self: center;

  // webkit styles (chrome)
  &::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: none;
    border-radius: 2px;
    height: 8px;
    background-color: transparent;
    background: var(--smtx-slider-track);
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin-top: -0.5rem;
    z-index: 1;
    background-color: transparent;
    background: url('@/assets/spritesheets/slider-thumb.png');
    border: none;
    height: 1.5rem;
    width: 1.5rem;
    cursor: pointer;
  }

  // moz styles (firefox)
  &::-moz-range-track {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: none;
    border-radius: 2px;
    height: 8px;
    background-color: transparent;
    background: var(--smtx-slider-track);
  }
  &::-moz-range-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin-top: -0.5rem;
    z-index: 1;
    background-color: transparent;
    background: url('@/assets/spritesheets/slider-thumb.png');
    border: none;
    height: 1.5rem;
    width: 1.5rem;
    cursor: pointer;
  }

  // ms styles (ie, edge)
  &::-ms-track {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: none;
    border-radius: 2px;
    height: 8px;
    background-color: transparent;
    background: var(--smtx-slider-track);
  }
  &::-ms-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin-top: -0.5rem;
    z-index: 1;
    background-color: transparent;
    background: url('@/assets/spritesheets/slider-thumb.png');
    border: none;
    height: 1.5rem;
    width: 1.5rem;
    cursor: pointer;
  }

  &:focus::-webkit-slider-thumb {
    outline: none;
    background: url('@/assets/spritesheets/slider-thumb-focus.png');
  }

  &:focus::-moz-range-thumb {
    outline: none;
    background: url('@/assets/spritesheets/slider-thumb-focus.png');
  }

  &:focus::-ms-thumb {
    outline: none;
    background: url('@/assets/spritesheets/slider-thumb-focus.png');
  }
}
</style>
