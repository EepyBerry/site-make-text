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
        @click="togglePropertiesPanel()"
        aria-label="Toggle word properties panel"
        title="Toggle word properties panel"
      >
        <StaticSprite v-if="wordPropertiesToggle" width="2.5rem" sprite="icon-properties-opened" />
        <StaticSprite v-else width="2.5rem" sprite="icon-properties-closed" />
      </button>
      <WordPropertiesPanel :show-hint="!selectedWord" v-model="selectedWord" />
    </aside>

    <!-- main section -->
    <section id="section-words">
      <div ref="sectionRef" id="section-words-scrollzone">
        <!-- main content -->
         <WordGridElement
          ref="wordGridRef"
          id="word-grid"
          v-model="words"
          :width="wordGridDimensions.x"
          :height="wordGridDimensions.y"
          @select="handleGridSelect"
          @delete="handleGridDelete"
        />
      </div>

      <!-- grid settings panel -->
      <div id="grid-settings-panel" :class="{ collapsed: !gridSettingsToggle }">
        <button
          id="button-toggle-grid-settings"
          type="button"
          class="animated"
          :class="{ active: !!gridSettingsToggle }"
          @click="toggleGridSettingsPanel"
          aria-label="Toggle grid settings panel"
          title="Toggle grid settings panel"
        >
          <StaticSprite v-if="gridSettingsToggle" width="2.5rem" sprite="icon-grid-opened" />
          <StaticSprite v-else width="2.5rem" sprite="icon-grid-closed" />
        </button>
        <GridSettingsPanel @change="updateGridSize" />
      </div>

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
  onBeforeMount,
  onMounted,
  type Ref,
  ref,
  type TemplateRef,
  useTemplateRef,
} from 'vue';
import {
  WordType,
  type DynamicSpriteProps,
  type ExportSettingsOptions,
  type Vector2,
  type WordGridExposes,
} from '@/types';
import WordPropertiesPanel from '@/components/panels/WordPropertiesPanel.vue';
import { EventBus } from '@/core/event-bus';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import GIFImageDataEncoder from '@/core/encoders/gif.encoder';
import WebPImageDataEncoder from '@/core/encoders/webp.encoder';
import { SPRITESHEET_CELL_SIZE } from '@/core/globals';
import { combineCanvasData } from '@/core/helpers/canvas.helper';
import ExportSettingsPanel from './panels/ExportSettingsPanel.vue';
import { clamp } from '@/core/utils/math.utils';
import WordGridElement from './elements/WordGridElement.vue';
import GridSettingsPanel from './panels/GridSettingsPanel.vue';

// main page refs
const sectionRef: TemplateRef<HTMLElement> = useTemplateRef('sectionRef');
const wordGridRef: TemplateRef<WordGridExposes> = useTemplateRef('wordGridRef');
const isExporting: Ref<boolean> = ref(false);

// compact mode & toggle refs
const compactMode: Ref<boolean> = ref(false);
const wordPropertiesToggle: Ref<boolean> = ref(false);
const gridSettingsToggle: Ref<boolean> = ref(false);
const exportSettingsToggle: Ref<boolean> = ref(false);

// word refs (3x3 grid by default)
const words: Ref<DynamicSpriteProps[]> = ref([
  {
    x: 0,
    y: 1,
    word: 'plus',
    color: '#0ea4ad',
    moreLettersOnTop: true,
    type: WordType.NOUN,
    crossedOut: false,
  },
  {
    x: 1,
    y: 1,
    word: 'is',
    color: '#ffffff',
    moreLettersOnTop: true,
    type: WordType.NOUN,
    crossedOut: false
  },
  {
    x: 2,
    y: 1,
    word: 'add',
    color: '#0ea4ad',
    moreLettersOnTop: true,
    type: WordType.PROPERTY,
    crossedOut: false,
  },
]);
const wordGridDimensions: Ref<Vector2> = ref({x: 3, y: 3})
const selectedWord: Ref<DynamicSpriteProps|null> = ref(null);

// ----------------------------------------------------------------------------
// lifecycle

const checkCompactMode = () => (compactMode.value = window.innerWidth <= 1023);
const checkPointerTarget = (evt: Event) => {
  if ((evt.target as HTMLElement).id === 'section-words-scrollzone') {
    selectedWord.value = null;
    wordPropertiesToggle.value = false;
    gridSettingsToggle.value = false;
    exportSettingsToggle.value = false;
    wordGridRef.value?.deselect();
  }
};
onMounted(() => {
  sectionRef.value!.addEventListener('pointerdown', checkPointerTarget);
  EventBus.registerWindowEventListener('resize', checkCompactMode);
  EventBus.registerWindowEventListener('deviceorientation', checkCompactMode);
  checkCompactMode()
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
    wordPropertiesToggle.value  = !wordPropertiesToggle.value;
  }
  gridSettingsToggle.value = false;
  exportSettingsToggle.value = false;
}
function toggleExportSettingsPanel() {
  exportSettingsToggle.value = !exportSettingsToggle.value;
  wordPropertiesToggle.value = false;
  gridSettingsToggle.value = false;
}
function toggleGridSettingsPanel() {
  gridSettingsToggle.value = !gridSettingsToggle.value;
  wordPropertiesToggle.value = false;
  exportSettingsToggle.value = false;
}

// ----------------------------------------------------------------------------
// word grid functions

function updateGridSize(size: Vector2) {
  wordGridDimensions.value.x = size.x
  wordGridDimensions.value.y = size.y
}

function handleGridSelect(word: DynamicSpriteProps) {
  selectedWord.value = word;
  wordPropertiesToggle.value = false;
  exportSettingsToggle.value = false;
}

function handleGridDelete() {
  selectedWord.value = null;
  wordPropertiesToggle.value = false;
  exportSettingsToggle.value = false;
}

function resetWords() {
  words.value.splice(0);
  selectedWord.value = null;
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
  flex: 1;
  position: relative;
  overflow: hidden;
  background: transparent;

  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: auto 1fr;

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
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;

  #button-reset {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--smtx-panel);
    padding: 0.5rem;
    border-radius: 8px;
  }

  #section-words-scrollzone {
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: auto;

    display: flex;
    align-items: center;
  }

  .sprite.caret {
    transform: none;
    pointer-events: none;
    cursor: default;
    position: absolute;
    top: -100%;
  }
}

#grid-settings-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;

  width: fit-content;
  max-width: 14rem;

  border-radius: 8px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  #button-toggle-grid-settings {
    align-self: flex-start;
    padding: 0.5rem;
    background: var(--smtx-panel);
    border-radius: 8px;
    &.active {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}

#export-settings-panel {
  position: absolute;
  bottom: 1rem;
  right: 1rem;

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
#grid-settings-panel.collapsed, #export-settings-panel.collapsed {
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

@media screen and (max-width: 1023px) {
  main {
    grid-template-columns: 1fr;
  }
  #word-properties-sidebar {
    z-index: 10;
    position: absolute;
    top: 1rem;
    left: 1rem;
    overflow: hidden;

    max-height: calc(100% - 1rem);
    align-items: flex-start;

    border: none;

    #button-toggle-sidebar {
      display: block;
    }
  }
  #word-properties-sidebar.collapsed {
    width: fit-content;
    & > * {
      display: none;
    }
  }
  #grid-settings-panel {
    z-index: 10;
    top: 1rem;
    left: 5.5rem;
  }
}
</style>
