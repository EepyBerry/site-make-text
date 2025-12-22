<template>
  <main>
    <aside id="sprite-properties-panel">
      <SpritePropertiesPanel v-if="selectedWord >= 0" v-model="words[selectedWord]" />
    </aside>
    <section ref="sectionRef" id="section-sprites">
      <div id="sprite-grid">
        <div class="sprite-column" v-for="(word, idx) of words" :key="idx">
          <button type="button" @click="selectWord(idx)">
            <DynamicSprite
              ref="dynamicSpriteRefs"
              :word="word.word"
              :color="word.color"
              :type="word.type"
              :more-letters-on-top="word.moreLettersOnTop"
              :crossed-out="word.crossedOut"
              width="5rem"
              :class="{ empty: word.word!.length === 0 }"
            />
            <StaticSprite
              v-if="selectedWord === idx"
              class="caret"
              width="5rem"
              sprite="icon-caret"
            />
          </button>
          <button
            v-if="selectedWord === idx"
            id="button-delete-word"
            type="button"
            @click="deleteWord(idx)"
          >
            <StaticSprite width="5rem" sprite="icon-trash" />
          </button>
        </div>
        <button type="button" @click="addWord()">
          <StaticSprite width="5rem" sprite="icon-plus" />
        </button>
      </div>
      <button id="button-make-gifs" type="button" @click="makeGifs()">
        <StaticSprite width="5rem" sprite="icon-plus" />
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, type Ref, ref, type TemplateRef, useTemplateRef } from 'vue';
import { WordType, type DynamicSpriteExposes, type DynamicSpriteProps } from '@/types';
import SpritePropertiesPanel from './SpritePropertiesPanel.vue';
import { saveAs } from 'file-saver';

const sectionRef: TemplateRef<HTMLElement> = useTemplateRef('sectionRef');
const dynamicSpriteRefs: TemplateRef<DynamicSpriteExposes[]> = useTemplateRef('dynamicSpriteRefs');

const words: Ref<DynamicSpriteProps[]> = ref([
  {
    word: 'plus',
    color: '#0ea4ad',
    moreLettersOnTop: true,
    type: WordType.NOUN,
    crossedOut: false,
  },
  { word: 'is', color: '#ffffff', moreLettersOnTop: true, type: WordType.NOUN, crossedOut: false },
  {
    word: 'add',
    color: '#0ea4ad',
    moreLettersOnTop: true,
    type: WordType.PROPERTY,
    crossedOut: false,
  },
]);
const wordCount = computed(() => words.value.length + 1);
const selectedWord: Ref<number> = ref(-1);

function addWord() {
  words.value.push({
    word: '',
    color: '#ffffff',
    type: WordType.NOUN,
    moreLettersOnTop: true,
    crossedOut: false,
  });
  setTimeout(
    () => sectionRef.value!.scrollTo({ left: sectionRef.value!.clientWidth, behavior: 'smooth' }),
    50,
  );
}
function selectWord(idx: number) {
  selectedWord.value = idx;
  console.log('selected word ' + idx);
}
function deleteWord(idx: number) {
  words.value.splice(idx, 1);
  selectedWord.value = -1;
}

function makeGifs() {
  const gifBlobs: Blob[] = [];
  dynamicSpriteRefs.value!.forEach((ref) => {
    const maybeBlob: Blob | undefined = ref.convertToBlob();
    if (!maybeBlob) return;
    gifBlobs.push(maybeBlob);
  });
  gifBlobs.forEach((b, i) => saveAs(b, `word-${i}.gif`));
}
</script>

<style lang="scss">
main {
  flex: 1;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: auto 1fr;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

#section-sprites {
  flex: 1;
  position: relative;
  overflow-x: auto;

  display: flex;
  align-items: center;

  #sprite-grid {
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(v-bind(wordCount), min-content);
    grid-template-rows: 1fr;

    .sprite-column {
      position: relative;

      button#button-delete-word {
        position: absolute;
        bottom: -100%;
        left: 0;
      }
    }

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
  width: 14rem;
  border-right: 4px dashed white;

  display: flex;
  flex-direction: column;
}
button#button-make-gifs {
  position: absolute;
  bottom: 0;
  margin: 0 auto;
}
</style>
