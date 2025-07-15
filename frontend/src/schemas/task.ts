import { parseAbsoluteToLocal } from "@internationalized/date";
import { z } from "zod";

const baseTaskSchema = z.object({
  id: z.uuidv7(),
  label: z.string(),
  completed: z.boolean(),
});
export const taskResponseDateSchema = baseTaskSchema.extend({
  dueDate: z.string().refine(
    (dateString) => {
      try {
        parseAbsoluteToLocal(dateString);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Date string is not a valid ISO date",
    },
  ),
});

export const taskResponseNoDateSchema = baseTaskSchema.extend({});

export const taskResponseSchema = z.union([
  taskResponseDateSchema,
  taskResponseNoDateSchema,
]);

const taskDateSchema = taskResponseDateSchema.extend({
  kind: z.literal("withDate"),
});
const taskWithoutDateSchema = taskResponseNoDateSchema.extend({
  kind: z.literal("withoutDate"),
});
export const taskSchemea = z.union([taskDateSchema, taskWithoutDateSchema]);

export const taskOrderSchema = z.object({
  id: z.readonly(z.uuidv7()),
  orderIndex: z.uint32(),
});

export type TaskOrder = z.infer<typeof taskOrderSchema>;

export type TaskResponse = z.infer<typeof taskResponseSchema>;

export type Task = z.infer<typeof taskSchemea>;
