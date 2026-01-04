import type { ImageDataEncoder } from './encoder';
import { FRAME_DURATION_MS } from '../globals';
import * as WebP from 'node-webpmux';

export default class WebPImageDataEncoder implements ImageDataEncoder<ArrayBuffer> {
  private isInternalLibraryReady: boolean = false;

  public async encodeAsync(
    frames: ImageData[],
    width: number,
    height: number,
  ): Promise<ArrayBuffer> {
    if (!this.isInternalLibraryReady) {
      console.log('<SiteMakeText> Initializing webpmux.wasm...');
      await WebP.Image.initLib();
      this.isInternalLibraryReady = true;
      console.log('<SiteMakeText> WebP encoder ready!');
    }
    const webp = await WebP.Image.getEmptyImage(true);
    webp.convertToAnim();

    const amfPixels: Buffer = Buffer.alloc(width * height * 4);
    for (let i = 0; i < frames.length; i++) {
      // bufferize image data (using Buffer polyfill)
      const frameData = frames[i]!.data;
      amfPixels.set(frameData);

      // create WebP image from buffer
      const amfImg = await WebP.Image.getEmptyImage(false);
      await amfImg.setImageData(amfPixels, {
        width,
        height,
        lossless: 5,
        method: 6,
        exact: true,
        advanced: {
          segments: 1,
          alphaFiltering: 0,
          alphaQuality: 0,
        }
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
      width,
      height,
      bgColor: [0, 0, 0, 0],
      delay: FRAME_DURATION_MS,
    });
  }
}
