import * as z from "zod/mini";

export const JsonSpritesheetDescriptorSchema = z.looseObject({
  wordmap: z.record(z.string(), z.string()),
  regions: z.record(
    z.string(),
    z.array(z.strictObject({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number()
    }))
  )
})
