import { DateTime } from "luxon";
import { z } from "zod/v4";
const BaseTaskSchema = z.object({
	id: z.uuidv7(),
	label: z.string(),
	completed: z.boolean(),
	orderIndex: z.uint32(),
});
export const TaskResponseDateSchema = BaseTaskSchema.extend({
	dueDate: z
		.string()
		.refine((dateString) => DateTime.fromISO(dateString).isValid, {
			message: "Date string is not a valid ISO date",
		}),
});

export const TaskResponseNoDateSchema = BaseTaskSchema.extend({});

export const ApiResponseTaskSchema = z.union([
	TaskResponseDateSchema,
	TaskResponseNoDateSchema,
]);

type TaskWithDate = z.infer<typeof TaskResponseDateSchema> & {
	kind: "withDate";
};

type TaskWithoutDate = z.infer<typeof TaskResponseNoDateSchema> & {
	kind: "withoutDate";
};

export type Task = TaskWithDate | TaskWithoutDate;
