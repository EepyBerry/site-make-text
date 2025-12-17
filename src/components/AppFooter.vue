<script setup lang="ts">
import GithubSprite from './sprites/GithubSprite.vue';

</script>

<template>
  <footer id="app-footer">
    <div>
      <p>a smol web-toy by EepyBerry :3</p>
      <p>not affiliated with <a href="https://hempuli.com/baba/" target="_blank" rel="noreferrer noopener">Baba Is You</a> or its creators</p>
    </div>
    <GithubSprite />
  </footer>
</template>

<style lang="scss">
#app-footer {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  z-index: 5;

  background: transparent;
}
</style>
