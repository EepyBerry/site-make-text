import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { ImageDataEncoder } from './encoder';
import { FRAME_DURATION_MS } from '../globals';

export default class GIFImageDataEncoder implements ImageDataEncoder<ArrayBuffer> {
  public encode(frames: ImageData[], width: number, height: number): ArrayBuffer {
    const gifEncoder = new GIFEncoder();
    let framePalette, frameIndex;

    for (let i = 0; i < frames.length; i++) {
      framePalette = quantize(frames[i]!.data, 256, { format: 'rgba4444', oneBitAlpha: true });
      frameIndex = applyPalette(frames[i]!.data, framePalette, 'rgba4444');
      gifEncoder.writeFrame(frameIndex, width, height, {
        first: i === 0,
        transparent: true,
        transparentIndex: framePalette.findIndex((p: number[]) => p[3] === 0),
        delay: FRAME_DURATION_MS,
        palette: framePalette,
      });
    }
    gifEncoder.finish();
    return gifEncoder.bytesView().buffer;
  }
}
