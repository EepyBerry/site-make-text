<template>
  <div class="radio-options">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.radio-options {
  min-height: 2rem;
  height: 100%;

  border-radius: 2px;
  border: none;
  font-family: inherit;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;

  & > :deep(.radio-option:first-of-type) {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  & > :deep(.radio-option:last-of-type) {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
}
</style>
