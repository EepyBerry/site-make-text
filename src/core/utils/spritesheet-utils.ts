import type { Ref } from 'vue';
import { MAIN_SPRITESHEET_WIDTH, REM_SIZE, MAIN_SPRITESHEET_HEIGHT, SPRITESHEET_CELL_SIZE, SPECIAL_OBJECT_WORD_MAP } from '@/core/globals';
import type { DynamicSpriteProps } from '../types';

export function computeMainSpritesheetBackgroundSize(elWidth: string): number[] {
  const elWidthAsNumber: number = parseFloat(elWidth) * REM_SIZE;
  const backgroundSizeX = (MAIN_SPRITESHEET_WIDTH * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  const backgroundSizeY = (MAIN_SPRITESHEET_HEIGHT * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  return [backgroundSizeX, backgroundSizeY];
}

export function computeSpritesheetBackgroundPosition(frameX: number, frameY: number, elWidth: string): number[] {
  const elWidthAsNumber: number = parseFloat(elWidth) * REM_SIZE;
  const backgroundPositionX = (frameX * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  const backgroundPositionY = (frameY * elWidthAsNumber) / SPRITESHEET_CELL_SIZE;
  return [backgroundPositionX, backgroundPositionY];
}

export function updateFrameIndex(current: Ref<number>): void {
  current.value++;
  if (current.value === 3) current.value = 0;
}
export function updateRawFrameIndex(index: number): number {
  index++;
  if (index === 3) index = 0;
  return index;
}

export function isWordSpecial(dsp?: DynamicSpriteProps | null | undefined) {
  return SPECIAL_OBJECT_WORD_MAP[dsp?.word ?? ''] !== undefined
}
export function getWordObject(word: string): string {
  return SPECIAL_OBJECT_WORD_MAP[word]!.toLowerCase()
}
