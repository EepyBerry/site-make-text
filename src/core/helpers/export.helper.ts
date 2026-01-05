import type { DynamicSpriteFrameData, ExportSettingsOptions, Vector2 } from '@/types';
import { SPRITESHEET_CELL_SIZE } from '../globals';
import { clamp } from '../utils/math.utils';
import GIFImageDataEncoder from '../encoders/gif.encoder';
import WebPImageDataEncoder from '../encoders/webp.encoder';
import FileSaver from 'file-saver';
import JSZip from 'jszip';

export async function exportWordData(
  gridDimensions: Vector2,
  wordData: DynamicSpriteFrameData[],
  opts: ExportSettingsOptions,
) {
  const outputScale = clamp(opts.scale, 1, 5);
  const scaledCellSize = outputScale * SPRITESHEET_CELL_SIZE;
  const scaledGridDimensions: Vector2 = {
    x: gridDimensions.x! * scaledCellSize,
    y: gridDimensions.y! * scaledCellSize,
  };

  // init encoders
  const gifEncoder = new GIFImageDataEncoder();
  const webpEncoder = new WebPImageDataEncoder();

  // PHASE 1 - encode words to target format (separate or combined)
  const encodedBlobs: Blob[] = [];
  if (opts.combinedOnly) {
    const blob = await _encodeCombinedGridBlob(
      gifEncoder,
      webpEncoder,
      wordData,
      opts,
      scaledGridDimensions,
      scaledCellSize,
    );
    encodedBlobs.push(blob);
  } else {
    const blobs = await _encodeSeparateWordBlobs(gifEncoder, webpEncoder, wordData, opts, scaledCellSize);
    encodedBlobs.push(...blobs);
  }

  // PHASE 2 - export using file-saved + jszip (when needed)
  await _doExport(encodedBlobs, opts.format);
}

// ----------------------------------------------------------------------------
// combined encoding

async function _encodeCombinedGridBlob(
  gifEncoder: GIFImageDataEncoder,
  webpEncoder: WebPImageDataEncoder,
  wordData: DynamicSpriteFrameData[],
  opts: ExportSettingsOptions,
  scaledGridDimensions: Vector2,
  scaledCellSize: number,
): Promise<Blob> {
  // Combine frames
  const combinedFrames: ImageData[] = Array<ImageData | null>(3)
    .fill(null)
    .map((_, frameIdx) => _combineWordDataOnCanvas(wordData, scaledGridDimensions, scaledCellSize, frameIdx));
  // Encode using the given format (.gif or .webp)
  if (opts.format === 'gif') {
    const encoded = gifEncoder.encode(combinedFrames, scaledGridDimensions.x!, scaledGridDimensions.y!);
    return new Blob([encoded], { type: 'image/gif' });
  } else {
    const encoded = await webpEncoder.encodeAsync(combinedFrames, scaledGridDimensions.x!, scaledGridDimensions.y!);
    return new Blob([encoded], { type: 'image/webp' });
  }
}

function _combineWordDataOnCanvas(
  wordData: DynamicSpriteFrameData[],
  scaledGridDimensions: Vector2,
  scaledCellSize: number,
  frameIndex: number,
): ImageData {
  console.log(
    `<SiteMakeText> Creating canvas of size [${scaledGridDimensions.x}, ${scaledGridDimensions.y}] -> frame ${frameIndex}`,
  );

  // Create the target canvas
  const canvas: OffscreenCanvas = new OffscreenCanvas(scaledGridDimensions.x!, scaledGridDimensions.y!);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot combine canvas data: context was not properly initialized');

  // Place individual frame data on the canvas
  const offsets: Vector2 = { x: 0, y: 0 };
  for (let i = 0; i < wordData.length; i++) {
    if (wordData[i]!.frames.length === 0) continue;
    offsets.x = scaledCellSize * wordData[i]!.x!;
    offsets.y = scaledCellSize * wordData[i]!.y!;
    ctx.putImageData(wordData[i]!.frames[frameIndex]!, offsets.x, offsets.y);
  }
  return ctx.getImageData(0, 0, scaledGridDimensions.x!, scaledGridDimensions.y!);
}

// ----------------------------------------------------------------------------
// separate encoding

async function _encodeSeparateWordBlobs(
  gifEncoder: GIFImageDataEncoder,
  webpEncoder: WebPImageDataEncoder,
  wordData: DynamicSpriteFrameData[],
  opts: ExportSettingsOptions,
  scaledOutputSize: number,
) {
  const wordBlobs: Blob[] = [];
  for (let r = 0; r < wordData.length; r++) {
    if (wordData[r]!.frames.length === 0) continue;
    if (opts.format === 'gif') {
      const encoded = gifEncoder.encode(wordData[r]!.frames, scaledOutputSize, scaledOutputSize);
      wordBlobs.push(new Blob([encoded], { type: 'image/gif' }));
    } else if (opts.format === 'webp') {
      const encoded = await webpEncoder.encodeAsync(wordData[r]!.frames, scaledOutputSize, scaledOutputSize);
      wordBlobs.push(new Blob([encoded], { type: 'image/webp' }));
    }
  }
  return wordBlobs;
}

// ----------------------------------------------------------------------------
// exporting

async function _doExport(blobs: Blob[], format: 'gif' | 'webp') {
  if (blobs.length === 1) {
    // export as-is
    FileSaver.saveAs(blobs[0]!, `sitemaketext-words.${format}`);
  } else {
    // export as .zip; yes this format is trash, but it's still a bigger default than much better stuff like .tar.gz...
    // yes i'm kinda sad about that now that i (sort-of) know how terrible it is :c
    // https://web.archive.org/web/20250118102842/https://games.greggman.com/game/zip-rant/
    const jsZip = new JSZip();
    blobs.forEach((wb, i) => jsZip.file(`sitemaketext-word-${i}.${format}`, wb));
    const zipFile = await jsZip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(zipFile, 'sitemaketext-words.zip');
  }
}
