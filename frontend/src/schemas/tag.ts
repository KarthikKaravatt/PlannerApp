import { z } from "zod";

const MAX_LIGHTNESSS = 100;

export const colourSchema = z.object({
  l: z.float32().min(0).max(MAX_LIGHTNESSS),
  c: z.float32().min(0),
  h: z.float32().min(0),
});

export const tagSchmea = z.object({
  id: z.uuidv7(),
  name: z.string(),
  color: colourSchema,
});
export type Tag = z.infer<typeof tagSchmea>;

export type Colour = z.infer<typeof colourSchema>;
