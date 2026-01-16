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
        To help you get started, you can download an
        <button
          id="action-download-example-spritesheet"
          type="button"
          title="Download example spritesheet files (as .zip)"
          aria-label="Download example spritesheet files (as .zip)"
          @click="downloadExampleSpritesheet"
        >
          [example spritesheet + descriptor file]
        </button>
        as a starting point.
      </p>
      <p>Here is what a descriptor file looks like:</p>
      <ExampleJsonDescriptor id="example-json-descriptor" />
      <ul>
        <li><span style="color: #FF79C6">&quot;wordmap&quot;</span>: maps the typed words to the region names below</li>
        <li><span style="color: #FF79C6">&quot;regions&quot;</span>: contains every region as a collection of frames (min. 1 frame, max. 3 frames)</li>
        <li><span style="color: #FF79C6">&quot;sugar-cookie&quot;</span>: one region containing three frames; coordinates point to the top-leftmost pixel of this frame</li>
        <li><span style="color: #FF79C6">&quot;milk-glass&quot;</span>: another region pointing to three different frames</li>
      </ul>

      <div class="text-block">
        <p>
          After importing and enabling this example spritesheet, the words <span style="color: #BD93F9">&quot;cookie&quot;</span> and <span style="color: #BD93F9">&quot;milk&quot;</span>
          are now mapped to two sprites, as shown below next to their respective word:
        </p>
        <img src="/examples/example-cookie-milk.webp" alt="Words 'cookie' and 'milk' next to their respective sprites">
        <p>
          Now, you may be wondering what happens if we import a sprite for an existing word...
          and this is exactly what this example shows!
        </p>
        <p>
          This app has a number of default sprites as a little treat <span class="subscript">(can you find them all? :3)</span>,
          and <span style="color: #BD93F9">&quot;cookie&quot;</span> is one of them. In this case, the sprite that will be
          shown will be the one imported <i>last</i>, thus the one from the custom spritesheet.
        </p>
      </div>
      <div class="text-block">
        <p>Another, more advanced feature is the ability to use special tints to lighten/darken the selected color. You can see this above on the sprites.</p>
        <p>To do this, here is a small table with the exact values needed in your sprites, and their effect when the pixel is colored:</p>
        <table id="sprite-gradient-map-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Hex</th>
              <th>R</th>
              <th>G</th>
              <th>B</th>
              <th>A</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div class="color-block light"></div></td>
              <td>#dddddd</td>
              <td>221</td>
              <td>221</td>
              <td>221</td>
              <td>255</td>
              <td>Lightens the selected color by 30%</td>
            </tr>
            <tr>
              <td><div class="color-block exact"></div></td>
              <td>#aaaaaa</td>
              <td>170</td>
              <td>170</td>
              <td>170</td>
              <td>255</td>
              <td>Maps exactly to the selected color</td>
            </tr>
            <tr>
              <td><div class="color-block dark"></div></td>
              <td>#555555</td>
              <td>85</td>
              <td>85</td>
              <td>85</td>
              <td>255</td>
              <td>Darkens the selected color by 15%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <hr>
    <section id="help-credits">
      <header><StaticSprite width="7rem" height="1.5rem" sprite="text-credits" aria-label="Credits" /></header>
      <ul>
        <li><a href="https://hempuli.com" target="_blank" rel="noreferrer noopener nofollow">[Arvi "Hempuli" Teikari]</a>, creator of Baba Is You</li>
        <li><a href="https://github.com/ApeironTsuka/node-webpmux" target="_blank" rel="noreferrer noopener nofollow">[node-webpmux]</a>, WebP encoding library</li>
        <li><a href="https://github.com/mattdesl/gifenc" target="_blank" rel="noreferrer noopener nofollow">[gifenc]</a>, GIF encoding library</li>
        <li>All the people who helped me test this website &lt;3</li>
      </ul>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import type { DialogExposes } from '@/core/types';
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import ExampleJsonDescriptor from './ExampleJsonDescriptor.vue';

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

onMounted(() => {
  dialogRef.value?.addEventListener('click', handleClick)
});
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

  min-width: 50%;
  max-width: 60%;
  min-height: 5.5rem;
  max-height: 90%;

  background: var(--smtx-panel);
  border: 1px solid var(--smtx-primary);
  border-radius: 4px;
  box-shadow: 0 0 16px #000;
  color: inherit;
  font-size: 0.875rem;

  display: flex;
  flex-direction: column;
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

  // native element overrides
  section > header {
    margin-bottom: 0.5rem;
  }
  hr {
    border: 2px dashed #fff;
    margin: 2rem 0;
  }
  ul { list-style-type: '- '; }
}
dialog[open] {
  opacity: 1;
  visibility: visible;
  pointer-events: all;
}
dialog::backdrop {
  background: #0008;
}

#example-json-descriptor {
  margin: 0.5rem auto;
}

#spritesheet-file-explanations {
  max-width: 800px;
  margin: 1.5rem auto;

  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-items: center;
  justify-content: center;
  gap: 2rem;

  .file-explanation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
#sprite-gradient-map-table {
  margin-top: 0.5rem;
  table-layout: fixed;
  border: 1px solid var(--smtx-primary);
  border-collapse: collapse;

  tr td, th {
    padding: 0 0.5rem;
    border: 1px solid var(--smtx-primary);
  }
  th {
    text-align: start;
    background: var(--smtx-primary);
  }
  tr td:first-child {
    padding: 0;
    width: 64px;
  };
  tr td:nth-child(2) {
    width: 64px;
  };
  tr td:nth-child(3),
  tr td:nth-child(4),
  tr td:nth-child(5),
  tr td:nth-child(6) {
    width: 5ch;
  };
}

.text-block {
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  img {
    margin: 0.5rem auto;
    max-width: 100%;
  }
}
.text-block:last-of-type {
  margin-bottom: 0;
}
.subscript { font-size: 0.675rem; color: #888; }
.color-block {
  width:64px;
  height: 2rem;
  &.light { background: #dddddd;}
  &.exact { background: #aaaaaa;}
  &.dark { background: #555555;}
}

@media screen and (max-width: 1199px) {
  dialog {
    max-width: 80%;
  }
}
@media screen and (max-width: 767px) {
  dialog {
    width: 100%;
    max-width: calc(100% - 2rem);
  }
  div#spritesheet-file-explanations {
    grid-template-columns: auto;
    margin: 1.5rem;
  }
}
</style>
