import { parseAbsoluteToLocal } from "@internationalized/date";
import { uuidv7, z } from "zod/v4";

export const TaskListSchema = z.object({
	id: uuidv7(),
	name: z.string(),
	orderIndex: z.uint32(),
});

export type TaskList = z.infer<typeof TaskListSchema>;
const BaseTaskSchema = z.object({
	id: z.uuidv7(),
	label: z.string(),
	completed: z.boolean(),
});
export const TaskResponseDateSchema = BaseTaskSchema.extend({
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

export const TaskResponseNoDateSchema = BaseTaskSchema.extend({});

export const ApiResponseTaskSchema = z.union([
	TaskResponseDateSchema,
	TaskResponseNoDateSchema,
]);

export type TaskResponse = z.infer<typeof ApiResponseTaskSchema>;

type TaskWithDate = z.infer<typeof TaskResponseDateSchema> & {
	kind: "withDate";
};

type TaskWithoutDate = z.infer<typeof TaskResponseNoDateSchema> & {
	kind: "withoutDate";
};

export type Task = TaskWithDate | TaskWithoutDate;

export const TaskOrderSchema = z.object({
	id: z.uuidv7(),
	orderIndex: z.uint32(),
});

export type TaskOrder = z.infer<typeof TaskOrderSchema>;
