import type { Ref } from "vue"
import { SPRITESHEET_WIDTH, REM_SIZE, SPRITESHEET_HEIGHT, SPRITESHEET_CELL_SIZE } from "./globals"

export function computeSpritesheetBackgroundSize(elWidth: string): number[] {
  const elWidthAsNumber: number = parseFloat(elWidth) * REM_SIZE
  const backgroundSizeX = (SPRITESHEET_WIDTH * elWidthAsNumber) / SPRITESHEET_CELL_SIZE
  const backgroundSizeY = (SPRITESHEET_HEIGHT * elWidthAsNumber) / SPRITESHEET_CELL_SIZE
  return [backgroundSizeX, backgroundSizeY]
}

export function computeSpritesheetBackgroundPosition(frameX: number, frameY: number, elWidth: string): number[] {
  const elWidthAsNumber: number = parseFloat(elWidth) * REM_SIZE
  const backgroundPositionX = (frameX * elWidthAsNumber) / SPRITESHEET_CELL_SIZE
  const backgroundPositionY = (frameY * elWidthAsNumber) / SPRITESHEET_CELL_SIZE
  return [backgroundPositionX, backgroundPositionY]
}

export function updateFrameIndex(current: Ref<number>): void {
  current.value++
  if (current.value === 3) current.value = 0
}
