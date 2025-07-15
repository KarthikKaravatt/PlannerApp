export function arrayToRecord<T extends { id: string }>(
  arr: T[],
): Record<string, T | undefined> {
  const record: Record<string, T> = {};
  for (const item of arr) {
    record[item.id] = item;
  }
  return record;
}
