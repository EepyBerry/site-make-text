<template>
  <div v-if="$props.showHint" id="word-properties-hint">
    <StaticSprite width="4rem" sprite="icon-word-hint" />
    <p>select a word to see its properties</p>
  </div>
  <div v-else id="word-properties-panel-scrollzone">
    <section id="section-sprite-props">
      <StaticSprite width="2.5rem" sprite="icon-word" />
      <input
        id="prop-word"
        v-model="spriteProps!.word"
        type="text"
        maxlength="8"
        style="text-transform: uppercase"
        aria-label="Word to write (A-Z?! characters only)"
        title="Word to write (A-Z?! characters only)"
      />

      <StaticSprite width="2.5rem" sprite="icon-type" />
      <RadioElement>
        <RadioOptionElement
          v-model="spriteProps!.type"
          pid="prop-type"
          id="noun"
          :value="WordType.NOUN"
          internal-aria-label="Set word as a noun"
          internal-title="Set word as a noun"
        >
          <DynamicSprite word="noun" type="noun" width="2.125rem" />
        </RadioOptionElement>
        <RadioOptionElement
          v-model="spriteProps!.type"
          pid="prop-type"
          id="property"
          :value="WordType.PROPERTY"
          internal-aria-label="Set word as a property (adds background)"
          internal-title="Set word as a property"
        >
          <DynamicSprite word="prop" type="property" width="2.125rem" />
        </RadioOptionElement>
      </RadioElement>

      <StaticSprite width="2.5rem" sprite="icon-morelettersontop" />
      <RadioElement>
        <RadioOptionElement
          v-model="spriteProps!.moreLettersOnTop"
          pid="prop-type"
          id="moreontop"
          :value="false"
          internal-aria-label="Show less letters on top of a word"
          internal-title="Show less letters on top of a word"
        >
          <DynamicSprite word="off" type="noun" width="2.25rem" />
        </RadioOptionElement>
        <RadioOptionElement
          v-model="spriteProps!.moreLettersOnTop"
          pid="prop-type"
          id="lessontop"
          :value="true"
          internal-aria-label="Show more letters on top of a word"
          internal-title="Show more letters on top of a word"
        >
          <DynamicSprite word="on" type="noun" width="2.25rem" />
        </RadioOptionElement>
      </RadioElement>

      <StaticSprite width="2.5rem" sprite="icon-crossedout" />
      <RadioElement>
        <RadioOptionElement
          v-model="spriteProps!.crossedOut"
          pid="prop-type"
          id="notcrossedout"
          :value="false"
          internal-aria-label="Do not cross out word"
          internal-title="Do not cross out word"
        >
          <DynamicSprite word="off" type="noun" width="2.25rem" />
        </RadioOptionElement>
        <RadioOptionElement
          v-model="spriteProps!.crossedOut"
          pid="prop-type"
          id="crossedout"
          :value="true"
          internal-aria-label="Cross out word"
          internal-title="Cross out word"
        >
          <DynamicSprite word="on" type="noun" width="2.25rem" />
        </RadioOptionElement>
      </RadioElement>

      <StaticSprite width="2.5rem" sprite="icon-color" />
      <div id="prop-color"></div>
    </section>
    <section id="section-sprite-color">
      <ColorPicker
        :color="spriteProps!.color"
        alpha-channel="hide"
        default-format="hex"
        :visible-formats="['hex']"
        @color-change="setColor"
        draggable="false"
      >
        <template v-slot:hue-range-input-label><span></span></template>
      </ColorPicker>
    </section>
  </div>
</template>

<script setup lang="ts">
import { WordType, type DynamicSpriteProps } from '@/types';
import { computed } from 'vue';
import RadioElement from '@/components/elements/RadioElement.vue';
import RadioOptionElement from '@/components/elements/RadioOptionElement.vue';
import { ColorPicker } from 'vue-accessible-color-picker';

defineProps<{ showHint: boolean }>();
const spriteProps = defineModel<DynamicSpriteProps|null>();
const spriteColor = computed(() => spriteProps.value?.color);

function setColor(data: { colors: object; cssColor: string }) {
  spriteProps.value!.color = data.cssColor;
}
</script>

<style lang="scss">
#word-properties-hint {
  flex: 1;
  width: 100%;
  padding: 1rem;

  color: var(--smtx-text-hint);
  text-align: center;
  line-height: 1.1;
  font-weight: 600;
  user-select: none;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
#word-properties-panel-scrollzone {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
#section-sprite-props {
  padding: 1rem 1rem 1rem 0.5rem;
  border-bottom: 4px dashed white;

  display: grid;
  grid-template-columns: 3rem 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 1rem 0;

  input {
    width: 100%;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 2px;
  }
  #prop-color {
    width: 100%;
    height: 100%;
    background: v-bind(spriteColor);
    border-radius: 2px;
  }
}
#section-sprite-color {
  padding: 1rem;
  border-bottom: 4px dashed white;
}

@media screen and (max-width: 1023px) {
  #word-properties-hint,
  #word-properties-panel-scrollzone {
    background: var(--smtx-panel);
    border-radius: 8px;
    border-top-left-radius: 0;
  }
  #word-properties-panel-scrollzone {
    padding: 0.5rem;
  }
  #section-sprite-props,
  #section-sprite-color {
    padding: 0;
    border: none;
  }
  #section-sprite-color {
    padding-top: 1rem;
  }
}
</style>
