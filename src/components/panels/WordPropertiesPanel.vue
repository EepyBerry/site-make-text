<template>
  <div v-if="$props.showHint" id="word-properties-hint">
    <StaticSprite width="4rem" height="4rem" sprite="word-hint" />
    <p>select a word to see its properties</p>
  </div>
  <div v-else id="word-properties-panel-scrollzone">
    <section id="sprite-props">
      <StaticSprite width="2.5rem" height="2.5rem" sprite="word" />
      <input
        id="prop-word"
        v-model="spriteProps!.word"
        type="text"
        maxlength="8"
        style="text-transform: uppercase"
        aria-label="Word to write (A-Z?! characters only)"
        title="Word to write (A-Z?! characters only)"
      />

      <StaticSprite width="2.5rem" height="2.5rem" sprite="type" />
      <RadioElement>
        <RadioOptionElement
          v-model="spriteProps!.type"
          pid="prop-type"
          id="noun"
          :value="WordType.NOUN"
          internal-aria-label="Set word as a noun"
          internal-title="Set word as a noun"
        >
          <StaticSprite width="2.125rem" height="2.125rem" sprite="noun" />
        </RadioOptionElement>
        <RadioOptionElement
          v-model="spriteProps!.type"
          pid="prop-type"
          id="property"
          :value="WordType.PROPERTY"
          internal-aria-label="Set word as a property (adds background)"
          internal-title="Set word as a property"
        >
          <StaticSprite width="2.125rem" height="2.125rem" sprite="prop" />
        </RadioOptionElement>
      </RadioElement>

      <StaticSprite width="2.5rem" height="2.5rem" sprite="morelettersontop" />
      <RadioElement>
        <RadioOptionElement
          v-model="spriteProps!.moreLettersOnTop"
          pid="prop-type"
          id="moreontop"
          :value="false"
          internal-aria-label="Show less letters on top of a word"
          internal-title="Show less letters on top of a word"
        >
          <StaticSprite width="2.25rem" height="2.25rem" sprite="off" />
        </RadioOptionElement>
        <RadioOptionElement
          v-model="spriteProps!.moreLettersOnTop"
          pid="prop-type"
          id="lessontop"
          :value="true"
          internal-aria-label="Show more letters on top of a word"
          internal-title="Show more letters on top of a word"
        >
          <StaticSprite width="2.25rem" height="2.25rem" sprite="on" />
        </RadioOptionElement>
      </RadioElement>

      <StaticSprite width="2.5rem" height="2.5rem" sprite="crossedout" />
      <RadioElement>
        <RadioOptionElement
          v-model="spriteProps!.crossedOut"
          pid="prop-type"
          id="notcrossedout"
          :value="false"
          internal-aria-label="Do not cross out word"
          internal-title="Do not cross out word"
        >
          <StaticSprite width="2.25rem" height="2.25rem" sprite="off" />
        </RadioOptionElement>
        <RadioOptionElement
          v-model="spriteProps!.crossedOut"
          pid="prop-type"
          id="crossedout"
          :value="true"
          internal-aria-label="Cross out word"
          internal-title="Cross out word"
        >
          <StaticSprite width="2.25rem" height="2.25rem" sprite="on" />
        </RadioOptionElement>
      </RadioElement>

      <template v-if="isWordSpecial(spriteProps?.word)">
        <StaticSprite width="2.5rem" height="2.5rem" sprite="special" />
        <RadioElement>
          <RadioOptionElement
            v-model="spriteProps!.drawObject"
            pid="prop-special"
            id="drawword"
            :value="false"
            internal-aria-label="Draw letters as-is"
            internal-title="Draw letters as-is"
          >
            <StaticSprite width="2.25rem" height="2.25rem" sprite="off" />
          </RadioOptionElement>
          <RadioOptionElement
            v-model="spriteProps!.drawObject"
            pid="prop-special"
            id="drawobject"
            :value="true"
            internal-aria-label="Draw object representing this word"
            internal-title="Draw object representing this word"
          >
            <StaticSprite width="2.25rem" height="2.25rem" sprite="on" />
          </RadioOptionElement>
        </RadioElement>
      </template>

      <StaticSprite width="2.5rem" height="2.5rem" sprite="color" />
      <div id="prop-color"></div>
    </section>
    <section id="sprite-color">
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
import { WordType, type DynamicSpriteProps } from '@/core/types';
import { computed } from 'vue';
import RadioElement from '@/components/elements/RadioElement.vue';
import RadioOptionElement from '@/components/elements/RadioOptionElement.vue';
import { ColorPicker } from 'vue-accessible-color-picker';
import { isWordSpecial } from '@/core/helpers/spritesheet.helper';

defineProps<{ showHint: boolean }>();
const spriteProps = defineModel<DynamicSpriteProps | null>();
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
#sprite-props {
  padding: 1rem 1rem 1rem 0.5rem;
  border-bottom: 4px dashed white;

  display: grid;
  grid-template-columns: 3rem 1fr;
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
#sprite-color {
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
  #sprite-props,
  #sprite-color {
    padding: 0;
    border: none;
  }
  #sprite-color {
    padding-top: 1rem;
  }
}
</style>
