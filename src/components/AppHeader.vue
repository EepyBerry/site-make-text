<script setup lang="ts">
import StaticSprite from './elements/StaticSpriteElement.vue';

</script>

<template>
  <header id="smtx-header">
    <div id="logo-container">
      <StaticSprite width="4rem" sprite="logo-site" />
      <hr />
      <StaticSprite width="4rem" sprite="logo-make" />
      <hr />
      <StaticSprite width="4rem" sprite="logo-text" />
    </div>
  </header>
</template>

<style lang="scss">
#smtx-header {
  z-index: 5;
  padding: 1rem;
  background: transparent;
  border-bottom: 4px dashed white;
}
#logo-container {
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
    padding: 0;

    #logo-container {
      transform: scale(0.75);
    }
  }
}
</style>
