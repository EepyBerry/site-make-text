<template>
  <section id="section-sprite-props">
    <StaticSprite width="2.5rem" sprite="icon-word" />
    <input id="prop-word" v-model="spriteProps!.word"
      type="text"
      maxlength="8"
      style="text-transform: uppercase;"
    >

    <StaticSprite width="2.5rem" sprite="icon-color" />
    <button id="prop-color-toggle"></button>

    <StaticSprite width="2.5rem" sprite="icon-type" />
    <RadioElement>
      <RadioOptionElement v-model="spriteProps!.type" pid="prop-type" id="noun" :value="WordType.NOUN">
        <DynamicSprite word="noun" type="noun" width="2rem" />
      </RadioOptionElement>
      <RadioOptionElement v-model="spriteProps!.type" pid="prop-type" id="property" :value="WordType.PROPERTY">
        <DynamicSprite word="prop" type="property" width="2rem" />
      </RadioOptionElement>
    </RadioElement>

    <StaticSprite width="2.5rem" sprite="icon-morelettersontop" />
    <RadioElement>
      <RadioOptionElement v-model="spriteProps!.moreLettersOnTop" pid="prop-type" id="noun" :value="false">
        <DynamicSprite word="off" type="noun" width="2rem" />
      </RadioOptionElement>
      <RadioOptionElement v-model="spriteProps!.moreLettersOnTop" pid="prop-type" id="property" :value="true">
        <DynamicSprite word="on" type="noun" width="2rem" />
      </RadioOptionElement>
    </RadioElement>
  </section>
</template>

<script setup lang="ts">
import { WordType, type DynamicSpriteProps } from '@/types';
import { computed } from 'vue';
import RadioElement from './elements/RadioElement.vue';
import RadioOptionElement from './elements/RadioOptionElement.vue';

const spriteProps = defineModel<DynamicSpriteProps>()
const spriteColor = computed(() => spriteProps.value?.color)
</script>

<style lang="scss">
#section-sprite-props {
  padding: 1rem 1rem 1rem 0.5rem;

  border-bottom: 4px dashed white;
  border-right: 4px dashed white;

  display: grid;
  grid-template-columns: 3rem 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 1rem 0;

  input {
    width: 10rem;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 2px;
  }
  button#prop-color-toggle {
    width: 100%;
    height: 100%;
    background: v-bind(spriteColor);
    border-radius: 2px;
  }
}
</style>
