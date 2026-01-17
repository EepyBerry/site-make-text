<template>
  <div class="warning-box">
    <slot></slot>
  </div>
</template>
<style lang="scss">
.warning-box {
  padding: 0.5rem 0.75rem;
  margin: 1rem auto;
  border: 1px solid var(--smtx-warn);
  border-radius: 4px;
  background: var(--smtx-panel-warn);
}
</style>
