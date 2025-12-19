<template>
  <header>
    <AppTitle />
  </header>
</template>

<script setup lang="ts">
import AppTitle from './AppTitle.vue';
</script>

<style lang="scss">
#app-header {
  z-index: 5;
  padding: 1rem;
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
</style>
