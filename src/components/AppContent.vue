<template>
  <main>
    <aside id="sprite-properties-panel">
      <SpritePropertiesPanel v-if="selectedWord >= 0" v-model="words[selectedWord]" />
    </aside>
    <section ref="sectionRef" id="section-words">
      <!-- main content -->
      <div id="word-grid">
        <button
          v-for="(word, idx) of words"
          :key="idx"
          ref="wordElementRefs"
          :id="'button-sprite-'+idx"
          type="button"
          class="animated"
          @click="selectWord(idx)"
        >
          <DynamicSprite
            ref="wordSpriteRefs"
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
        <button type="button" @click="addWord()">
          <StaticSprite width="5rem" sprite="icon-plus" />
        </button>
      </div>

      <!-- floating element -->
      <div ref="wordActionsElementRef" id="word-actions-panel" :style="floatingStyles">
        <div class="actions-container">
          <button type="button" class="animated" :disabled="selectedWord === 0" @click="moveSelectedWord('left')">
            <StaticSprite width="4rem" sprite="icon-left" />
          </button>
          <button type="button" class="animated" :disabled="!canDeleteSelectedWord.v" @click="deleteWord(selectedWord)">
            <StaticSprite width="4rem" sprite="icon-trash" />
          </button>
          <button type="button" class="animated" :disabled="selectedWord === wordCount-2" @click="moveSelectedWord('right')">
            <StaticSprite width="4rem" sprite="icon-right" />
          </button>
        </div>
      </div>

      <!-- special actions -->
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
import { autoUpdate, limitShift, offset, shift, useFloating } from '@floating-ui/vue';

// main page refs
const sectionRef: TemplateRef<HTMLElement> = useTemplateRef('sectionRef');
const wordElementRefs: TemplateRef<HTMLElement[]> = useTemplateRef("wordElementRefs");
const wordSpriteRefs: TemplateRef<DynamicSpriteExposes[]> = useTemplateRef('wordSpriteRefs');
const selectedWordElementRef: Ref<HTMLElement|null> = ref(null);

// floating-ui refs
const wordActionsElementRef: TemplateRef<HTMLElement> = useTemplateRef("wordActionsElementRef");
const { floatingStyles, update } = useFloating(selectedWordElementRef, wordActionsElementRef, {
  placement: 'top',
  middleware: [offset(26), shift({ limiter: limitShift({
    offset: ({rects}) => rects.reference.width
  }) })],
  whileElementsMounted: autoUpdate
})

// word data & refs
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
const canDeleteSelectedWord: Ref<{ timeout: number|undefined, v: boolean }> = ref({ timeout: undefined, v: true });

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
  selectedWordElementRef.value = wordElementRefs.value!.find(r => r.id === `button-sprite-${idx.toString()}`)!
  wordActionsElementRef.value!.style.display = 'block'
  wordActionsElementRef.value!.focus()
  update()
}
function moveSelectedWord(direction: 'left'|'right') {
  if (direction === 'left' && selectedWord.value === 0) return
  if (direction === 'right' && selectedWord.value === words.value!.length-1) return
  clearTimeout(canDeleteSelectedWord.value.timeout)
  canDeleteSelectedWord.value.v = false

  const element = words.value[selectedWord.value]!;
  const moveIndex = direction === 'left' ? selectedWord.value-1 : selectedWord.value+1
  words.value!.splice(selectedWord.value, 1);
  words.value!.splice(moveIndex, 0, element);
  selectedWord.value = moveIndex
  selectedWordElementRef.value = wordElementRefs.value!.find(r => r.id === `button-sprite-${moveIndex.toString()}`)!
  wordActionsElementRef.value!.focus()
  update()
  canDeleteSelectedWord.value.timeout = setTimeout(() => canDeleteSelectedWord.value.v = true, 500)
}

function deleteWord(idx: number) {
  words.value.splice(idx, 1);
  selectedWord.value = -1;
}

function makeGifs() {
  const gifBlobs: Blob[] = [];
  wordSpriteRefs.value!.forEach((ref) => {
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

#section-words {
  flex: 1;
  position: relative;
  overflow-x: auto;

  display: flex;
  align-items: center;

  #word-grid {
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(v-bind(wordCount), min-content);
    grid-template-rows: 1fr;
  }

  .sprite.caret {
    transform: none;
    pointer-events: none;
    cursor: default;
    position: absolute;
    top: -100%;
  }
}
div#word-actions-panel {
  display: none;
  padding: 0.25rem;
  border-radius: 8px;
  background: var(--smtx-panel);

  .actions-container {
    display: flex;
    align-items: center;
    button:disabled {
      filter: brightness(0.25);
    }
    button.animated:hover > * { transform: scale(1.10); }
    button.animated:active > * { transform: scale(0.90); }
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
