<template>
  <section id="section-sprite-props">
    <input id="prop-word" v-model="spriteProps!.word" type="text" maxlength="8" style="text-transform: uppercase;">
  </section>
</template>

<script setup lang="ts">
import type { DynamicSpriteProps } from '@/types';

const spriteProps = defineModel<DynamicSpriteProps>()
</script>

<style lang="scss">
#section-sprite-props {
  padding: 1rem;

  border-bottom: 4px dashed white;
  border-right: 4px dashed white;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  input {
    width: 10rem;
    font-size: 1.25rem;
    font-weight: 600;
  }
}
</style>
