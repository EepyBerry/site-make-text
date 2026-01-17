export function loadImage(src: string, loadCallback?: () => void): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      loadCallback?.();
      resolve(img);
    };
    img.onabort = reject;
    img.onerror = reject;
    img.oncancel = reject;
    img.src = src;
  });
}

export async function drawImageOntoCanvas(
  file: ImageBitmapSource,
  canvasCallback: (canvas: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D) => void,
): Promise<void> {
  try {
    const bmp = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' })!;
    ctx.drawImage(bmp, 0, 0);
    ctx.imageSmoothingEnabled = false;
    canvasCallback(canvas, ctx);
  } catch (err) {
    console.error(err);
  }
}
