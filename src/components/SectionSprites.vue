<template>
  <section ref="sectionRef" id="section-sprites">
    <div ref="spriteGrid" id="sprite-grid">
      <button type="button" v-for="dynSprite, idx of words" :key="idx" @click="selectWord(idx)">
        <DynamicSprite
          :key="dynSprite.word"
          :word="dynSprite.word"
          :color="dynSprite.color"
          :more-letters-on-top="dynSprite.moreLettersOnTop"
          :type="dynSprite.type"
          width="5rem"
          :class="{ empty: dynSprite.word!.length === 0}"
        />
      </button>
      <button type="button" @click="addWord()">
        <StaticSprite width="5rem" sprite="icon-plus" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import DynamicSprite from './elements/DynamicSpriteElement.vue';
import { computed, type Ref, ref, useTemplateRef } from 'vue';
import { WordType, type DynamicSpriteProps } from '@/types';
import StaticSprite from './elements/StaticSpriteElement.vue';

const sectionRef = useTemplateRef("sectionRef")
const spriteGrid = useTemplateRef("spriteGrid")

const words: Ref<DynamicSpriteProps[]> = ref([
  { word: 'plus', color: '#0ea4ad', moreLettersOnTop: true, type: WordType.NOUN },
  { word: 'is', color: '#ffffff', moreLettersOnTop: true, type: WordType.NOUN },
  { word: 'add', color: '#0ea4ad', moreLettersOnTop: true, type: WordType.PROPERTY },
])
const wordCount = computed(() => words.value.length + 1)
const selectedWord: Ref<number> = ref(0)

function addWord() {
  words.value.push({ word: '', color: '#ffffff', moreLettersOnTop: true, type: WordType.NOUN })
  setTimeout(() => sectionRef.value!.scrollTo({ left: sectionRef.value!.clientWidth, behavior: 'smooth' }), 50)
}
function selectWord(idx: number) {
  selectedWord.value = idx
  console.log('selected word '+idx)
}

</script>

<style lang="scss">
#section-sprites {
  flex: 1;
  overflow-x: auto;

  display: flex;
  align-items: center;

  button {
    background: none;
    border: none;
    &:hover {
      cursor: pointer;
      .sprite {
        transform: scale(1.05);
      }
    }
    &:active .sprite {
      transform: scale(0.9);
    }
  }

  #sprite-grid {
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(v-bind(wordCount), min-content);
    grid-template-rows: 1fr;
  }

  .sprite.empty {
    border: 2px dashed var(--smtx-word-empty);
  }
}
</style>
