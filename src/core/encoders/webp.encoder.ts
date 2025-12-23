import WebXMux, { type Frame } from "webpxmux";
import type { ImageDataEncoder } from "./encoder";
import { FRAME_DURATION_MS } from "../globals";

export default class WebPImageDataEncoder implements ImageDataEncoder<ArrayBuffer> {
  private webpxmux = WebXMux("/wasm/webpxmux.wasm");
  private runtimeReady: boolean = false

  public async encodeAsync(frames: ImageData[], imageSize: number): Promise<ArrayBuffer> {
    if (!this.runtimeReady) {
      await this.webpxmux.waitRuntime()
    }

    const xmuxFrames: Frame[] = frames.map(f => ({
      duration: FRAME_DURATION_MS,
      isKeyframe: false,
      rgba: new Uint32Array(f.data.buffer)
    } as Frame));
    return (await this.webpxmux.encodeFrames({
      frameCount: 3,
      width: imageSize,
      height: imageSize,
      loopCount: 0,
      bgColor: 0, //0x00000000 as 0xRRGGBBAA
      frames: xmuxFrames
    })).buffer as ArrayBuffer
  }
}
