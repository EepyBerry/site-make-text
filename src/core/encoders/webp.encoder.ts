import type { ImageDataEncoder } from './encoder';
import { FRAME_DURATION_MS } from '../globals';
import * as WebP from 'node-webpmux';

export default class WebPImageDataEncoder implements ImageDataEncoder<ArrayBuffer> {
  private isInternalLibraryReady: boolean = false;

  public async encodeAsync(frames: ImageData[], imageSize: number): Promise<ArrayBuffer> {
    if (!this.isInternalLibraryReady) {
      await WebP.Image.initLib();
      this.isInternalLibraryReady = true;
    }
    const webp = await WebP.Image.getEmptyImage(true);
    webp.convertToAnim();

    const amfPixels: Buffer = Buffer.alloc(imageSize * imageSize * 4);
    for (let i = 0; i < frames.length; i++) {
      // bufferize image data (using Buffer polyfill)
      const frameData = frames[i]!.data;
      amfPixels.set(frameData);

      // create WebP image from buffer
      const amfImg = await WebP.Image.getEmptyImage(false);
      await amfImg.setImageData(amfPixels, {
        width: imageSize,
        height: imageSize,
        lossless: 9,
        exact: true,
        bgColor: [0, 0, 0, 0],
      });

      // create new AMF frame from image
      const amfFrame = await WebP.Image.generateFrame({
        buffer: await amfImg.save(null, { bgColor: [0, 0, 0, 0] }),
        x: 0,
        y: 0,
        blend: false,
      });
      webp.frames.push(amfFrame);
    }
    return await webp.save(null, {
      width: imageSize,
      height: imageSize,
      bgColor: [0, 0, 0, 0],
      delay: FRAME_DURATION_MS,
    });
  }
}
