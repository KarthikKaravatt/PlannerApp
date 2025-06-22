/** biome-ignore-all lint/suspicious/noConsole: Only enabled in dev mode*/
const isDev = import.meta.env.DEV;

export function logError(messsage: string, error?: Error) {
  if (isDev) {
    console.error(messsage, error);
  }
}

export function logMessage(messsage: string) {
  if (isDev) {
    console.log(messsage);
  }
}
export function logWarning(messsage: string) {
  if (isDev) {
    console.warn(messsage);
  }
}
