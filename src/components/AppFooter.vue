<template>
  <footer id="smtx-footer">
    <div>
      <p>a smol web-toy by EepyBerry :3</p>
      <p>
        not affiliated with
        <a href="https://hempuli.com/baba/" target="_blank" rel="noreferrer noopener">[Baba Is You]</a>
        or its creators
      </p>
    </div>
    <ul id="footer-links">
      <li>
        <button type="button" class="animated" @click="openHelpDialog">
          <StaticSprite sprite="help" width="3rem" height="3rem" />
        </button>
      </li>
      <li>
        <a class="image-link" href="https://eepyberry.me" target="_blank" title="EepyBerry's website">
          <StaticSprite sprite="eepyberry" width="3rem" height="3rem" />
        </a>
      </li>
      <li>
        <a
          class="image-link"
          href="https://github.com/EepyBerry/site-make-text"
          target="_blank"
          title="GitHub project page"
        >
          <StaticSprite sprite="github" width="3rem" height="3rem" />
        </a>
      </li>
    </ul>
  </footer>
  <HelpDialog ref="helpDialogRef" />
</template>

<script setup lang="ts">
import { useTemplateRef, type TemplateRef } from 'vue';
import HelpDialog from './dialogs/HelpDialog.vue';
import StaticSprite from './elements/StaticSpriteElement.vue';
import type { DialogExposes } from '@/core/types';

const helpDialogRef: TemplateRef<DialogExposes> = useTemplateRef('helpDialogRef');

function openHelpDialog() {
  helpDialogRef.value!.open()
}
</script>

<style lang="scss">
#smtx-footer {
  z-index: 5;
  padding: 1rem;
  background: transparent;
  border-top: 4px dashed white;

  font-size: 0.875rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  #footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    a:hover .sprite {
      cursor: pointer;
      transform: scale(1.0625);
    }
    a:active .sprite {
      transform: scale(0.9);
    }
  }
}

@media screen and (max-width: 767px) {
  #smtx-footer {
    padding: 0.5rem;
    font-size: 0.75rem;
    gap: 0.5rem;

    #footer-links {
      gap: 0.5rem;
    }
  }
}
</style>
