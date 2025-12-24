export interface ImageDataEncoder<R> {
  encode?: (frames: ImageData[], width: number, height: number) => R;
  encodeAsync?: (frames: ImageData[], width: number, height: number) => Promise<R>;
}
