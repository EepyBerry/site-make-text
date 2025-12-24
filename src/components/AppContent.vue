<template>
  <main>
    <aside id="word-properties-sidebar" aria-label="Selected word properties" :class="{ collapsed: !compactModePropertiesToggle}">
      <button id="button-toggle-sidebar" type="button" class="animated" @click="compactModePropertiesToggle = !compactModePropertiesToggle">
        <StaticSprite v-show="!compactModePropertiesToggle" width="2.5rem" sprite="icon-right" />
        <StaticSprite v-show="compactModePropertiesToggle" width="2.5rem" sprite="icon-left" />
      </button>
      <SpritePropertiesPanel v-if="selectedWord >= 0" v-model="words[selectedWord]" />
      <div v-else id="word-properties-hint">
        <StaticSprite width="4rem" sprite="icon-word-hint" />
        <p>select a word to see its properties</p>
      </div>
    </aside>
    <section id="section-words">
      <div ref="sectionRef" id="section-words-scrollzone">
        <!-- main content -->
        <div id="word-grid">
          <button
            v-for="(word, idx) of words"
            :key="idx"
            ref="wordElementRefs"
            :id="'button-word-'+idx"
            type="button"
            class="animated"
            @click="selectWord(idx)"
            :aria-label="'word: '+word.word"
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
              :class="{ disabled: compactMode && compactModePropertiesToggle }"
            />
          </button>
          <button type="button" id="button-add-word" class="animated" @click="addWord()" aria-label="Add word">
            <StaticSprite width="5rem" sprite="icon-plus" />
          </button>
        </div>

        <!-- floating element -->
        <div ref="wordActionsElementRef" id="word-actions-panel" :class="{ disabled: compactMode && compactModePropertiesToggle }" :style="floatingStyles">
          <div class="actions-container">
            <button type="button" class="animated" :disabled="selectedWord === 0 || (compactMode && compactModePropertiesToggle)" @click="moveSelectedWord('left')" aria-label="Move selected word left (if possible)">
              <StaticSprite width="4rem" sprite="icon-left" />
            </button>
            <button type="button" class="animated" :disabled="!canDeleteSelectedWord.v || (compactMode && compactModePropertiesToggle)" @click="deleteWord(selectedWord)" aria-label="Delete selected word">
              <StaticSprite width="4rem" sprite="icon-trash" />
            </button>
            <button type="button" class="animated" :disabled="selectedWord === wordCount-2 || (compactMode && compactModePropertiesToggle)" @click="moveSelectedWord('right')" aria-label="Move selected word right (if possible)">
              <StaticSprite width="4rem" sprite="icon-right" />
            </button>
          </div>
        </div>
      </div>

      <!-- special actions -->
      <div id="global-actions-bar" :class="{ disabled: compactMode && compactModePropertiesToggle }">
        <div id="global-actions-panel">
          <button type="button" :disabled="compactMode && compactModePropertiesToggle" @click="exportWords('gif')" aria-label="Export words as .gif">
            <StaticSprite width="4rem" sprite="icon-format-gif" />
          </button>
          <button type="button" :disabled="compactMode && compactModePropertiesToggle" @click="exportWords('webp')" aria-label="Export words as .webp">
            <StaticSprite width="4rem" sprite="icon-format-webp" />
          </button>
          <div id="action-download-container">
            <StaticSprite width="4rem" sprite="icon-download" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, type Ref, ref, type TemplateRef, useTemplateRef } from 'vue';
import { WordType, type DynamicSpriteExposes, type DynamicSpriteProps } from '@/types';
import SpritePropertiesPanel from './SpritePropertiesPanel.vue';
import { autoUpdate, limitShift, offset, shift, useFloating } from '@floating-ui/vue';
import { EventBus } from '@/core/event-bus';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import GIFImageDataEncoder from '@/core/encoders/gif.encoder';
import WebPImageDataEncoder from '@/core/encoders/webp.encoder';
import { SPRITESHEET_CELL_SIZE } from '@/core/globals';

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

// compact mode refs
const compactMode: Ref<boolean> = ref(false)
const compactModePropertiesToggle: Ref<boolean> = ref(false);

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

// ----------------------------------------------------------------------------
// lifecycle

const checkCompactMode = () => compactMode.value = window.innerWidth <= 1023
onMounted(() => {
  EventBus.registerWindowEventListener('resize', checkCompactMode)
  EventBus.registerWindowEventListener('deviceorientation', checkCompactMode)
})
onBeforeMount(() => {
  EventBus.deregisterWindowEventListener('resize', checkCompactMode)
  EventBus.deregisterWindowEventListener('deviceorientation', checkCompactMode)
})

function addWord() {
  words.value.push({
    word: '',
    color: '#ffffff',
    type: WordType.NOUN,
    moreLettersOnTop: true,
    crossedOut: false,
  });
  if (selectedWord.value < 0) {
    setTimeout(() => selectWord(words.value.length-1), 0);
  }
  setTimeout(
    () => sectionRef.value!.scrollTo({ left: sectionRef.value!.clientWidth, behavior: 'smooth' }),
    50,
  );
}

// ----------------------------------------------------------------------------
// component functions

function selectWord(idx: number) {
  selectedWord.value = idx;
  selectedWordElementRef.value = wordElementRefs.value!.find(r => r.id === `button-word-${idx.toString()}`)!
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
  selectedWordElementRef.value = wordElementRefs.value!.find(r => r.id === `button-word-${moveIndex.toString()}`)!
  wordActionsElementRef.value!.focus()
  update()
  canDeleteSelectedWord.value.timeout = window.setTimeout(() => canDeleteSelectedWord.value.v = true, 500)
}

function deleteWord(idx: number) {
  words.value.splice(idx, 1);
  selectedWord.value = -1;
  wordActionsElementRef.value!.style.display = 'none'
}

async function exportWords(format: 'gif'|'webp') {
  const outputScale = 2
  const wordBlobs: Blob[] = [];
  for (let i = 0; i < wordSpriteRefs.value!.length; i++) {
    // get frame data
    const wordSprite = wordSpriteRefs.value![i]!
    const frames: ImageData[] = wordSprite.extractFrames(outputScale);
    if (!frames || frames.length === 0) return;

    // encode to target format (.gif or .webp)
    if (format === 'gif') {
      const encoder = new GIFImageDataEncoder()
      const wb = new Blob([encoder.encode(frames, outputScale * SPRITESHEET_CELL_SIZE)], { type: 'image/gif' })
      wordBlobs.push(wb);
    } else if (format === 'webp') {
      const encoder = new WebPImageDataEncoder()
      const wb = new Blob([await encoder.encodeAsync(frames, outputScale * SPRITESHEET_CELL_SIZE)], { type: 'image/webp' })
      wordBlobs.push(wb);
    }
  }

  // export as .zip; yes this format is trash, but it's still a bigger default than much better stuff like .tar.gz...
  // yes i'm kinda sad about that now that i (sort-of) know how terrible it is :c
  // https://web.archive.org/web/20250118102842/https://games.greggman.com/game/zip-rant/
  const jsZip = new JSZip();
  wordBlobs.forEach((wb,i) => jsZip.file(`word-${i}.${format}`, wb))
  const zipFile = await jsZip.generateAsync({ type: 'blob' });
  FileSaver.saveAs(zipFile, 'sitemaketext-words.zip');
}

</script>

<style lang="scss">
main {
  position: relative;
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
  overflow: hidden;
  display: flex;
  align-items: center;

  #section-words-scrollzone {
    flex: 1;
    width: 100%;
    height: 100%;
    overflow-x: auto;

    display: flex;
    align-items: center;
  }
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

#word-properties-sidebar {
  width: 14rem;
  border-right: 4px dashed white;

  display: flex;
  flex-direction: column;
  align-items: center;

  #word-properties-hint {
    flex: 1;
    width: 100%;
    padding: 1rem;

    color: var(--smtx-text-hint);
    text-align: center;
    line-height: 1.1;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  #button-toggle-sidebar {
    display: none;
  }
}

div#global-actions-bar {
  position: absolute;
  inset: auto 0 1rem;
  padding: 0.5rem;
  display: flex;
  pointer-events: none;

  #global-actions-panel {
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0 auto;
    pointer-events: all;

    border-radius: 8px;
    background: var(--smtx-panel);
    padding: 0.25rem;

    button {
      padding: 4px;
      background: var(--smtx-button);
      &:hover { background: var(--smtx-button-hover);}
      &:active { background: var(--smtx-button-active);}
    }
    button:first-of-type {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    button:last-of-type {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
}

.disabled {
  pointer-events: none;
  filter: brightness(0.625)
}

@media screen and (max-width: 1023px) {
  main {
    grid-template-columns: 1fr;
  }
  #word-properties-sidebar {
    z-index: 10;
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.5rem;
    overflow-y: auto;

    align-items: flex-start;
    gap: 1rem;

    background: var(--smtx-panel);
    border-radius: 8px;
    border: none;

    & > * {
      padding: 0;
      border: none;
    }
    #button-toggle-sidebar {
      display: block;
      .sprite { transform: rotate(90deg);}
    }
    #word-properties-hint:nth-child(2) {
      padding-top: 0;
    }
  }
  #word-properties-sidebar.collapsed {
    width: fit-content;
    max-width: 14rem;
    #word-properties-hint { display: none; }
    section { display: none;}
  }
  div#global-actions-bar {
    align-items: flex-start;
  }
}
</style>
