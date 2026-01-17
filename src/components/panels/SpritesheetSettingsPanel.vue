<template>
  <section id="spritesheet-settings">
    <StaticSprite width="2.5rem" height="2.5rem" sprite="spritesheet-image" />
    <FileInputElement
      pid="setting-spritesheet-file"
      accept="image/*"
      internal-title="Import the spritesheet image"
      internal-aria-label="Import the spritesheet image"
      @change="handleSpritesheetFile"
      >Import&nbsp;file...</FileInputElement
    >
    <StaticSprite
      v-if="spritesheetSettings.usermadeFile"
      class="file-indicator"
      width="2rem"
      height="2rem"
      sprite="check"
    />
    <StaticSprite v-else class="file-indicator" width="2rem" height="2rem" sprite="cross" />

    <StaticSprite width="2.5rem" height="2.5rem" sprite="spritesheet-descriptor" />
    <FileInputElement
      pid="setting-descriptor"
      accept="application/json"
      @change="handleDescriptorFile"
      internal-title="Import the spritesheet descriptor file"
      internal-aria-label="Import the spritesheet descriptor file"
      >Import&nbsp;file...</FileInputElement
    >
    <StaticSprite
      v-if="spritesheetSettings.usermadeDescriptor"
      class="file-indicator"
      width="2rem"
      height="2rem"
      sprite="check"
    />
    <StaticSprite v-else class="file-indicator" width="2rem" height="2rem" sprite="cross" />

    <StaticSprite width="2.5rem" height="2.5rem" sprite="spritesheet-type" />
    <RadioElement id="object-spritesheet-toggle">
      <RadioOptionElement
        v-model="spritesheetSettings.enableUsermadeObjects"
        pid="setting-spritesheet"
        id="default-only"
        :value="false"
        internal-aria-label="Use default object spritesheet only"
        internal-title="Use default object spritesheet only"
        @select="setEnableUsermadeObjectSpritesheet(false)"
      >
        <StaticSprite width="2.5rem" height="2.5rem" sprite="off" />
      </RadioOptionElement>
      <RadioOptionElement
        v-model="spritesheetSettings.enableUsermadeObjects"
        pid="setting-spritesheet"
        id="default-with-custom"
        :value="true"
        internal-aria-label="Use custom spritesheet; overrides default sprites"
        internal-title="Use custom spritesheet; overrides default sprites"
        @select="setEnableUsermadeObjectSpritesheet(true)"
      >
        <StaticSprite width="2.5rem" height="2.5rem" sprite="on" />
      </RadioOptionElement>
    </RadioElement>
  </section>
</template>
<script setup lang="ts">
import type { JsonSpritesheetDescriptor, SpritesheetSettingsOptions } from '@/core/types';
import { ref, type Ref } from 'vue';
import RadioElement from '@/components/elements/RadioElement.vue';
import RadioOptionElement from '@/components/elements/RadioOptionElement.vue';
import {
  loadUsermadeObjectSpritesheet,
  removeUsermadeObjectSprites,
  setEnableUsermadeObjectSpritesheet,
} from '@/core/helpers/spritesheet.helper';
import { JsonSpritesheetDescriptorSchema } from '@/core/zod-schemas';
import type { ZodError } from 'zod';
import FileInputElement from '../elements/FileInputElement.vue';

const spritesheetSettings: Ref<SpritesheetSettingsOptions> = ref({
  usermadeFile: undefined,
  usermadeDescriptor: undefined,
  enableUsermadeObjects: false,
});
defineEmits(['sreload', 'schange']);

async function handleSpritesheetFile(file: File) {
  if (!file) return;
  spritesheetSettings.value.usermadeFile = file;
  checkSpritesheetValidity();
}

async function handleDescriptorFile(file: File) {
  if (!file) return;
  const descriptorFile: File = file;
  const jsonData = JSON.parse(await descriptorFile.text());

  // Check descriptor file structure before proceeding
  try {
    const validatedDescriptor: JsonSpritesheetDescriptor = JsonSpritesheetDescriptorSchema.parse(
      jsonData,
    ) as JsonSpritesheetDescriptor;
    spritesheetSettings.value.usermadeDescriptor = validatedDescriptor;
    checkSpritesheetValidity();
  } catch (error) {
    console.error((error as ZodError).issues);
    spritesheetSettings.value.usermadeDescriptor = undefined;
    removeUsermadeObjectSprites();
  }
}

function checkSpritesheetValidity() {
  if (!spritesheetSettings.value.usermadeFile || !spritesheetSettings.value.usermadeDescriptor) {
    removeUsermadeObjectSprites();
    return;
  }
  loadUsermadeObjectSpritesheet(spritesheetSettings.value.usermadeFile!, spritesheetSettings.value.usermadeDescriptor!);
}
</script>
<style lang="scss">
#spritesheet-settings {
  width: 100%;
  padding: 0.5rem;
  background: var(--smtx-panel);
  border-radius: 8px;
  border-top-left-radius: 0;

  display: grid;
  grid-template-columns: 3rem 1fr auto;
  grid-template-rows: repeat(2, auto);
  align-items: center;
  gap: 1rem 0;

  input {
    width: 100%;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 2px;
  }
  #object-spritesheet-toggle {
    grid-column: 2 / span 2;
  }
  p {
    width: 3ch;
    align-self: center;
    padding-left: 8px;

    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
  }
}

.file-indicator {
  margin-left: 8px;
}
</style>
