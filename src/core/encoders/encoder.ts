export interface ImageDataEncoder<R> {
  encode?: (frames: ImageData[], imageSize: number) => R
  encodeAsync?: (frames: ImageData[], imageSize: number) => Promise<R>
}
