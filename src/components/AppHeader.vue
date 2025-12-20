<template>
  <header id="smtx-header">
    <DynamicSprite width="5rem" word="site" color="#8e44c7" type="noun" :more-letters-on-top="false" />
    <hr>
    <DynamicSprite width="5rem" word="make" :more-letters-on-top="false" />
    <hr>
    <DynamicSprite width="5rem" word="text" color="#e336a3" :more-letters-on-top="false" />
  </header>
</template>

<script setup lang="ts">
import DynamicSprite from './elements/DynamicSpriteElement.vue';
</script>

<style lang="scss">
#smtx-header {
  z-index: 5;
  padding: 1rem;
  background: transparent;
  border-bottom: 3px dashed white;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  hr {
    height: 2.5rem;
    width: 2px;
    border: 2px solid var(--smtx-primary);
  }
}
</style>
