export const MAIN_SPRITESHEET_WIDTH = 648;
export const MAIN_SPRITESHEET_HEIGHT = 216;
export const OBJECT_SPRITESHEET_WIDTH = 216;
export const OBJECT_SPRITESHEET_HEIGHT = 216;
export const SPRITESHEET_CELL_SIZE = 24;
export const REM_SIZE = parseFloat(getComputedStyle(document.documentElement).fontSize);

export const FRAME_DURATION_MS = 225;
export const SPECIAL_OBJECT_WORD_MAP: Record<string, string> = {
  babaj: 'babaj',
  blahaj: 'babaj',
  eye: 'prunsel',
  prunsel: 'prunsel',
  lips: 'lips',
  poop: 'poop',
  cookie: 'cookie',
  cat: 'cat',
  kitty: 'cat',
  onigiri: 'onigiri',
  coffee: 'tea',
  tea: 'tea',
  trans: 'trans',
  chip: 'chip',
  circuit: 'chip',
  triangle: 'triangle',
  penrose: 'triangle',
  meta: 'meta',
  this: 'meta',
  berry: 'berry',
  goose: 'goose',
};
