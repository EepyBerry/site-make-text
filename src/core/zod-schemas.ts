import * as z from 'zod/mini';

export const JsonSpritesheetDescriptorSchema = z.looseObject({
  wordmap: z.record(z.string(), z.string()),
  regions: z.record(
    z.string(),
    z.array(
      z.looseObject({
        x: z.number(),
        y: z.number(),
      }),
    ),
  ),
});
