<template>
  <section ref="sectionRef" id="section-sprites">
    <aside id="sprite-properties-panel" v-if="selectedWord >= 0">
      <SpritePropertiesPanel v-model="words[selectedWord]" />
    </aside>
    <div ref="spriteGrid" id="sprite-grid">
      <button type="button" v-for="word, idx of words" :key="idx" @click="selectWord(idx)">
        <DynamicSprite
          :word="word.word"
          :color="word.color"
          :more-letters-on-top="word.moreLettersOnTop"
          :type="word.type"
          width="5rem"
          :class="{ empty: word.word!.length === 0}"
        />
        <StaticSprite v-if="selectedWord === idx" class="caret" width="5rem" sprite="icon-caret" />
      </button>
      <button type="button" @click="addWord()">
        <StaticSprite width="5rem" sprite="icon-plus" />
      </button>
    </div>
    <button v-show="false" id="button-make-gifs" type="button" @click="makeGifs()">
      <StaticSprite width="5rem" sprite="icon-plus" />
    </button>
  </section>
</template>

<script setup lang="ts">
import DynamicSprite from './elements/DynamicSpriteElement.vue';
import { computed, type Ref, ref, useTemplateRef } from 'vue';
import { WordType, type DynamicSpriteProps } from '@/types';
import StaticSprite from './elements/StaticSpriteElement.vue';
import SpritePropertiesPanel from './SpritePropertiesPanel.vue';

const sectionRef = useTemplateRef("sectionRef")
const spriteGrid = useTemplateRef("spriteGrid")

const words: Ref<DynamicSpriteProps[]> = ref([
  { word: 'plus', color: '#0ea4ad', moreLettersOnTop: true, type: WordType.NOUN },
  { word: 'is', color: '#ffffff', moreLettersOnTop: true, type: WordType.NOUN },
  { word: 'add', color: '#0ea4ad', moreLettersOnTop: true, type: WordType.PROPERTY },
])
const wordCount = computed(() => words.value.length + 1)
const selectedWord: Ref<number> = ref(-1)

function addWord() {
  words.value.push({ word: '', color: '#ffffff', moreLettersOnTop: true, type: WordType.NOUN })
  setTimeout(() => sectionRef.value!.scrollTo({ left: sectionRef.value!.clientWidth, behavior: 'smooth' }), 50)
}
function selectWord(idx: number) {
  selectedWord.value = idx
  console.log('selected word '+idx)
}

function makeGifs() {
  // TODO implement this
}

</script>

<style lang="scss">
#section-sprites {
  flex: 1;
  position: relative;
  overflow-x: auto;

  display: flex;
  align-items: center;

  button#button-make-gifs {
    position: absolute;
    bottom: 0;
    margin: 0 auto;
  }
  #sprite-grid {
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(v-bind(wordCount), min-content);
    grid-template-rows: 1fr;

    button {
      position: relative;
      background: none;
      border: none;
      &:hover {
        cursor: pointer;
        .sprite:not(.caret) {
          transform: scale(1.05);
        }
      }
      &:active .sprite:not(.caret) {
        transform: scale(0.9);
      }
    }
  }

  .sprite.caret {
    position: absolute;
    top: -100%;
  }
}
#sprite-properties-panel {
  position: fixed;
  top: 6.25rem;
  left: 0;
}
</style>
