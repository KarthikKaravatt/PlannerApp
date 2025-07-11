import { uuidv7, z } from "zod";

export const taskListSchema = z.object({
  id: z.readonly(uuidv7()),
  name: z.string(),
});

export const taskListOrderSchema = z.object({
  id: z.readonly(uuidv7()),
  orderIndex: z.uint32(),
});

export type TaskList = z.infer<typeof taskListSchema>;

export type TaskListOrder = z.infer<typeof taskListOrderSchema>;
