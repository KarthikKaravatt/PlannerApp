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

export type TaskResponse = z.infer<typeof taskResponseSchema>;

type TaskWithDate = z.infer<typeof taskResponseDateSchema> & {
  kind: "withDate";
};

type TaskWithoutDate = z.infer<typeof taskResponseNoDateSchema> & {
  kind: "withoutDate";
};

export type Task = TaskWithDate | TaskWithoutDate;

export const taskOrderSchema = z.object({
  id: z.readonly(z.uuidv7()),
  orderIndex: z.uint32(),
});

export type TaskOrder = z.infer<typeof taskOrderSchema>;
