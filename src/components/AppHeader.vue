<script setup lang="ts">
import StaticSprite from './elements/StaticSpriteElement.vue';

</script>

<template>
  <header id="smtx-header">
    <StaticSprite width="4rem" sprite="icon-logo-site" />
    <hr />
    <StaticSprite width="4rem" sprite="icon-logo-make" />
    <hr />
    <StaticSprite width="4rem" sprite="icon-logo-text" />
  </header>
</template>

<style lang="scss">
#smtx-header {
  z-index: 5;
  padding: 1rem;
  background: transparent;
  border-bottom: 4px dashed white;

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

@media screen and (max-width: 767px) {
  #smtx-header {
    padding: 0.5rem;

    .sprite {
      width: 3rem;
      height: 3rem;
    }
  }
}
</style>
