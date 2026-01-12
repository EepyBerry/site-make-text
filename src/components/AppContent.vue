<template>
  <main>
    <!-- export "loader" -->
    <div id="export-loader" :class="{ visible: isExporting }">
      <StaticSprite width="5rem" sprite="wait" />
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
        <StaticSprite v-if="wordPropertiesToggle" width="2.5rem" sprite="properties-opened" />
        <StaticSprite v-else width="2.5rem" sprite="properties-closed" />
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

      <!-- spritesheet settings panel -->
      <div id="spritesheet-settings-panel" :class="{ collapsed: !spritesheetSettingsToggle }">
        <button
          id="button-toggle-spritesheet-settings"
          type="button"
          class="animated"
          :class="{ active: !!spritesheetSettingsToggle }"
          @click="toggleSpritesheetSettingsPanel"
          aria-label="Toggle spritesheet settings panel"
          title="Toggle spritesheet settings panel"
        >
          <StaticSprite v-if="spritesheetSettingsToggle" width="2.5rem" sprite="spritesheet-opened" />
          <StaticSprite v-else width="2.5rem" sprite="spritesheet-closed" />
        </button>
        <SpritesheetSettingsPanel @change="updateGridSize" />
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
          <StaticSprite v-if="gridSettingsToggle" width="2.5rem" sprite="grid-opened" />
          <StaticSprite v-else width="2.5rem" sprite="grid-closed" />
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
        <StaticSprite width="2.5rem" sprite="reset" />
      </button>

      <!-- export panel -->
      <div id="export-settings-panel" :class="{ collapsed: !exportSettingsToggle }">
        <button
          id="button-toggle-export-settings"
          type="button"
          class="animated"
          :class="{ active: !!exportSettingsToggle }"
          @click="toggleExportSettingsPanel"
          aria-label="Toggle export settings panel"
          title="Toggle export settings panel"
        >
          <StaticSprite v-if="exportSettingsToggle" width="2.5rem" sprite="export-opened" />
          <StaticSprite v-else width="2.5rem" sprite="export-closed" />
        </button>
        <ExportSettingsPanel @export="exportWords" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref, ref, type TemplateRef, useTemplateRef } from 'vue';
import {
  WordType,
  type DynamicSpriteProps,
  type ExportSettingsOptions,
  type Vector2,
  type WordGridExposes,
} from '@/core/types';
import WordPropertiesPanel from '@/components/panels/WordPropertiesPanel.vue';
import { EventBus } from '@/core/event-bus';
import ExportSettingsPanel from './panels/ExportSettingsPanel.vue';
import WordGridElement from './elements/WordGridElement.vue';
import GridSettingsPanel from './panels/GridSettingsPanel.vue';
import { exportWordData } from '@/core/helpers/export.helper';
import SpritesheetSettingsPanel from './panels/SpritesheetSettingsPanel.vue';

// main page refs
const sectionRef: TemplateRef<HTMLElement> = useTemplateRef('sectionRef');
const wordGridRef: TemplateRef<WordGridExposes> = useTemplateRef('wordGridRef');
const isExporting: Ref<boolean> = ref(false);

// compact mode & toggle refs
const compactMode: Ref<boolean> = ref(false);
const wordPropertiesToggle: Ref<boolean> = ref(false);
const spritesheetSettingsToggle: Ref<boolean> = ref(false);
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
    drawObject: false,
  },
  {
    x: 1,
    y: 1,
    word: 'is',
    color: '#ffffff',
    moreLettersOnTop: true,
    type: WordType.NOUN,
    crossedOut: false,
    drawObject: false,
  },
  {
    x: 2,
    y: 1,
    word: 'add',
    color: '#0ea4ad',
    moreLettersOnTop: true,
    type: WordType.PROPERTY,
    crossedOut: false,
    drawObject: false,
  },
]);
const wordGridDimensions: Ref<Vector2> = ref({ x: 3, y: 3 });
const selectedWord: Ref<DynamicSpriteProps | null> = ref(null);

// ----------------------------------------------------------------------------
// lifecycle

const checkCompactMode = () => (compactMode.value = window.innerWidth <= 1023);
const checkPointerTarget = (evt: Event) => {
  if ((evt.target as HTMLElement).id === 'section-words-scrollzone') {
    selectedWord.value = null;
    wordPropertiesToggle.value = false;
    spritesheetSettingsToggle.value = false;
    gridSettingsToggle.value = false;
    exportSettingsToggle.value = false;
    wordGridRef.value?.deselect();
  }
};
onMounted(() => {
  sectionRef.value!.addEventListener('pointerdown', checkPointerTarget);
  EventBus.registerWindowEventListener('resize', checkCompactMode);
  EventBus.registerWindowEventListener('deviceorientation', checkCompactMode);
  checkCompactMode();
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
  spritesheetSettingsToggle.value = false;
  gridSettingsToggle.value = false;
  exportSettingsToggle.value = false;
}
function toggleExportSettingsPanel() {
  exportSettingsToggle.value = !exportSettingsToggle.value;
  wordPropertiesToggle.value = false;
  spritesheetSettingsToggle.value = false;
  gridSettingsToggle.value = false;
}
function toggleGridSettingsPanel() {
  gridSettingsToggle.value = !gridSettingsToggle.value;
  wordPropertiesToggle.value = false;
  spritesheetSettingsToggle.value = false;
  exportSettingsToggle.value = false;
}
function toggleSpritesheetSettingsPanel() {
  spritesheetSettingsToggle.value = !spritesheetSettingsToggle.value;
  wordPropertiesToggle.value = false;
  gridSettingsToggle.value = false;
  exportSettingsToggle.value = false;
}

// ----------------------------------------------------------------------------
// word grid functions

function updateGridSize(size: Vector2) {
  wordGridDimensions.value.x = size.x;
  wordGridDimensions.value.y = size.y;
}

function handleGridSelect(word: DynamicSpriteProps) {
  selectedWord.value = word;
  wordPropertiesToggle.value = false;
  gridSettingsToggle.value = false;
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
  setTimeout(() => {
    const gridData = wordGridRef.value!.extractGridFrames(opts.scale);
    exportWordData(wordGridDimensions.value!, gridData, opts).finally(() => (isExporting.value = false));
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

    font-size: 1rem;

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
#spritesheet-settings-panel,
#grid-settings-panel,
#export-settings-panel {
  position: absolute;
  width: fit-content;
  border-radius: 8px;

  display: flex;
  justify-content: center;

  #button-toggle-export-settings,
  #button-toggle-spritesheet-settings,
  #button-toggle-grid-settings {
    padding: 0.5rem;
    background: var(--smtx-panel);
    border-radius: 8px;
  }
  &.collapsed section {
    display: none;
  }
}
#spritesheet-settings-panel {
  top: 1rem;
  left: 1rem;
  flex-direction: column;

  #button-toggle-spritesheet-settings {
    align-self: flex-start;
    &.active {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}
#grid-settings-panel {
  top: 1rem;
  left: 5.5rem;
  flex-direction: column;

  #button-toggle-grid-settings {
    align-self: flex-start;
    &.active {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}
#export-settings-panel {
  bottom: 1rem;
  right: 1rem;
  flex-direction: column-reverse;

  #button-toggle-export-settings {
    align-self: flex-end;
    &.active {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
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
  #spritesheet-settings-panel {
    z-index: 10;
    top: 1rem;
    left: 5.5rem;
  }
  #grid-settings-panel {
    z-index: 10;
    top: 1rem;
    left: 10rem;
  }
}
</style>
