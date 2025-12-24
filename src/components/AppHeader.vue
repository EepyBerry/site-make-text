<template>
  <header id="smtx-header">
    <DynamicSprite
      width="4rem"
      word="site"
      color="#8e44c7"
      type="noun"
      :more-letters-on-top="false"
    />
    <hr />
    <DynamicSprite width="4rem" word="make" :more-letters-on-top="false" />
    <hr />
    <DynamicSprite width="4rem" word="text" color="#e336a3" :more-letters-on-top="false" />
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
