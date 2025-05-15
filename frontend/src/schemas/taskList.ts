import { DateTime } from "luxon";
import { z } from "zod";
export const TaskSchema = z.object({
	id: z.string(),
	label: z.string(),
	completed: z.boolean(),
	dueDate: z
		.string()
		.refine((dateString) => DateTime.fromISO(dateString).isValid, {
			message: "Date string is not a valid ISO date",
		}),
	orderIndex: z.uint32(),
});

export type Task = z.infer<typeof TaskSchema>;
