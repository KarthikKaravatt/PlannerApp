import { type Task, TaskSchema } from "@/schemas/taskList";
const apiURL: string | undefined = import.meta.env.VITE_BACKEND_APP_API_URL;

export async function getTaskFromID(taskID: string): Promise<Task> {
	if (apiURL === undefined) {
		throw new Error("End point url is not defined");
	}
	const url = `${apiURL}/${taskID}`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			const errorDetails = await response.text().catch(() => "N/A");
			throw new Error(
				`HTTP error status: ${response.status.toString()}, statusText: ${response.statusText}, details: ${errorDetails}`,
			);
		}
		const data: unknown = await response.json();
		try {
			return TaskSchema.parse(data);
		} catch (parseError) {
			console.error("Error parsing task data:", parseError);
			const errorMessage =
				parseError instanceof Error
					? parseError.message
					: "Uknown parsing error";
			throw new Error(`Error parsing or validating task data: ${errorMessage}`);
		}
	} catch (fetchError) {
		console.error(`Error fetching task with ID ${taskID}:`, fetchError);
		const errorMessage =
			fetchError instanceof Error
				? fetchError.message
				: "Uknown fetching error";
		throw new Error(`Failed to fetch task with ID ${taskID}: ${errorMessage}`);
	}
}

export async function getAllTasks(): Promise<Task[]> {
	if (apiURL === undefined) {
		throw new Error("Api url is undefined");
	}
	const url = apiURL;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status.toString()}`);
		}
		const json: unknown = await response.json();
		try {
			const taskArray = TaskSchema.array();
			return taskArray.parse(json);
		} catch (parseError) {
			console.error("Error prasing or validating tasks", parseError);
			const errorMessage =
				parseError instanceof Error
					? parseError.message
					: "Uknown parsing error";
			throw new Error(`Error parsing or validating task data: ${errorMessage}`);
		}
	} catch (fetchError) {
		console.error("Error fetching tasks", fetchError);
		const errorMessage =
			fetchError instanceof Error ? fetchError.message : "Uknown parsing error";
		throw new Error(`Error parsing or validating task data: ${errorMessage}`);
	}
}

export async function addTask(task: Task) {
	if (apiURL === undefined) {
		throw new Error("Api url is undefined");
	}
	const url = `${apiURL}/`;
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(task),
		});
		if (!response.ok) {
			console.error(`HTTP Error status:${response.status.toString()}`);
			throw new Error("Error geting response");
		}
		const reply: unknown = await response.json();
		console.log(reply);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error adding task:${error}`);
		}
		throw new Error("Uknown Error");
	}
}
export async function removeTask(id: string) {
	if (apiURL === undefined) {
		throw new Error("Api url is undefined");
	}
	const url = `${apiURL}/${id}`;
	try {
		const response = await fetch(url, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
			},
		});
		if (!response.ok) {
			console.error(`HTTP Error status:${response.status.toString()}`);
			throw new Error("Error getting response");
		}
		const reply = await response.text();
		console.log(reply);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error removing task${error}`);
		}
		throw new Error("Uknown error");
	}
}
export async function changeTask(task: Task) {
	if (apiURL === undefined) {
		throw new Error("Api url is undefined");
	}
	const url = `${apiURL}/${task.id}`;
	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				Label: task.label,
				Completed: task.completed,
				DueDate: task.dueDate,
			}),
		});
		if (!response.ok) {
			console.error(`HTTP Error status:${response.status.toString()}`);
			throw new Error("Error getting response");
		}
		const reply = await response.text();
		console.log(reply);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error removing task${error}`);
		}
		throw new Error("Uknown Error");
	}
}

export async function swapTasks(id1: string, id2: string) {
	if (apiURL === undefined) {
		throw new Error("Api url is not defined");
	}
	const url = `${apiURL}/${id1}/${id2}`;
	try {
		const response = await fetch(url, {
			method: "PUT",
		});
		if (!response.ok) {
			console.error(`HTTP Error status:${response.status.toString()}`);
			throw new Error("Error getting response");
		}
		const reply = await response.text();
		console.log(reply);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error swapping tasks:${error}`);
		}
		throw new Error("Uknown error");
	}
}
