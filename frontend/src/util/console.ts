const isDev = import.meta.env.DEV;

export function logError(messsage: string, error?: Error) {
	if (isDev) {
		// biome-ignore lint/suspicious/noConsole: Only done in dev
		console.error(messsage, error);
	}
}

export function logMessage(messsage: string) {
	if (isDev) {
		// biome-ignore lint/suspicious/noConsole: Only done in dev
		// biome-ignore lint/suspicious/noConsoleLog: Only done in dev
		console.log(messsage);
	}
}
export function logWarning(messsage: string) {
	if (isDev) {
		// biome-ignore lint/suspicious/noConsole: Only done in dev
		// biome-ignore lint/suspicious/noConsoleLog: Only done in dev
		console.warn(messsage);
	}
}
