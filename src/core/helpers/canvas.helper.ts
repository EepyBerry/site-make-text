export function combineCanvasData(
  data: ImageData[],
  targetWidth: number,
  targetHeight: number,
  cellWidth: number,
): ImageData {
  const canvas: OffscreenCanvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot combine canvas data: context was not properly initialized');

  let offsetX = 0;
  for (let i = 0; i < data.length; i++) {
    offsetX = cellWidth * i;
    ctx.putImageData(data[i]!, offsetX, 0);
  }
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}
