<template>
  <dialog ref="dialogRef" id="dialog-help" closedby="any">
    <button class="action-close animated" @click="dialogRef!.close()" autofocus>
      <StaticSprite width="2.5rem" height="2.5rem" sprite="close" />
    </button>
    <section id="help-controls">
      <header><StaticSprite width="8rem" height="1.5rem" sprite="text-controls" aria-label="Controls" /></header>
    </section>
    <hr>
    <section id="help-spritesheets">
      <header><StaticSprite width="12rem" height="1.5rem" sprite="text-spritesheets" aria-label="Spritesheets" /></header>
      <p>You can import a custom object spritesheet to suit your needs. To do this, you need <i>two</i> files:</p>
      <div id="spritesheet-file-explanations">
        <div class="file-explanation">
          <StaticSprite width="3.5rem" height="3.5rem" sprite="spritesheet-image" />
          <span>An image of your sprites, arranged as a grid of <strong>24px·24px</strong> cells (.png, .webp,...)</span>
        </div>
        <div class="file-explanation">
          <StaticSprite width="3.5rem" height="3.5rem" sprite="spritesheet-descriptor" />
          <span>A "descriptor" file containing the sizes and positions of your sprites (.json)</span>
        </div>
      </div>
      <p>
        To help you get started, you can download an example spritesheet + descriptor file
        <button
          id="action-download-example-spritesheet"
          type="button"
          title="Download example spritesheet files (as .zip)"
          aria-label="Download example spritesheet files (as .zip)"
          @click="downloadExampleSpritesheet"
        >
          by clicking here!
        </button>
      </p>
    </section>
    <hr>
    <section id="help-credits">
      <header><StaticSprite width="7rem" height="1.5rem" sprite="text-credits" aria-label="Credits" /></header>
      <ul>
        <li><a href="https://hempuli.com" target="_blank" rel="noreferrer noopener nofollow">Arvi "Hempuli" Teikari</a>, creator of Baba Is You</li>
        <li><a href="https://github.com/ApeironTsuka/node-webpmux" target="_blank" rel="noreferrer noopener nofollow">node-webpmux</a>, WebP encoding library</li>
        <li><a href="https://github.com/mattdesl/gifenc" target="_blank" rel="noreferrer noopener nofollow">gifenc</a>, GIF encoding library</li>
        <li>All the people who helped me test this website &lt;3</li>
      </ul>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import type { DialogExposes } from '@/core/types';
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';

const dialogRef = useTemplateRef('dialogRef');
const handleClick = (evt: Event) => {
  if (!evt.target) {
    dialogRef.value!.close();
    return;
  }
  if (!dialogRef.value!.contains(evt.target as HTMLElement) ) {
    dialogRef.value!.close();
  }
};

onMounted(() =>  dialogRef.value?.addEventListener('click', handleClick));
onBeforeUnmount(() => dialogRef.value?.removeEventListener('click', handleClick));
defineExpose<DialogExposes>({ open })

function open() {
  dialogRef.value!.showModal()
}

function downloadExampleSpritesheet() {
  // TODO
}
</script>

<style lang="scss">
dialog {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;

  position: fixed;
  padding: 1.5rem;
  margin: auto;

  min-width: 50dvw;
  max-width: 75dvw;
  min-height: 5.5rem;

  background: var(--smtx-panel);
  border: 1px solid var(--smtx-primary);
  border-radius: 4px;
  box-shadow: 0 0 16px #000;
  color: inherit;

  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;

  button.action-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }
  button#action-download-example-spritesheet {
    display: inline;
    color: var(--smtx-link);
    font-size: inherit;
    &:hover { filter: brightness(1.25); }
  }

  section > header {
    margin-bottom: 0.5rem;
  }
  hr {
    border: 2px dashed #fff;
    margin: 2rem 0;
  }
}
dialog[open] {
  opacity: 1;
  visibility: visible;
  pointer-events: all;
}
dialog::backdrop {
  background: #0008;
}

div#spritesheet-file-explanations {
  max-width: 800px;
  margin: 0.5rem auto 1.5rem;

  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-items: center;
  justify-content: center;
  gap: 2rem;

  .file-explanation {
    display: grid;
    grid-template-columns: 2rem auto;
    align-items: center;
    justify-items: center;
    justify-content: center;
    gap: 1rem;
  }
}

@media screen and (max-width: 767px) {
  dialog {
    width: 100%;
    max-width: calc(100% - 2rem);
  }
}
</style>
