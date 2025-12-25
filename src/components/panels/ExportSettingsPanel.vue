<template>
  <section id="section-export-settings">

  </section>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';

type ExportSettings = { format: 'gif'|'webp', scale: number, combinedOnly: boolean }
const exportSettings: Ref<ExportSettings> = ref({ format: 'webp', scale: 3, combinedOnly: false })

defineEmits(['export'])
</script>

<style lang="scss">
#section-export-settings {
  display: grid;
  grid-template-columns: 3rem 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 1rem 0;
}
</style>
