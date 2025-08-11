import { z } from "zod";

const MAX_LIGHTNESSS = 100;

export const colourSchema = z.object({
  l: z.number().min(0).max(MAX_LIGHTNESSS),
  c: z.number().min(0),
  h: z.number().min(0),
});

export const tagSchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  colour: colourSchema,
});

export type Tag = z.infer<typeof tagSchema>;

export type Colour = z.infer<typeof colourSchema>;
