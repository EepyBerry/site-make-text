<template>
  <div id="word-grid" class="grid">
    <div id="inner-grid">
      <template v-for="_,y of height" :key="y">
        <template v-for="_,x of width" :key="x">
          <button
            v-if="!!getGridElement($model, x, y)"
            ref="wordElementRefs"
            :id="`button-word-${x}-${y}`"
            type="button"
            class="animated"
            @click="selectWord($event.target!, x, y)"
            :aria-label="'word: ' + getGridElement($model, x, y)?.word"
            title="Edit word"
          >
            <DynamicSprite
              ref="wordSpriteRefs"
              :word="getGridElement($model, x, y)?.word"
              :color="getGridElement($model, x, y)?.color"
              :type="getGridElement($model, x, y)?.type"
              :more-letters-on-top="getGridElement($model, x, y)?.moreLettersOnTop"
              :crossed-out="getGridElement($model, x, y)?.crossedOut"
              width="5rem"
              :class="{ empty: getGridElement($model, x, y)?.word?.length === 0 }"
            />
          </button>
          <span v-else>
            <button
              type="button"
              class="action-add animated"
              @click="addWord(x, y)"
              aria-label="Add new word"
              title="Add new word"
            >
              <StaticSprite width="2rem" sprite="icon-plus" />
            </button>
          </span>
        </template>
      </template>
    </div>

    <!-- floating element -->
    <div
      v-show="isZeroOrPositive(selectedWordCoords.x)"
      ref="gridCellActionsElementRef"
      id="word-actions-panel"
      :style="floatingStyles"
    >
      <div id="word-actions-container">
        <button
          type="button"
          id="action-delete"
          class="animated"
          aria-label="Delete word"
          title="Delete word"
          @click="deleteSelectedWord"
        >
          <StaticSprite width="3rem" sprite="icon-trash" />
        </button>
        <button
          v-show="isBetween(selectedWordCoords.x, 1, width)"
          type="button"
          id="action-move-left"
          class="animated"
          aria-label="Move word left (if possible)"
          title="Move word left (if possible)"
          @click="moveSelectedWord(-1, 0)"
        >
          <StaticSprite width="3rem" sprite="icon-left" />
        </button>
        <button
          v-show="isBetween(selectedWordCoords.y, 1, height)"
          type="button"
          id="action-move-up"
          class="animated"
          aria-label="Move word up (if possible)"
          title="Move word up (if possible)"
          @click="moveSelectedWord(0, -1)"
        >
          <StaticSprite width="3rem" sprite="icon-up" />
        </button>
        <button
          v-show="isBetween(selectedWordCoords.x, 0, width-2)"
          type="button"
          id="action-move-right"
          class="animated"
          aria-label="Move word right (if possible)"
          title="Move word right (if possible)"
          @click="moveSelectedWord(1, 0)"
        >
          <StaticSprite width="3rem" sprite="icon-right" />
        </button>
        <button
          v-show="isBetween(selectedWordCoords.y, 0, height-2)"
          type="button"
          id="action-move-down"
          class="animated"
          aria-label="Move word down (if possible)"
          title="Move word down (if possible)"
          @click="moveSelectedWord(0, 1)"
        >
          <StaticSprite width="3rem" sprite="icon-down" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getGridElement, getGridElementIndex, isBetween, isZeroOrPositive } from '@/core/utils/math.utils';
import { WordType, type DynamicSpriteProps, type Vector2 } from '@/types';
import { useFloating, offset, autoUpdate } from '@floating-ui/vue';
import { ref, useTemplateRef, type Ref, type TemplateRef } from 'vue';

// vue component data
withDefaults(defineProps<{
  width?: number,
  height?: number
}>(), {
  width: 3,
  height: 3
})
const $model = defineModel<DynamicSpriteProps[]>()
const $emit = defineEmits(['select', 'move', 'delete', 'delete-row', 'delete-column'])
defineExpose({ deselect })

// component refs
const selectedWordCoords: Ref<Vector2> = ref({ x: -1, y: -1 })
const selectedWordHtml: Ref<HTMLElement|null> = ref(null)

// floating-ui refs
const floatingActionsHtmlRef: TemplateRef<HTMLElement> = useTemplateRef('gridCellActionsElementRef');
const { floatingStyles, update } = useFloating(selectedWordHtml, floatingActionsHtmlRef, {
  placement: 'top',
  middleware: [
    offset(({rects}) => -rects.reference.height/2 - rects.floating.height/2)
  ],
  whileElementsMounted: autoUpdate,
});

// ----------------------------------------------------------------------------
// grid functions

function addWord(x: number, y: number): void {
  $model.value!.push({
    x,
    y,
    word: '',
    color: '#ffffff',
    type: WordType.NOUN,
    moreLettersOnTop: true,
    crossedOut: false,
  });
  setTimeout(() => selectWord(document.getElementById(`button-word-${x}-${y}`)!, x, y))
}

function selectWord(htmlTarget: EventTarget|HTMLElement, x: number, y: number): void {
  selectedWordCoords.value = { x, y };
  selectedWordHtml.value = htmlTarget as HTMLElement;
  floatingActionsHtmlRef.value!.focus();
  update();
  $emit('select', getGridElement($model.value, x, y));
}

function moveSelectedWord(dx: number, dy: number) {
  const wordData = getGridElement($model.value, selectedWordCoords.value.x!, selectedWordCoords.value.y!)!
  const maybeWordOnTargetPos = getGridElement($model.value, selectedWordCoords.value.x! + dx, selectedWordCoords.value.y! + dy)
  if (maybeWordOnTargetPos) {
    maybeWordOnTargetPos.x = selectedWordCoords.value.x!
    maybeWordOnTargetPos.y = selectedWordCoords.value.y!
  }

  wordData.x = selectedWordCoords.value.x! + dx
  wordData.y = selectedWordCoords.value.y! + dy
  setTimeout(() => selectWord(document.getElementById(`button-word-${wordData.x}-${wordData.y}`)!, wordData.x!, wordData.y!))
}

function deleteSelectedWord() {
  const elemIdx = getGridElementIndex($model.value, selectedWordCoords.value.x!, selectedWordCoords.value.y!);
  if (elemIdx < 0) return;

  $model.value?.splice(elemIdx, 1);
  deselect();
  $emit('delete');
}

function deselect(): void {
  selectedWordCoords.value = { x: -1, y: -1 };
  selectedWordHtml.value = null;
  floatingActionsHtmlRef.value!.blur();
}
</script>

<style lang="scss">
#word-grid {
  margin: auto;
  padding: 4rem;
}
#inner-grid {
  --width: v-bind(width);
  --height: v-bind(height);
  border-top: 1px dashed var(--smtx-grid-border);
  border-left: 1px dashed var(--smtx-grid-border);

  display: grid;
  grid-template-columns: repeat(var(--width), 5.5rem);
  grid-template-rows: repeat(var(--height), 5.5rem);

  & > * {
    width: 5.5rem;
    height: 5.5rem;
    border-right: 1px dashed var(--smtx-grid-border);
    border-bottom: 1px dashed var(--smtx-grid-border);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-add {
    align-self: center;
    width: 100%;
    height: 100%;
    padding: 4px;

    opacity: 0.25;
    border-radius: 8px;

    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 1;
    }
  }
}

#word-actions-panel {
  padding: 0.25rem;
  border-radius: 8px;
  pointer-events: none;

  #word-actions-container {
    position: relative;
    display: grid;
    grid-template-columns: 3.5rem 6rem 3.5rem;
    grid-template-rows: 3.5rem 6rem 3.5rem;
    pointer-events: none;

    button {
      filter: drop-shadow(0 0 8px #0008);
      pointer-events: all;
    }
    button[id^='action-move-'] {
      height: 3.5rem;
      width: 3.5rem;
      background: var(--smtx-panel);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #action-move-left {
      grid-column: 1;
      grid-row: 2;
      align-self: center;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }
    #action-move-right {
      grid-column: 3;
      grid-row: 2;
      align-self: center;
      border-top-right-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    #action-move-up {
      grid-column: 2;
      grid-row: 1;
      justify-self: center;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }
    #action-move-down {
      grid-column: 2;
      grid-row: 3;
      justify-self: center;
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    #action-delete {
      position: absolute;
      background: var(--smtx-panel);
      padding: 4px;
      border-radius: 8px;
      top: 0;
      right: 0;
    }
  }
}
</style>
