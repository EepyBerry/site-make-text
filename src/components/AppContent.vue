<template>
  <main>
    <!-- export "loader" -->
    <div id="export-loader" :class="{ visible: isExporting }">
      <StaticSprite width="10rem" sprite="icon-wait" />
      <p>&lt;exporting...&gt;</p>
    </div>

    <!-- properties section -->
    <aside
      id="word-properties-sidebar"
      aria-label="Selected word properties"
      :class="{ collapsed: !wordPropertiesToggle }"
    >
      <button
        id="button-toggle-sidebar"
        type="button"
        class="animated"
        :class="{ active: !!wordPropertiesToggle }"
        @click="togglePropertiesPanel"
        aria-label="Toggle word properties panel"
        title="Toggle word properties panel"
      >
        <StaticSprite v-if="wordPropertiesToggle" width="2.5rem" sprite="icon-properties-opened" />
        <StaticSprite v-else width="2.5rem" sprite="icon-properties-closed" />
      </button>
      <WordPropertiesPanel :show-hint="selectedWord < 0" v-model="words[selectedWord]" />
    </aside>

    <!-- main section -->
    <section id="section-words">
      <!-- reset button -->
      <button
        id="button-reset"
        type="button"
        class="animated"
        @click="resetWords"
        aria-label="Remove all words (reset)"
        title="Remove all words (reset)"
      >
        <StaticSprite width="2.5rem" sprite="icon-reset" />
      </button>

      <div ref="sectionRef" id="section-words-scrollzone">
        <!-- main content -->
        <div id="word-grid">
          <button
            v-for="(word, idx) of words"
            :key="idx"
            ref="wordElementRefs"
            :id="'button-word-' + idx"
            type="button"
            class="animated"
            @click="selectWord(idx)"
            :aria-label="'word: ' + word.word"
            title="Edit word"
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
              :class="{ disabled: compactMode && wordPropertiesToggle }"
            />
          </button>
          <button
            type="button"
            id="button-add-word"
            class="animated"
            @click="addWord()"
            aria-label="Add new word"
            title="Add new word"
          >
            <StaticSprite width="4rem" sprite="icon-plus" />
          </button>
        </div>

        <!-- floating element -->
        <div
          ref="wordActionsElementRef"
          id="word-actions-panel"
          :class="{ disabled: compactMode && wordPropertiesToggle }"
          :style="floatingStyles"
        >
          <div class="actions-container">
            <button
              type="button"
              class="animated"
              :disabled="selectedWord === 0 || (compactMode && wordPropertiesToggle)"
              @click="moveSelectedWord('left')"
              aria-label="Move selected word left (if possible)"
              title="Move right"
            >
              <StaticSprite width="4rem" sprite="icon-left" />
            </button>
            <button
              type="button"
              class="animated"
              :disabled="!canDeleteSelectedWord.v || (compactMode && wordPropertiesToggle)"
              @click="deleteWord(selectedWord)"
              aria-label="Delete selected word"
              title="Delete selected word"
            >
              <StaticSprite width="4rem" sprite="icon-trash" />
            </button>
            <button
              type="button"
              class="animated"
              :disabled="selectedWord === wordCount - 2 || (compactMode && wordPropertiesToggle)"
              @click="moveSelectedWord('right')"
              aria-label="Move selected word right (if possible)"
              title="Move right"
            >
              <StaticSprite width="4rem" sprite="icon-right" />
            </button>
          </div>
        </div>
      </div>

      <!-- export panel -->
      <div id="export-settings-panel" :class="{ collapsed: !exportSettingsToggle }">
        <button
          id="button-toggle-export-settings"
          type="button"
          class="animated"
          :class="{ active: !!exportSettingsToggle }"
          @click="toggleExportSettingsPanel"
          aria-label="Toggle word properties panel"
          title="Toggle word properties panel"
        >
          <StaticSprite v-if="exportSettingsToggle" width="2.5rem" sprite="icon-export-opened" />
          <StaticSprite v-else width="2.5rem" sprite="icon-export-closed" />
        </button>
        <ExportSettingsPanel @export="exportWords" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeMount,
  onMounted,
  type Ref,
  ref,
  type TemplateRef,
  useTemplateRef,
} from 'vue';
import {
  WordType,
  type DynamicSpriteExposes,
  type DynamicSpriteProps,
  type ExportSettingsOptions,
} from '@/types';
import WordPropertiesPanel from '@/components/panels/WordPropertiesPanel.vue';
import { autoUpdate, limitShift, offset, shift, useFloating } from '@floating-ui/vue';
import { EventBus } from '@/core/event-bus';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import GIFImageDataEncoder from '@/core/encoders/gif.encoder';
import WebPImageDataEncoder from '@/core/encoders/webp.encoder';
import { SPRITESHEET_CELL_SIZE } from '@/core/globals';
import { combineCanvasData } from '@/core/helpers/canvas.helper';
import ExportSettingsPanel from './panels/ExportSettingsPanel.vue';
import { clamp } from '@/core/utils/math.utils';

// main page refs
const sectionRef: TemplateRef<HTMLElement> = useTemplateRef('sectionRef');
const wordElementRefs: TemplateRef<HTMLElement[]> = useTemplateRef('wordElementRefs');
const wordSpriteRefs: TemplateRef<DynamicSpriteExposes[]> = useTemplateRef('wordSpriteRefs');
const selectedWordElementRef: Ref<HTMLElement | null> = ref(null);
const isExporting: Ref<boolean> = ref(false);

// floating-ui refs
const wordActionsElementRef: TemplateRef<HTMLElement> = useTemplateRef('wordActionsElementRef');
const { floatingStyles, update } = useFloating(selectedWordElementRef, wordActionsElementRef, {
  placement: 'top',
  middleware: [
    offset(26),
    shift({
      limiter: limitShift({
        offset: ({ rects }) => rects.reference.width,
      }),
    }),
  ],
  whileElementsMounted: autoUpdate,
});

// compact mode & toggle refs
const compactMode: Ref<boolean> = ref(false);
const wordPropertiesToggle: Ref<boolean> = ref(false);
const exportSettingsToggle: Ref<boolean> = ref(false);

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
const canDeleteSelectedWord: Ref<{ timeout: number | undefined; v: boolean }> = ref({
  timeout: undefined,
  v: true,
});

// ----------------------------------------------------------------------------
// lifecycle

const checkCompactMode = () => (compactMode.value = window.innerWidth <= 1023);
const checkPointerTarget = (evt: Event) => {
  if ((evt.target as HTMLElement).id === 'section-words-scrollzone') {
    selectedWord.value = -1;
    selectedWordElementRef.value = null;
    wordActionsElementRef.value!.style.display = 'none';
    wordPropertiesToggle.value = false;
    exportSettingsToggle.value = false;
  }
};
onMounted(() => {
  sectionRef.value!.addEventListener('pointerdown', checkPointerTarget);
  EventBus.registerWindowEventListener('resize', checkCompactMode);
  EventBus.registerWindowEventListener('deviceorientation', checkCompactMode);
});
onBeforeMount(() => {
  sectionRef.value?.removeEventListener('pointerdown', checkPointerTarget);
  EventBus.deregisterWindowEventListener('resize', checkCompactMode);
  EventBus.deregisterWindowEventListener('deviceorientation', checkCompactMode);
});

// ----------------------------------------------------------------------------
// component functions

function togglePropertiesPanel() {
  if (compactMode.value) {
    wordPropertiesToggle.value = !wordPropertiesToggle.value;
  }
  if (wordPropertiesToggle.value) {
    exportSettingsToggle.value = false;
  }
}
function toggleExportSettingsPanel() {
  exportSettingsToggle.value = !exportSettingsToggle.value;
  if (exportSettingsToggle.value) {
    wordPropertiesToggle.value = false;
  }
}

function addWord() {
  words.value.push({
    word: '',
    color: '#ffffff',
    type: WordType.NOUN,
    moreLettersOnTop: true,
    crossedOut: false,
  });
  if (selectedWord.value < 0) {
    setTimeout(() => selectWord(words.value.length - 1), 0);
  }
  setTimeout(
    () => sectionRef.value!.scrollTo({ left: sectionRef.value!.clientWidth, behavior: 'smooth' }),
    50,
  );
}

function selectWord(idx: number) {
  selectedWord.value = idx;
  selectedWordElementRef.value = wordElementRefs.value!.find(
    (r) => r.id === `button-word-${idx.toString()}`,
  )!;
  wordActionsElementRef.value!.style.display = 'block';
  wordActionsElementRef.value!.focus();
  update();
}

function moveSelectedWord(direction: 'left' | 'right') {
  if (direction === 'left' && selectedWord.value === 0) return;
  if (direction === 'right' && selectedWord.value === words.value!.length - 1) return;
  clearTimeout(canDeleteSelectedWord.value.timeout);
  canDeleteSelectedWord.value.v = false;

  const element = words.value[selectedWord.value]!;
  const moveIndex = direction === 'left' ? selectedWord.value - 1 : selectedWord.value + 1;
  words.value!.splice(selectedWord.value, 1);
  words.value!.splice(moveIndex, 0, element);
  selectedWord.value = moveIndex;
  selectedWordElementRef.value = wordElementRefs.value!.find(
    (r) => r.id === `button-word-${moveIndex.toString()}`,
  )!;
  wordActionsElementRef.value!.focus();
  update();
  canDeleteSelectedWord.value.timeout = window.setTimeout(
    () => (canDeleteSelectedWord.value.v = true),
    500,
  );
}

function deleteWord(idx: number) {
  words.value.splice(idx, 1);
  selectedWord.value = -1;
  wordActionsElementRef.value!.style.display = 'none';
}

function resetWords() {
  words.value.splice(0);
  selectedWord.value = -1;
  wordActionsElementRef.value!.style.display = 'none';
}

async function exportWords(opts: ExportSettingsOptions) {
  isExporting.value = true;
  setTimeout(async () => {
    try {
      const outputScale = clamp(opts.scale, 1, 10);
      const scaledOutputSize = outputScale * SPRITESHEET_CELL_SIZE;
      const wordBlobs: Blob[] = [];

      // init encoders
      const gifEncoder = new GIFImageDataEncoder();
      const webpEncoder = new WebPImageDataEncoder();

      // PHASE 1: extract frame data
      const rawFrames: ImageData[][] = [];
      for (let i = 0; i < wordSpriteRefs.value!.length; i++) {
        // get frame data
        const wordSprite = wordSpriteRefs.value![i]!;
        const frames: ImageData[] = wordSprite.extractFrames(outputScale);
        if (!frames || frames.length === 0) continue;
        rawFrames.push(frames);
      }

      // PHASE 2 (optional): encode words to target format (with additional combined version)
      if (!opts.combinedOnly) {
        for (let r = 0; r < rawFrames.length; r++) {
          if (opts.format === 'gif') {
            const encoded = gifEncoder.encode(rawFrames[r]!, scaledOutputSize, scaledOutputSize);
            wordBlobs.push(new Blob([encoded], { type: 'image/gif' }));
          } else if (opts.format === 'webp') {
            const encoded = await webpEncoder.encodeAsync(
              rawFrames[r]!,
              scaledOutputSize,
              scaledOutputSize,
            );
            wordBlobs.push(new Blob([encoded], { type: 'image/webp' }));
          }
        }
      }

      // PHASE 3: combine words into one set of frames and encode to target format
      let combinedBlob: Blob | undefined;
      const combinedOutputWidth = words.value.length * scaledOutputSize;
      const combinedOutputHeight = scaledOutputSize;
      const combinedFrames: ImageData[] = [];
      for (let c = 0; c < 3; c++) {
        combinedFrames.push(
          combineCanvasData(
            rawFrames.map((r) => r[c]!),
            words.value.length * scaledOutputSize,
            scaledOutputSize,
            scaledOutputSize,
          ),
        );
      }
      if (opts.format === 'gif') {
        const encoded = gifEncoder.encode(
          combinedFrames,
          combinedOutputWidth,
          combinedOutputHeight,
        );
        combinedBlob = new Blob([encoded], { type: 'image/gif' });
      } else if (opts.format === 'webp') {
        const encoded = await webpEncoder.encodeAsync(
          combinedFrames,
          combinedOutputWidth,
          combinedOutputHeight,
        );
        combinedBlob = new Blob([encoded], { type: 'image/webp' });
      }

      // PHASE 4: export as .zip if multiple files (SEPARATE) or as a single file (COMBINED)
      if (opts.combinedOnly && combinedBlob) {
        FileSaver.saveAs(combinedBlob!, `word-combined.${opts.format}`);
      } else {
        // export as .zip; yes this format is trash, but it's still a bigger default than much better stuff like .tar.gz...
        // yes i'm kinda sad about that now that i (sort-of) know how terrible it is :c
        // https://web.archive.org/web/20250118102842/https://games.greggman.com/game/zip-rant/
        const jsZip = new JSZip();
        wordBlobs.forEach((wb, i) => jsZip.file(`word-${i}.${opts.format}`, wb));
        if (combinedBlob) {
          jsZip.file(`word-combined.${opts.format}`, combinedBlob);
        }
        const zipFile = await jsZip.generateAsync({ type: 'blob' });
        FileSaver.saveAs(zipFile, 'sitemaketext-words.zip');
      }
    } finally {
      isExporting.value = false;
    }
  }, 500);
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

  #export-loader {
    display: none;
    transition: opacity 0.25s ease;
    opacity: 0;
    pointer-events: none;
    user-select: none;

    z-index: 20;
    position: absolute;
    inset: 0;
    background: #000c;

    font-size: 1.25rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &.visible {
      display: flex;
      opacity: 1;
    }
  }
}

#section-words {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  #button-reset {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    background: var(--smtx-panel);
    padding: 0.5rem;
    border-radius: 8px;
  }
  #button-add-word {
    background: var(--smtx-panel);
    padding: 0.25rem;
    margin: 0 1rem;
    height: fit-content;
    border-radius: 8px;
    align-self: center;
  }

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
    gap: 0 4px;
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
    button.animated:hover > * {
      transform: scale(1.1);
    }
    button.animated:active > * {
      transform: scale(0.9);
    }
  }
}

#export-settings-panel {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;

  width: fit-content;
  max-width: 14rem;

  border-radius: 8px;

  display: flex;
  flex-direction: column-reverse;
  justify-content: center;

  #button-toggle-export-settings {
    align-self: flex-end;
    padding: 0.5rem;
    background: var(--smtx-panel);
    border-radius: 8px;
    &.active {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
#export-settings-panel.collapsed {
  section {
    display: none;
  }
}

#word-properties-sidebar {
  width: 14rem;
  border-right: 4px dashed white;

  display: flex;
  flex-direction: column;
  align-items: center;

  #button-toggle-sidebar {
    display: none;
    padding: 0.5rem;
    background: var(--smtx-panel);
    border-radius: 8px;
    &.active {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}

.disabled {
  pointer-events: none;
  filter: brightness(0.625);
}

@media screen and (max-width: 1023px) {
  main {
    grid-template-columns: 1fr;
  }
  #section-words {
    #button-reset {
      left: unset;
      right: 0.5rem;
    }
  }
  #word-properties-sidebar {
    z-index: 10;
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    overflow: hidden;

    max-height: calc(100% - 1rem);
    align-items: flex-start;

    border: none;

    #button-toggle-sidebar {
      display: block;
    }
  }
  #word-properties-sidebar.collapsed {
    & > * {
      display: none;
    }
  }
}
</style>
